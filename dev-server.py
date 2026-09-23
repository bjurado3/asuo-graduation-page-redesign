#!/usr/bin/env python3
"""
Local static file server for previewing this page — identical to
`python3 -m http.server`, except it tells the browser never to cache
anything. Plain http.server relies on browser heuristic caching (based on
Last-Modified), which was serving stale CSS/JS during development even after
a hard reload. Not needed for the real deployed site — this is dev-only.
"""
import http.server
import socketserver

PORT = 4173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), NoCacheHandler) as httpd:
        httpd.allow_reuse_address = True
        httpd.serve_forever()
