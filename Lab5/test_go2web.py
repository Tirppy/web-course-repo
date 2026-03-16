import unittest
from tempfile import TemporaryDirectory

from Lab5 import go2web
from Lab5.go2web import HttpResponse, SearchResultParser, clean_duckduckgo_url, decode_chunked, normalize_url, render_html, render_response


class Go2WebTests(unittest.TestCase):
    def test_normalize_url_adds_https(self) -> None:
        self.assertEqual(normalize_url("example.com"), "https://example.com/")

    def test_normalize_url_preserves_http(self) -> None:
        self.assertEqual(normalize_url("http://example.com/docs"), "http://example.com/docs")

    def test_decode_chunked(self) -> None:
        payload = b"4\r\nWiki\r\n5\r\npedia\r\n0\r\n\r\n"
        self.assertEqual(decode_chunked(payload), b"Wikipedia")

    def test_clean_duckduckgo_url(self) -> None:
        url = "/l/?kh=-1&uddg=https%3A%2F%2Fexample.com%2Fguide"
        self.assertEqual(clean_duckduckgo_url(url), "https://example.com/guide")

    def test_clean_duckduckgo_url_protocol_relative(self) -> None:
        url = "//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fguide"
        self.assertEqual(clean_duckduckgo_url(url), "https://example.com/guide")

    def test_render_html(self) -> None:
        html_body = b"<html><body><h1>Title</h1><p>Hello <b>world</b></p></body></html>"
        self.assertEqual(render_html(html_body), "Title\nHello world")

    def test_search_result_parser(self) -> None:
        parser = SearchResultParser()
        parser.feed(
            '<a class="result__a" href="/l/?uddg=https%3A%2F%2Fexample.com">Example</a>'
            '<a class="result__snippet">Snippet text</a>'
        )
        self.assertEqual(len(parser.results), 1)
        self.assertEqual(parser.results[0].title, "Example")
        self.assertEqual(parser.results[0].url, "https://example.com")
        self.assertEqual(parser.results[0].snippet, "Snippet text")

    def test_render_response_marks_cached_output(self) -> None:
        response = HttpResponse(
            status_code=200,
            reason="OK",
            headers={"content-type": "text/plain; charset=utf-8"},
            body=b"cached text",
            url="https://example.com",
            from_cache=True,
        )
        self.assertEqual(render_response(response), "[cached]\ncached text")

    def test_load_cache_removes_expired_file(self) -> None:
        with TemporaryDirectory() as tmpdir:
            original_cache_dir = go2web.CACHE_DIR
            go2web.CACHE_DIR = go2web.Path(tmpdir)
            try:
                path = go2web.cache_path_for("https://example.com")
                path.write_text(
                    '{"status_code": 200, "reason": "OK", "headers": {}, '
                    '"body_hex": "", "url": "https://example.com", "expires_at": 0}',
                    encoding="utf-8",
                )
                self.assertIsNone(go2web.load_cache("https://example.com"))
                self.assertFalse(path.exists())
            finally:
                go2web.CACHE_DIR = original_cache_dir


if __name__ == "__main__":
    unittest.main()
