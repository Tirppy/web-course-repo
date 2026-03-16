#!/usr/bin/env python3
from __future__ import annotations

import argparse
import hashlib
import html
import json
import re
import socket
import ssl
import sys
import time
from dataclasses import dataclass
from html.parser import HTMLParser
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, quote_plus, unquote, urljoin, urlparse


DEFAULT_USER_AGENT = "go2web/1.0"
DEFAULT_ACCEPT = "text/html,application/json;q=0.9,text/plain;q=0.8,*/*;q=0.5"
SEARCH_ENDPOINT = "https://html.duckduckgo.com/html/?q={query}"
MAX_REDIRECTS = 5
DEFAULT_CACHE_TTL = 300
CACHE_DIR = Path(__file__).resolve().parent / ".cache"
REDIRECT_CODES = {301, 302, 303, 307, 308}


@dataclass
class HttpResponse:
    status_code: int
    reason: str
    headers: dict[str, str]
    body: bytes
    url: str
    from_cache: bool = False

    @property
    def content_type(self) -> str:
        value = self.headers.get("content-type", "")
        return value.split(";", 1)[0].strip().lower()

    @property
    def charset(self) -> str:
        value = self.headers.get("content-type", "")
        match = re.search(r"charset=([\w\-]+)", value, re.IGNORECASE)
        return match.group(1) if match else "utf-8"


@dataclass
class SearchResult:
    title: str
    url: str
    snippet: str


class Go2WebError(Exception):
    pass


class TextExtractor(HTMLParser):
    BLOCK_TAGS = {
        "article",
        "aside",
        "blockquote",
        "br",
        "div",
        "footer",
        "form",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "header",
        "hr",
        "li",
        "main",
        "nav",
        "ol",
        "p",
        "pre",
        "section",
        "table",
        "td",
        "th",
        "tr",
        "ul",
    }
    SKIP_TAGS = {"script", "style", "noscript"}

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.parts: list[str] = []
        self.skip_depth = 0

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag in self.SKIP_TAGS:
            self.skip_depth += 1
        if self.skip_depth == 0 and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in self.SKIP_TAGS and self.skip_depth > 0:
            self.skip_depth -= 1
        if self.skip_depth == 0 and tag in self.BLOCK_TAGS:
            self.parts.append("\n")

    def handle_data(self, data: str) -> None:
        if self.skip_depth == 0 and data.strip():
            self.parts.append(data)

    def get_text(self) -> str:
        text = html.unescape("".join(self.parts))
        text = text.replace("\r", "")
        lines = [re.sub(r"\s+", " ", line).strip() for line in text.split("\n")]
        cleaned: list[str] = []
        for line in lines:
            if not line:
                continue
            if cleaned and cleaned[-1] == line:
                continue
            cleaned.append(line)
        return "\n".join(cleaned)


class SearchResultParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.results: list[SearchResult] = []
        self.in_title = False
        self.in_snippet = False
        self.snippet_target: SearchResult | None = None
        self.current_href = ""
        self.current_title: list[str] = []
        self.current_snippet: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attrs_dict = dict(attrs)
        classes = attrs_dict.get("class", "") or ""
        if tag == "a" and "result__a" in classes:
            self.in_title = True
            self.current_href = attrs_dict.get("href", "") or ""
            self.current_title = []
            self.current_snippet = []
        elif tag in {"a", "div"} and (
            "result__snippet" in classes or "result__body" in classes
        ):
            self.in_snippet = True
            self.current_snippet = []
            self.snippet_target = self.results[-1] if self.results else None

    def handle_endtag(self, tag: str) -> None:
        if tag == "a" and self.in_title:
            self.in_title = False
            title = clean_text("".join(self.current_title))
            url = clean_duckduckgo_url(self.current_href)
            snippet = clean_text("".join(self.current_snippet))
            if title and url and not any(item.url == url for item in self.results):
                result = SearchResult(title=title, url=url, snippet=snippet)
                self.results.append(result)
                self.snippet_target = result
        if tag in {"a", "div"} and self.in_snippet:
            if self.snippet_target is not None and not self.snippet_target.snippet:
                self.snippet_target.snippet = clean_text("".join(self.current_snippet))
            self.in_snippet = False
            self.snippet_target = None

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.current_title.append(data)
        elif self.in_snippet:
            self.current_snippet.append(data)


