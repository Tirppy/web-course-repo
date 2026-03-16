import unittest

from Lab5.go2web import SearchResultParser, clean_duckduckgo_url, decode_chunked, normalize_url, render_html


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


if __name__ == "__main__":
    unittest.main()
