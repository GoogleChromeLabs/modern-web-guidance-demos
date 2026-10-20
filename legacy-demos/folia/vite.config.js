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
      const productsMatch = pathname.match(/^(.*?)\/products(?:\/(.*))?$/);
      if (productsMatch) {
        const [, prefix, rest = ''] = productsMatch;
        if (rest && /\.[a-z0-9]+$/i.test(rest) && !rest.endsWith('.html')) {
          req.url = `${prefix}/${rest}${search ? `?${search}` : ''}`;
        } else {
          req.url = `${prefix}/product.html${search ? `?${search}` : ''}`;
        }
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
  base: './',
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