def configure_stdio() -> None:
    for name in ("stdout", "stderr"):
        stream = getattr(sys, name, None)
        if stream is not None and hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8", errors="replace")


def clean_text(value: str) -> str:
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def normalize_url(url: str) -> str:
    candidate = url.strip()
    if not candidate:
        raise Go2WebError("URL is required")
    if "://" not in candidate:
        candidate = f"https://{candidate}"
    parsed = urlparse(candidate)
    if parsed.scheme not in {"http", "https"}:
        raise Go2WebError("Only http:// and https:// URLs are supported")
    if not parsed.netloc:
        raise Go2WebError("URL must include a host")
    path = parsed.path or "/"
    rebuilt = parsed._replace(path=path)
    return rebuilt.geturl()


def decode_chunked(body: bytes) -> bytes:
    index = 0
    decoded = bytearray()
    while True:
        line_end = body.find(b"\r\n", index)
        if line_end == -1:
            raise Go2WebError("Invalid chunked response")
        chunk_size = body[index:line_end].split(b";", 1)[0]
        size = int(chunk_size.decode("ascii"), 16)
        index = line_end + 2
        if size == 0:
            return bytes(decoded)
        decoded.extend(body[index:index + size])
        index += size + 2


def cache_path_for(url: str) -> Path:
    digest = hashlib.sha256(url.encode("utf-8")).hexdigest()
    return CACHE_DIR / f"{digest}.json"


def load_cache(url: str) -> HttpResponse | None:
    path = cache_path_for(url)
    if not path.exists():
        return None
    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    if payload.get("expires_at", 0) < time.time():
        return None
    return HttpResponse(
        status_code=payload["status_code"],
        reason=payload["reason"],
        headers=payload["headers"],
        body=bytes.fromhex(payload["body_hex"]),
        url=payload.get("url", url),
        from_cache=True,
    )


def save_cache(response: HttpResponse) -> None:
    if response.status_code != 200:
        return
    CACHE_DIR.mkdir(exist_ok=True)
    path = cache_path_for(response.url)
    payload = {
        "status_code": response.status_code,
        "reason": response.reason,
        "headers": response.headers,
        "body_hex": response.body.hex(),
        "url": response.url,
        "expires_at": time.time() + DEFAULT_CACHE_TTL,
    }
    path.write_text(json.dumps(payload), encoding="utf-8")


def receive_all(sock: socket.socket) -> bytes:
    chunks: list[bytes] = []
    while True:
        data = sock.recv(65536)
        if not data:
            break
        chunks.append(data)
    return b"".join(chunks)


def parse_http_response(raw: bytes, url: str) -> HttpResponse:
    header_blob, separator, body = raw.partition(b"\r\n\r\n")
    if not separator:
        raise Go2WebError("Invalid HTTP response")
    lines = header_blob.decode("iso-8859-1", errors="replace").split("\r\n")
    try:
        _, status_code, reason = lines[0].split(" ", 2)
    except ValueError as exc:
        raise Go2WebError("Invalid HTTP status line") from exc
    headers: dict[str, str] = {}
    for line in lines[1:]:
        if not line or ":" not in line:
            continue
        name, value = line.split(":", 1)
        headers[name.strip().lower()] = value.strip()
    if headers.get("transfer-encoding", "").lower() == "chunked":
        body = decode_chunked(body)
    return HttpResponse(int(status_code), reason, headers, body, url)


def build_request(parsed: Any) -> bytes:
    target = parsed.path or "/"
    if parsed.query:
        target += f"?{parsed.query}"
    headers = [
        f"GET {target} HTTP/1.1",
        f"Host: {parsed.netloc}",
        f"User-Agent: {DEFAULT_USER_AGENT}",
        f"Accept: {DEFAULT_ACCEPT}",
        "Connection: close",
        "Accept-Encoding: identity",
        "",
        "",
    ]
    return "\r\n".join(headers).encode("ascii")


