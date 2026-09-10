#!/usr/bin/env python3
"""Automated Smoke Verification Script for DashBite Food Delivery Baseline Demo.

Usage:
  python3 verify_server.py [port]
"""

import sys
import urllib.error
import urllib.request

DEFAULT_PORT = 8002


def check_url(url, description, expected_strings=None):
  print(f'Checking {description} ({url})...', end=' ')
  try:
    req = urllib.request.Request(url, headers={'User-Agent': 'DashBiteVerifier/1.0'})
    with urllib.request.urlopen(req, timeout=5) as response:
      status = response.getcode()
      content = response.read().decode('utf-8', errors='ignore')

      if status != 200:
        print(f'❌ FAILED (Status: {status})')
        return False

      if expected_strings:
        for s in expected_strings:
          if s not in content:
            print(f'❌ FAILED (Missing expected content: "{s}")')
            return False

      print(f'✅ OK ({len(content)} bytes)')
      return True
  except Exception as e:
    print(f'❌ ERROR ({e})')
    return False


def main():
  port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
  base_url = f'http://localhost:{port}'

  print('============================================================')
  print(f'  Verifying DashBite Storefront at {base_url}')
  print('============================================================')

  checks = [
      (
          f'{base_url}/healthz',
          'Healthcheck API',
          ['"status": "healthy"', 'dashbite-delivery-demo'],
      ),
      (
          f'{base_url}/index.html',
          'Landing Page',
          ['DashBite', 'brandLogoLink', 'categoryCarouselList', 'restaurantGrid'],
      ),
      (f'{base_url}/css/main.css', 'Main Stylesheet', ['--dash-red']),
      (
          f'{base_url}/css/components.css',
          'Components Stylesheet',
          ['position-anchor', 'color-mix'],
      ),
      (
          f'{base_url}/js/app.js',
          'App Controller Script',
          ['document.startViewTransition', 'RESTAURANTS'],
      ),
      (
          f'{base_url}/js/restaurants.js',
          'Restaurant Data Module',
          ['Artisan Burger Foundry', 'Sakura Omakase'],
      ),
      (f'{base_url}/assets/images/brand-logo.svg', 'Brand Logo Vector', ['<svg']),
      (f'{base_url}/assets/images/hero-banner.jpg', 'Hero Banner Asset', None),
      (f'{base_url}/assets/images/burger.jpg', 'Burger Asset', None),
      (f'{base_url}/assets/images/sushi.jpg', 'Sushi Asset', None),
      (f'{base_url}/assets/images/pizza.jpg', 'Pizza Asset', None),
      (f'{base_url}/assets/images/tacos.jpg', 'Tacos Asset', None),
  ]

  passed = 0
  for url, desc, expected in checks:
    if check_url(url, desc, expected):
      passed += 1

  print('============================================================')
  print(f'  Summary: {passed}/{len(checks)} checks passed.')
  if passed == len(checks):
    print('  🎉 ALL VERIFICATION CHECKS PASSED!')
    print('============================================================')
    sys.exit(0)
  else:
    print('  ❌ SOME CHECKS FAILED.')
    print('============================================================')
    sys.exit(1)


if __name__ == '__main__':
  main()
