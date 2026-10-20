/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig } from 'vite';
import { resolve } from 'path';

function productRouteRewrite() {
  const rewriteMiddleware = (req, _res, next) => {
    if (req.url) {
      const [pathname, search = ''] = req.url.split('?');
      if (
        pathname.startsWith('/products/') &&
        /\.[a-z0-9]+$/i.test(pathname) &&
        !pathname.endsWith('.html')
      ) {
        req.url = `${pathname.slice('/products'.length)}${search ? `?${search}` : ''}`;
      } else if (pathname === '/products' || pathname.startsWith('/products/')) {
        req.url = `/product.html${search ? `?${search}` : ''}`;
      }
    }
    next();
  };

  return {
    name: 'folia-product-route-rewrite',
    configureServer(server) {
      server.middlewares.use(rewriteMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(rewriteMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [productRouteRewrite()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        product: resolve(import.meta.dirname, 'product.html'),
      },
    },
  },
});