def fetch_url(url: str, redirects_left: int = MAX_REDIRECTS) -> HttpResponse:
    normalized = normalize_url(url)
    cached = load_cache(normalized)
    if cached is not None:
        return cached

    parsed = urlparse(normalized)
    port = parsed.port or (443 if parsed.scheme == "https" else 80)

    with socket.create_connection((parsed.hostname, port), timeout=15) as connection:
        if parsed.scheme == "https":
            context = ssl.create_default_context()
            with context.wrap_socket(connection, server_hostname=parsed.hostname) as secure:
                secure.sendall(build_request(parsed))
                raw = receive_all(secure)
        else:
            connection.sendall(build_request(parsed))
            raw = receive_all(connection)

    response = parse_http_response(raw, normalized)
    if response.status_code in REDIRECT_CODES:
        if redirects_left <= 0:
            raise Go2WebError("Too many redirects")
        location = response.headers.get("location")
        if not location:
            raise Go2WebError("Redirect response missing Location header")
        return fetch_url(urljoin(normalized, location), redirects_left - 1)

    save_cache(response)
    return response


def render_html(body: bytes, charset: str = "utf-8") -> str:
    extractor = TextExtractor()
    extractor.feed(body.decode(charset, errors="replace"))
    return extractor.get_text()


def render_response(response: HttpResponse) -> str:
    content_type = response.content_type
    if content_type == "application/json":
        try:
            payload = json.loads(response.body.decode(response.charset, errors="replace"))
            rendered = json.dumps(payload, indent=2, ensure_ascii=False)
        except json.JSONDecodeError:
            rendered = response.body.decode(response.charset, errors="replace")
    elif content_type in {"text/plain", "text/markdown"}:
        rendered = response.body.decode(response.charset, errors="replace").strip()
    elif content_type in {"text/html", "application/xhtml+xml", ""}:
        rendered = render_html(response.body, response.charset)
    else:
        rendered = response.body.decode(response.charset, errors="replace").strip()

    if response.from_cache and rendered:
        return f"[cached]\n{rendered}"
    return rendered


def clean_duckduckgo_url(url: str) -> str:
    if not url:
        return ""
    if url.startswith("//"):
        url = f"https:{url}"
    parsed = urlparse(url)
    query = parse_qs(parsed.query)
    uddg = query.get("uddg")
    if uddg:
        return unquote(uddg[0])
    if url.startswith("/"):
        return "https://html.duckduckgo.com" + url
    return url


def search(query_parts: list[str]) -> list[SearchResult]:
    query = " ".join(query_parts).strip()
    if not query:
        raise Go2WebError("Search term is required")
    response = fetch_url(SEARCH_ENDPOINT.format(query=quote_plus(query)))
    parser = SearchResultParser()
    parser.feed(response.body.decode(response.charset, errors="replace"))
    return parser.results[:10]


def format_results(results: list[SearchResult]) -> str:
    lines: list[str] = []
    for index, result in enumerate(results, start=1):
        lines.append(f"{index}. {result.title}")
        lines.append(f"   {result.url}")
        if result.snippet:
            lines.append(f"   {result.snippet}")
    return "\n".join(lines)


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="go2web",
        description="Fetch web pages or search the web using a socket-based HTTP client.",
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("-u", "--url", help="Fetch a URL and print a readable response")
    group.add_argument(
        "-s",
        "--search",
        nargs="+",
        help="Search the web and print the top 10 results",
    )
    parser.add_argument(
        "--open",
        type=int,
        metavar="N",
        help="After -s, fetch result number N and print its readable content",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    configure_stdio()
    parser = build_parser()
    args = parser.parse_args(argv)

    try:
        if args.url:
            if args.open is not None:
                raise Go2WebError("--open can only be used together with -s")
            print(render_response(fetch_url(args.url)))
            return 0

        results = search(args.search)
        if args.open is None:
            print(format_results(results))
            return 0

        if not 1 <= args.open <= len(results):
            raise Go2WebError(f"Choose a result number between 1 and {len(results)}")
        selected = results[args.open - 1]
        print(render_response(fetch_url(selected.url)))
        return 0
    except (Go2WebError, OSError, ssl.SSLError, socket.error) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
