#!/usr/bin/env python3
"""DashBite Food Delivery Demo Server (Baseline 2024 Optimized Edition).

Usage:
  python3 server.py [port]
"""

import http.server
import os
import socketserver
import sys

DEFAULT_PORT = 8003
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class DashBiteHandler(http.server.SimpleHTTPRequestHandler):

  def __init__(self, *args, **kwargs):
    super().__init__(*args, directory=DIRECTORY, **kwargs)

  def end_headers(self):
    self.send_header('Access-Control-Allow-Origin', '*')
    self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
    super().end_headers()

  def do_GET(self):
    if self.path == '/healthz':
      self.send_response(200)
      self.send_header('Content-type', 'application/json')
      self.end_headers()
      self.wfile.write(b'{"status": "healthy", "service": "dashbite-delivery-optimized", "baseline": "2024", "version": "2.0.0"}')
      return

    return super().do_GET()


def main():
  port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
  socketserver.TCPServer.allow_reuse_address = True
  with socketserver.TCPServer(('', port), DashBiteHandler) as httpd:
    print(f'================================================================')
    print(f'🍔 DashBite Delivery (Baseline 2024 Optimized) Server started!')
    print(f'📍 Local URL:     http://localhost:{port}')
    print(f'📍 Cloudtop URL:  http://shoaibdilawar.c.googlers.com:{port}')
    print(f'🔍 Healthcheck:   http://localhost:{port}/healthz')
    print(f'================================================================')
    try:
      httpd.serve_forever()
    except KeyboardInterrupt:
      print('\nShutting down DashBite server.')


if __name__ == '__main__':
  main()
