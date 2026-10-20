/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Dev-Only MSW Mock Cart API
 *
 * Persists state in localStorage under "folia-mock-db".
 * Never imported or bundled in production builds (guarded by import.meta.env.DEV).
 */

import { http, HttpResponse, delay } from 'msw';
import { setupWorker } from 'msw/browser';
import {
  getProductById,
  getStorefrontRootPrefix,
  resolveProductVariant,
} from '../products.js';
import { loadBagLines, persistBagLinesQuietly, MAX_LINE_QTY } from '../bag.js';

const IDEMPOTENCY_TTL_MS = 60_000;
const GET_LATENCY_MS = 400;
const WRITE_BASE_LATENCY_MS = 1200;
const WRITE_JITTER_MS = 300;

let memoryIdempotency = {};
let memoryUpdatedAt = new Date().toISOString();

function readDb() {
  const lines = loadBagLines();
  return {
    lines,
    updatedAt: memoryUpdatedAt,
    idempotency: memoryIdempotency,
  };
}

function writeDb(db) {
  const cleanLines = persistBagLinesQuietly(db.lines || []);
  memoryUpdatedAt = db.updatedAt || new Date().toISOString();
  memoryIdempotency = db.idempotency || {};
  return cleanLines;
}

function pruneIdempotencyKeys(db, nowMs = Date.now()) {
  if (!db.idempotency) {
    db.idempotency = {};
    return;
  }
  for (const [key, entry] of Object.entries(db.idempotency)) {
    if (!entry || typeof entry.timestampMs !== 'number' || nowMs - entry.timestampMs > IDEMPOTENCY_TTL_MS) {
      delete db.idempotency[key];
    }
  }
}

function toPublicCart(db) {
  return {
    lines: db.lines.map(({ productId, variantId, quantity }) => ({
      productId,
      variantId,
      quantity,
    })),
    updatedAt: db.updatedAt,
  };
}

/**
 * Resolves latency and failure simulation parameters from the request URL
 * or the current page's window.location.search.
 */
function resolveSimulationParams(requestUrl) {
  const reqParams = new URL(requestUrl, window.location.origin).searchParams;
  const pageParams = new URLSearchParams(window.location.search);

  const rawLatency = reqParams.get('latency') ?? pageParams.get('latency');
  const rawFail = reqParams.get('fail') ?? pageParams.get('fail');

  let latencyOverride = null;
  if (rawLatency !== null && rawLatency !== '') {
    const parsedLatency = Number(rawLatency);
    if (Number.isFinite(parsedLatency) && parsedLatency >= 0) {
      latencyOverride = parsedLatency;
    }
  }

  let failRate = 0;
  if (rawFail !== null && rawFail !== '') {
    const parsedFail = Number(rawFail);
    if (Number.isFinite(parsedFail)) {
      failRate = Math.min(1, Math.max(0, parsedFail));
    }
  }

  return { latencyOverride, failRate };
}

function computeGetDelayMs(requestUrl) {
  const { latencyOverride } = resolveSimulationParams(requestUrl);
  return latencyOverride !== null ? latencyOverride : GET_LATENCY_MS;
}

function computeWriteDelayMs(requestUrl) {
  const { latencyOverride } = resolveSimulationParams(requestUrl);
  if (latencyOverride !== null) {
    return latencyOverride;
  }
  const jitter = Math.round((Math.random() * 2 - 1) * WRITE_JITTER_MS);
  return Math.max(0, WRITE_BASE_LATENCY_MS + jitter);
}

function shouldFailWrite(requestUrl) {
  const { failRate } = resolveSimulationParams(requestUrl);
  if (failRate <= 0) return false;
  if (failRate >= 1) return true;
  return Math.random() < failRate;
}

function validateProductAndVariant(productId, variantId) {
  if (!productId || typeof productId !== 'string') {
    return { valid: false, error: 'Product ID is required.' };
  }
  const product = getProductById(productId);
  if (!product || product.id !== productId) {
    return { valid: false, error: `Unknown product "${productId}".` };
  }
  if (!variantId || typeof variantId !== 'string') {
    return { valid: false, error: 'Pot variant ID is required.' };
  }
  const resolvedVariant = resolveProductVariant(product, variantId);
  if (!resolvedVariant) {
    return {
      valid: false,
      error: `Unknown pot variant "${variantId}" for product "${productId}".`,
    };
  }
  return { valid: true, product, variantId: resolvedVariant.variantId };
}

