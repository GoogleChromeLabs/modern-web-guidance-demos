/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Cart API Client Module
 *
 * Wraps fetch against /api/cart endpoints with an 8-second AbortController
 * timeout, JSON parsing, and typed CartApiError instances.
 */

import { getStorefrontRootPrefix } from './products.js';

const REQUEST_TIMEOUT_MS = 8000;

function cartEndpoint(subpath = '') {
  return `${getStorefrontRootPrefix()}api/cart${subpath}`;
}

export class CartApiError extends Error {
  /**
   * @param {string} message
   * @param {{
   *   code: 'TIMEOUT_ERROR' | 'ABORT_ERROR' | 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'HTTP_ERROR',
   *   status?: number | null,
   *   details?: unknown,
   * }} options
   */
  constructor(message, { code, status = null, details = null } = {}) {
    super(message);
    this.name = 'CartApiError';
    this.code = code || 'HTTP_ERROR';
    this.status = status;
    this.details = details;
  }
}

let mockReadyPromise = null;

function ensureMockReadyIfDev() {
  if (import.meta.env.DEV) {
    if (!mockReadyPromise) {
      mockReadyPromise = import('./mocks/cartMock.js').then((mod) =>
        mod.startCartMockWorker()
      );
    }
    return mockReadyPromise;
  }
  return Promise.resolve();
}

async function requestJson(path, { method = 'GET', headers = {}, body, signal } = {}) {
  await ensureMockReadyIfDev();

  if (signal?.aborted) {
    throw new CartApiError('Request aborted by caller.', {
      code: 'ABORT_ERROR',
      status: null,
    });
  }

  const controller = new AbortController();
  let timedOut = false;

  const onCallerAbort = () => {
    controller.abort(signal.reason || 'CALLER_ABORT');
  };

  if (signal) {
    signal.addEventListener('abort', onCallerAbort, { once: true });
  }

  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort('TIMEOUT');
  }, REQUEST_TIMEOUT_MS);

  try {
    const requestHeaders = new Headers(headers);
    requestHeaders.set('Accept', 'application/json');

    let serializedBody;
    if (body !== undefined) {
      requestHeaders.set('Content-Type', 'application/json');
      serializedBody = JSON.stringify(body);
    }

    const response = await window.fetch(path, {
      method,
      headers: requestHeaders,
      body: serializedBody,
      signal: controller.signal,
    });

    let payload = null;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    }

    if (!response.ok) {
      const errorMessage =
        (payload && typeof payload.error === 'string' && payload.error) ||
        `Request failed with status ${response.status}.`;

      if (response.status === 400) {
        throw new CartApiError(errorMessage, {
          code: 'VALIDATION_ERROR',
          status: 400,
          details: payload,
        });
      }

      if (response.status >= 500) {
        throw new CartApiError(errorMessage, {
          code: 'SERVER_ERROR',
          status: response.status,
          details: payload,
        });
      }

      throw new CartApiError(errorMessage, {
        code: 'HTTP_ERROR',
        status: response.status,
        details: payload,
      });
    }

    return payload;
  } catch (err) {
    if (err instanceof CartApiError) {
      throw err;
    }

    if (timedOut) {
      throw new CartApiError('Request timed out after 8 seconds.', {
        code: 'TIMEOUT_ERROR',
        status: 408,
      });
    }

    if (signal?.aborted || err?.name === 'AbortError') {
      throw new CartApiError('Request aborted.', {
        code: 'ABORT_ERROR',
        status: null,
      });
    }

    throw new CartApiError(err?.message || 'Network error while communicating with cart API.', {
      code: 'NETWORK_ERROR',
      status: null,
    });
  } finally {
    window.clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onCallerAbort);
    }
  }
}

/**
 * Fetches the current cart state.
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ lines: Array<{ productId: string, variantId: string, quantity: number }>, updatedAt: string }>}
 */
export function getCart({ signal } = {}) {
  return requestJson(cartEndpoint(), { method: 'GET', signal });
}

/**
 * Adds a line item to the cart.
 * @param {{
 *   productId: string,
 *   variantId: string,
 *   quantity?: number,
 *   idempotencyKey?: string,
 *   signal?: AbortSignal,
 * }} params
 */
export function addCartLine({ productId, variantId, quantity = 1, idempotencyKey, signal }) {
  const headers = {};
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }
  return requestJson(cartEndpoint('/lines'), {
    method: 'POST',
    headers,
    body: { productId, variantId, quantity },
    signal,
  });
}

/**
 * Updates the quantity of a specific cart line.
 * @param {{
 *   productId: string,
 *   variantId: string,
 *   quantity: number,
 *   signal?: AbortSignal,
 * }} params
 */
export function updateCartLine({ productId, variantId, quantity, signal }) {
  const encodedProduct = encodeURIComponent(productId);
  const encodedVariant = encodeURIComponent(variantId);
  return requestJson(cartEndpoint(`/lines/${encodedProduct}/${encodedVariant}`), {
    method: 'PATCH',
    body: { quantity },
    signal,
  });
}

/**
 * Removes a line from the cart.
 * @param {{
 *   productId: string,
 *   variantId: string,
 *   signal?: AbortSignal,
 * }} params
 */
export function removeCartLine({ productId, variantId, signal }) {
  const encodedProduct = encodeURIComponent(productId);
  const encodedVariant = encodeURIComponent(variantId);
  return requestJson(cartEndpoint(`/lines/${encodedProduct}/${encodedVariant}`), {
    method: 'DELETE',
    signal,
  });
}

/**
 * Computes total item quantity across all cart lines.
 * @param {{ lines?: Array<{ quantity?: number }> } | null | undefined} cart
 * @returns {number}
 */
export function getCartItemCount(cart) {
  if (!cart || !Array.isArray(cart.lines)) return 0;
  return cart.lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
}

/**
 * Updates all header and mobile menu Bag (N) labels in the DOM.
 * @param {{ lines?: Array<{ quantity?: number }> } | null | undefined} cart
 */
export function syncBagCountElements(cart) {
  const count = getCartItemCount(cart);
  const label = `Bag (${count})`;
  document.querySelectorAll('[data-bag-trigger], a[href="#bag"]').forEach((el) => {
    if (el.textContent !== label) {
      el.textContent = label;
    }
  });
}

export const cartApi = {
  getCart,
  addLine: addCartLine,
  updateLine: updateCartLine,
  removeLine: removeCartLine,
  getCartItemCount,
  syncBagCountElements,
};