const handlers = [
  // GET /api/cart
  http.get('*/api/cart', async ({ request }) => {
    await delay(computeGetDelayMs(request.url));
    const db = readDb();
    return HttpResponse.json(toPublicCart(db), { status: 200 });
  }),

  // POST /api/cart/lines
  http.post('*/api/cart/lines', async ({ request }) => {
    await delay(computeWriteDelayMs(request.url));

    let body;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const { productId, variantId, quantity = 1 } = body ?? {};
    const validation = validateProductAndVariant(productId, variantId);
    if (!validation.valid) {
      return HttpResponse.json({ error: validation.error }, { status: 400 });
    }
    const normalizedVariantId = validation.variantId;

    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1) {
      return HttpResponse.json(
        { error: 'Quantity must be a positive integer.' },
        { status: 400 }
      );
    }

    const db = readDb();
    const nowMs = Date.now();
    pruneIdempotencyKeys(db, nowMs);

    const idempotencyKey =
      request.headers.get('Idempotency-Key') || request.headers.get('idempotency-key');

    if (idempotencyKey && db.idempotency[idempotencyKey]) {
      writeDb(db);
      return HttpResponse.json(db.idempotency[idempotencyKey].response, { status: 200 });
    }

    if (shouldFailWrite(request.url)) {
      return HttpResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    const existingLine = db.lines.find(
      (line) => line.productId === productId && line.variantId === normalizedVariantId
    );

    if (existingLine) {
      existingLine.quantity = Math.min(MAX_LINE_QTY, existingLine.quantity + parsedQty);
    } else {
      db.lines.push({
        productId,
        variantId: normalizedVariantId,
        quantity: Math.min(MAX_LINE_QTY, parsedQty),
      });
    }

    db.updatedAt = new Date(nowMs).toISOString();
    const responsePayload = toPublicCart(db);

    if (idempotencyKey) {
      db.idempotency[idempotencyKey] = {
        timestampMs: nowMs,
        response: responsePayload,
      };
    }

    writeDb(db);
    return HttpResponse.json(responsePayload, { status: 200 });
  }),

  // PATCH /api/cart/lines/:productId/:variantId
  http.patch('*/api/cart/lines/:productId/:variantId', async ({ request, params }) => {
    await delay(computeWriteDelayMs(request.url));

    const productId = String(params.productId || '');
    const variantId = String(params.variantId || '');
    const validation = validateProductAndVariant(productId, variantId);
    if (!validation.valid) {
      return HttpResponse.json({ error: validation.error }, { status: 400 });
    }
    const normalizedVariantId = validation.variantId;

    let body;
    try {
      body = await request.json();
    } catch {
      return HttpResponse.json({ error: 'Invalid JSON request body.' }, { status: 400 });
    }

    const parsedQty = Number(body?.quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 0) {
      return HttpResponse.json(
        { error: 'Quantity must be a non-negative integer.' },
        { status: 400 }
      );
    }

    if (shouldFailWrite(request.url)) {
      return HttpResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    const db = readDb();
    const index = db.lines.findIndex(
      (line) => line.productId === productId && line.variantId === normalizedVariantId
    );

    if (parsedQty === 0) {
      if (index !== -1) {
        db.lines.splice(index, 1);
      }
    } else if (index !== -1) {
      db.lines[index].quantity = Math.min(MAX_LINE_QTY, parsedQty);
    } else {
      db.lines.push({
        productId,
        variantId: normalizedVariantId,
        quantity: Math.min(MAX_LINE_QTY, parsedQty),
      });
    }

    db.updatedAt = new Date().toISOString();
    writeDb(db);
    return HttpResponse.json(toPublicCart(db), { status: 200 });
  }),

  // DELETE /api/cart/lines/:productId/:variantId
  http.delete('*/api/cart/lines/:productId/:variantId', async ({ request, params }) => {
    await delay(computeWriteDelayMs(request.url));

    const productId = String(params.productId || '');
    const variantId = String(params.variantId || '');
    const validation = validateProductAndVariant(productId, variantId);
    if (!validation.valid) {
      return HttpResponse.json({ error: validation.error }, { status: 400 });
    }
    const normalizedVariantId = validation.variantId;

    if (shouldFailWrite(request.url)) {
      return HttpResponse.json(
        { error: 'Service temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    const db = readDb();
    db.lines = db.lines.filter(
      (line) => !(line.productId === productId && line.variantId === normalizedVariantId)
    );
    db.updatedAt = new Date().toISOString();
    writeDb(db);
    return HttpResponse.json(toPublicCart(db), { status: 200 });
  }),
];

let workerStartPromise = null;

export function startCartMockWorker() {
  if (!workerStartPromise) {
    // Ensure initial localStorage DB record exists
    readDb();
    const worker = setupWorker(...handlers);
    const serviceWorkerUrl = new URL(
      `${getStorefrontRootPrefix()}mockServiceWorker.js`,
      window.location.href
    ).pathname;
    workerStartPromise = worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
      serviceWorker: {
        url: serviceWorkerUrl,
      },
    });
  }
  return workerStartPromise;
}
