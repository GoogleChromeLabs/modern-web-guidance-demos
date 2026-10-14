/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Shared Bag State ("folia-bag") & Slide-Over Drawer
 */

import { formatPrice, getProductById, resolveProductVariant } from './products.js';

export const BAG_STORAGE_KEY = 'folia-bag';
export const MAX_LINE_QTY = 9;
export const FREE_DELIVERY_THRESHOLD_PENCE = 7500; // £75.00 in integer pence

let inMemoryLines = [];
let lastDrawerTriggerEl = null;
const subscribers = new Set();

/**
 * Validates and normalizes raw bag data against the products catalogue.
 * Drops unknown products/variants, clamps quantities to 1..9, merges duplicates,
 * and strips any non-(productId, variantId, quantity) fields.
 *
 * @param {unknown} rawData
 * @returns {{ lines: Array<{ productId: string, variantId: string, quantity: number }>, wasDirty: boolean }}
 */
export function sanitizeBagLines(rawData) {
  let candidateList = null;
  let wasDirty = false;

  if (Array.isArray(rawData)) {
    candidateList = rawData;
  } else if (rawData && typeof rawData === 'object' && Array.isArray(rawData.lines)) {
    candidateList = rawData.lines;
    wasDirty = true;
  } else {
    return { lines: [], wasDirty: rawData !== null && rawData !== undefined };
  }

  const mergedByKey = new Map();

  for (const entry of candidateList) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      wasDirty = true;
      continue;
    }

    const productId = typeof entry.productId === 'string' ? entry.productId.trim() : '';
    const rawVariantId = typeof entry.variantId === 'string' ? entry.variantId.trim() : '';

    if (!productId || !rawVariantId) {
      wasDirty = true;
      continue;
    }

    const product = getProductById(productId);
    if (!product || product.id !== productId) {
      wasDirty = true;
      continue;
    }

    const resolvedVariant = resolveProductVariant(product, rawVariantId);
    if (!resolvedVariant) {
      wasDirty = true;
      continue;
    }

    const variantId = resolvedVariant.variantId;
    if (variantId !== entry.variantId) {
      wasDirty = true;
    }

    const rawQty = Number(entry.quantity);
    if (!Number.isFinite(rawQty) || rawQty <= 0) {
      wasDirty = true;
      continue;
    }

    const clampedQty = Math.min(MAX_LINE_QTY, Math.max(1, Math.round(rawQty)));
    if (clampedQty !== entry.quantity) {
      wasDirty = true;
    }

    const keys = Object.keys(entry);
    if (
      keys.length !== 3 ||
      !keys.includes('productId') ||
      !keys.includes('variantId') ||
      !keys.includes('quantity')
    ) {
      wasDirty = true;
    }

    const compositeKey = `${productId}::${variantId}`;
    if (mergedByKey.has(compositeKey)) {
      wasDirty = true;
      const existing = mergedByKey.get(compositeKey);
      existing.quantity = Math.min(MAX_LINE_QTY, existing.quantity + clampedQty);
    } else {
      mergedByKey.set(compositeKey, {
        productId,
        variantId,
        quantity: clampedQty,
      });
    }
  }

  return {
    lines: Array.from(mergedByKey.values()),
    wasDirty,
  };
}

/**
 * Reads and validates bag lines from localStorage ("folia-bag"), falling back
 * to in-memory state if localStorage is unavailable or throws.
 *
 * @returns {Array<{ productId: string, variantId: string, quantity: number }>}
 */
export function loadBagLines() {
  try {
    const raw = window.localStorage.getItem(BAG_STORAGE_KEY);
    if (raw === null) {
      inMemoryLines = [];
      return [];
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      inMemoryLines = [];
      try {
        window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify([]));
      } catch {
        // Ignore storage write error
      }
      return [];
    }

    const { lines, wasDirty } = sanitizeBagLines(parsed);
    inMemoryLines = lines.map((line) => ({ ...line }));

    if (wasDirty) {
      try {
        window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(lines));
      } catch {
        // Ignore storage write error
      }
    }

    return lines.map((line) => ({ ...line }));
  } catch {
    // localStorage unavailable — fall back to in-memory state
    return inMemoryLines.map((line) => ({ ...line }));
  }
}

/**
 * Persists validated bag lines (strictly { productId, variantId, quantity })
 * to localStorage ("folia-bag") with in-memory fallback, without notifying UI subscribers.
 *
 * @param {Array<{ productId: string, variantId: string, quantity: number }>} nextLines
 * @returns {Array<{ productId: string, variantId: string, quantity: number }>}
 */
export function persistBagLinesQuietly(nextLines) {
  const { lines } = sanitizeBagLines(nextLines);
  inMemoryLines = lines.map((line) => ({ ...line }));

  try {
    window.localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(lines));
  } catch {
    // Keep operating on inMemoryLines if localStorage is unavailable or full
  }

  return lines.map((line) => ({ ...line }));
}

/**
 * Persists validated bag lines (strictly { productId, variantId, quantity })
 * to localStorage ("folia-bag") with in-memory fallback, then notifies UI.
 *
 * @param {Array<{ productId: string, variantId: string, quantity: number }>} nextLines
 * @returns {Array<{ productId: string, variantId: string, quantity: number }>}
 */
export function saveBagLines(nextLines) {
  const lines = persistBagLinesQuietly(nextLines);
  notifyBagSubscribers();
  return lines;
}

export function getBagLines() {
  return inMemoryLines.map((line) => ({ ...line }));
}

export function getBagItemCount(lines = inMemoryLines) {
  if (!Array.isArray(lines)) return 0;
  return lines.reduce((sum, line) => sum + (Number(line.quantity) || 0), 0);
}

/**
 * Enriches stored { productId, variantId, quantity } lines with live product
 * name, Latin name, pot finish + pot size label, thumbnail image, and integer pence prices from products.js.
 */
export function getEnrichedBagState(lines = inMemoryLines) {
  const enrichedLines = [];
  let subtotalPence = 0;
  let totalItems = 0;

  for (const line of lines) {
    const product = getProductById(line.productId);
    if (!product) continue;

    const resolvedVariant = resolveProductVariant(product, line.variantId);
    if (!resolvedVariant) continue;

    const quantity = Math.min(MAX_LINE_QTY, Math.max(1, Number(line.quantity) || 1));
    const unitPricePence = product.price;
    const linePricePence = unitPricePence * quantity;

    subtotalPence += linePricePence;
    totalItems += quantity;

    const thumbSrc =
      Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : product.image;
    const thumbAlt =
      Array.isArray(product.alts) && product.alts.length > 0
        ? product.alts[0]
        : `${product.name} (${product.latin})`;

    enrichedLines.push({
      productId: product.id,
      variantId: resolvedVariant.variantId,
      quantity,
      name: product.name,
      latin: product.latin,
      potLabel: resolvedVariant.label,
      potSizeLabel: resolvedVariant.potSize?.label || product.potSize || '',
      thumbSrc,
      thumbAlt,
      unitPricePence,
      linePricePence,
      formattedLinePrice: formatPrice(linePricePence),
    });
  }

  const remainingForFreeDeliveryPence = Math.max(
    0,
    FREE_DELIVERY_THRESHOLD_PENCE - subtotalPence
  );
  const qualifiesForFreeDelivery = subtotalPence >= FREE_DELIVERY_THRESHOLD_PENCE;
  const deliveryMessage = qualifiesForFreeDelivery
    ? 'Delivery is free on this order'
    : `Add ${formatPrice(remainingForFreeDeliveryPence)} for free delivery`;

  return {
    lines: enrichedLines,
    totalItems,
    subtotalPence,
    formattedSubtotal: formatPrice(subtotalPence),
    qualifiesForFreeDelivery,
    remainingForFreeDeliveryPence,
    deliveryMessage,
  };
}

/**
 * Adds 1 of (productId, variantId) to the bag state (clamped at 9).
 * Returns the updated lines.
 */
export function incrementBagLine(productId, variantId, delta = 1) {
  const product = getProductById(productId);
  if (!product) return getBagLines();
  const resolvedVariant = resolveProductVariant(product, variantId);
  if (!resolvedVariant) return getBagLines();

  const normalizedVariantId = resolvedVariant.variantId;
  const current = loadBagLines();
  const existing = current.find(
    (line) => line.productId === productId && line.variantId === normalizedVariantId
  );

  if (existing) {
    existing.quantity = Math.min(MAX_LINE_QTY, Math.max(1, existing.quantity + delta));
  } else if (delta > 0) {
    current.push({
      productId,
      variantId: normalizedVariantId,
      quantity: Math.min(MAX_LINE_QTY, Math.max(1, delta)),
    });
  }

  return saveBagLines(current);
}

/**
 * Sets the exact quantity (1..9) of a line in the bag.
 */
export function setBagLineQuantity(productId, variantId, nextQuantity) {
  const product = getProductById(productId);
  const resolvedVariant = product ? resolveProductVariant(product, variantId) : null;
  const targetVariantId = resolvedVariant ? resolvedVariant.variantId : variantId;

  const current = loadBagLines();
  const index = current.findIndex(
    (line) => line.productId === productId && line.variantId === targetVariantId
  );
  if (index === -1) return current;

  const parsed = Math.round(Number(nextQuantity));
  if (!Number.isFinite(parsed) || parsed < 1) {
    return current;
  }

  current[index].quantity = Math.min(MAX_LINE_QTY, Math.max(1, parsed));
  return saveBagLines(current);
}

/**
 * Removes a line from the bag.
 */
export function removeBagLine(productId, variantId) {
  const product = getProductById(productId);
  const resolvedVariant = product ? resolveProductVariant(product, variantId) : null;
  const targetVariantId = resolvedVariant ? resolvedVariant.variantId : variantId;

  const current = loadBagLines();
  const filtered = current.filter(
    (line) => !(line.productId === productId && line.variantId === targetVariantId)
  );
  return saveBagLines(filtered);
}

/**
 * Syncs the bag store from a cart API response ({ lines }) or reloads from storage.
 */
export function syncBagFromCart(cartPayload) {
  if (cartPayload && Array.isArray(cartPayload.lines)) {
    return saveBagLines(cartPayload.lines);
  }
  const lines = loadBagLines();
  notifyBagSubscribers();
  return lines;
}

/**
 * Public addToBag(productId, variantId): adds 1 to the matching line, shows
 * "Added" on the product button if present, and opens the bag drawer.
 */
export function addToBag(productId, variantId, { triggerEl } = {}) {
  const updatedLines = incrementBagLine(productId, variantId, 1);
  openBagDrawer({ triggerEl: triggerEl || document.getElementById('add-to-bag-btn') });
  return updatedLines;
}

function notifyBagSubscribers() {
  renderBagHeaderCounts();
  renderBagDrawerContents();
  for (const listener of subscribers) {
    try {
      listener(getBagLines());
    } catch {
      // Ignore subscriber error
    }
  }
}

export function subscribeBag(listener) {
  subscribers.add(listener);
  return () => subscribers.delete(listener);
}

const BAG_DRAWER_HTML = `
  <div id="bag-scrim" class="bag-scrim" data-open="false" aria-hidden="true"></div>

  <div
    id="bag-drawer"
    class="bag-drawer"
    role="dialog"
    aria-modal="true"
    aria-labelledby="bag-drawer-title"
    aria-hidden="true"
    data-open="false"
  >
    <div class="bag-drawer__header">
      <h2 id="bag-drawer-title" class="bag-drawer__title">
        Bag <span id="bag-drawer-count" class="bag-drawer__count">(0)</span>
      </h2>
      <button type="button" id="bag-close-btn" class="bag-drawer__close">
        Close
      </button>
    </div>

    <div id="bag-drawer-body" class="bag-drawer__body">
      <div id="bag-empty" class="bag-drawer__empty">
        <p class="bag-drawer__empty-text">Your bag is empty.</p>
        <a href="/#shop" id="bag-continue-link" class="bag-drawer__continue-link">
          Continue shopping
        </a>
      </div>

      <ul id="bag-lines" class="bag-drawer__lines" role="list" hidden></ul>
    </div>

    <div id="bag-drawer-footer" class="bag-drawer__footer" hidden>
      <div class="bag-drawer__subtotal-row">
        <span class="bag-drawer__subtotal-label">Subtotal</span>
        <span id="bag-subtotal" class="bag-drawer__subtotal-value">£0</span>
      </div>
      <p id="bag-delivery-note" class="bag-drawer__delivery" aria-live="polite">
        Add ${formatPrice(FREE_DELIVERY_THRESHOLD_PENCE)} for free delivery
      </p>
      <button type="button" id="bag-checkout-btn" class="bag-drawer__checkout-btn">
        Checkout
      </button>
      <p
        id="bag-checkout-msg"
        class="bag-drawer__checkout-msg"
        role="status"
        aria-live="polite"
        hidden
      >
        Checkout is not built yet
      </p>
    </div>
  </div>
`;

function ensureBagHeaderAndDrawerDom() {
  const header = document.getElementById('site-header');
  if (!header) return;

  // Upgrade any header/mobile-menu Bag links or buttons so they trigger the drawer
  const primaryNavBag = header.querySelector('.site-header__bar [data-bag-trigger], .site-header__bar a[href="#bag"]');
  if (primaryNavBag) {
    primaryNavBag.setAttribute('data-bag-trigger', '');
    primaryNavBag.setAttribute('aria-haspopup', 'dialog');
    primaryNavBag.setAttribute('aria-controls', 'bag-drawer');
    if (!primaryNavBag.hasAttribute('aria-expanded')) {
      primaryNavBag.setAttribute('aria-expanded', 'false');
    }
    primaryNavBag.setAttribute('aria-live', 'polite');
    primaryNavBag.setAttribute('aria-atomic', 'true');
  }

  document.querySelectorAll('#mobile-menu a[href="#bag"], #mobile-menu [data-bag-trigger]').forEach((el) => {
    el.setAttribute('data-bag-trigger', '');
    el.setAttribute('aria-haspopup', 'dialog');
    el.setAttribute('aria-controls', 'bag-drawer');
    if (!el.hasAttribute('aria-expanded')) {
      el.setAttribute('aria-expanded', 'false');
    }
  });

  if (!document.getElementById('bag-drawer')) {
    header.insertAdjacentHTML('beforeend', BAG_DRAWER_HTML);
  }
}

export function renderBagHeaderCounts() {
  const count = getBagItemCount(inMemoryLines);
  const label = `Bag (${count})`;

  document.querySelectorAll('[data-bag-trigger], a[href="#bag"]').forEach((el) => {
    if (el.textContent !== label) {
      el.textContent = label;
    }
  });
}

function createBagLineElement(item) {
  const li = document.createElement('li');
  li.className = 'bag-line';
  li.dataset.productId = item.productId;
  li.dataset.variantId = item.variantId;

  const img = document.createElement('img');
  img.className = 'bag-line__thumb';
  img.src = item.thumbSrc;
  img.alt = item.thumbAlt;
  img.width = 848;
  img.height = 1264;
  img.loading = 'lazy';
  img.decoding = 'async';

  const info = document.createElement('div');
  info.className = 'bag-line__info';

  const topRow = document.createElement('div');
  topRow.className = 'bag-line__top';

  const nameEl = document.createElement('span');
  nameEl.className = 'bag-line__name';
  nameEl.textContent = item.name;

  const priceEl = document.createElement('span');
  priceEl.className = 'bag-line__price';
  priceEl.textContent = item.formattedLinePrice;

  topRow.append(nameEl, priceEl);

  const latinEl = document.createElement('span');
  latinEl.className = 'bag-line__latin';
  latinEl.textContent = item.latin;

  const variantEl = document.createElement('span');
  variantEl.className = 'bag-line__variant';
  variantEl.textContent = item.potLabel;

  const controls = document.createElement('div');
  controls.className = 'bag-line__controls';

  const stepper = document.createElement('div');
  stepper.className = 'bag-line__stepper';
  stepper.setAttribute('role', 'group');
  stepper.setAttribute('aria-label', `Quantity for ${item.name}, ${item.potLabel}`);

  const decBtn = document.createElement('button');
  decBtn.type = 'button';
  decBtn.className = 'bag-line__step-btn';
  decBtn.dataset.bagAction = 'decrement';
  decBtn.setAttribute('aria-label', `Decrease quantity for ${item.name} (${item.potLabel})`);
  decBtn.disabled = item.quantity <= 1;
  decBtn.textContent = '−';

  const qtySpan = document.createElement('span');
  qtySpan.className = 'bag-line__qty';
  qtySpan.setAttribute('aria-live', 'polite');
  qtySpan.setAttribute('aria-atomic', 'true');
  qtySpan.textContent = String(item.quantity);

  const incBtn = document.createElement('button');
  incBtn.type = 'button';
  incBtn.className = 'bag-line__step-btn';
  incBtn.dataset.bagAction = 'increment';
  incBtn.setAttribute('aria-label', `Increase quantity for ${item.name} (${item.potLabel})`);
  incBtn.disabled = item.quantity >= MAX_LINE_QTY;
  incBtn.textContent = '+';

  stepper.append(decBtn, qtySpan, incBtn);

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'bag-line__remove';
  removeBtn.dataset.bagAction = 'remove';
  removeBtn.setAttribute('aria-label', `Remove ${item.name} (${item.potLabel}) from bag`);
  removeBtn.textContent = 'Remove';

  controls.append(stepper, removeBtn);
  info.append(topRow, latinEl, variantEl, controls);
  li.append(img, info);

  return li;
}

export function renderBagDrawerContents() {
  const drawer = document.getElementById('bag-drawer');
  if (!drawer) return;

  const countEl = document.getElementById('bag-drawer-count');
  const emptyEl = document.getElementById('bag-empty');
  const linesListEl = document.getElementById('bag-lines');
  const footerEl = document.getElementById('bag-drawer-footer');
  const subtotalEl = document.getElementById('bag-subtotal');
  const deliveryEl = document.getElementById('bag-delivery-note');
  const checkoutMsgEl = document.getElementById('bag-checkout-msg');

  // Capture focus inside #bag-lines before re-rendering so keyboard users keep focus
  let focusedLineContext = null;
  if (linesListEl && linesListEl.contains(document.activeElement)) {
    const activeBtn = document.activeElement.closest('button[data-bag-action]');
    const activeLi = document.activeElement.closest('.bag-line');
    if (activeBtn && activeLi) {
      const allLis = Array.from(linesListEl.querySelectorAll('.bag-line'));
      focusedLineContext = {
        productId: activeLi.dataset.productId || '',
        variantId: activeLi.dataset.variantId || '',
        action: activeBtn.dataset.bagAction || '',
        lineIndex: Math.max(0, allLis.indexOf(activeLi)),
      };
    }
  }

  const state = getEnrichedBagState(inMemoryLines);

  if (countEl) {
    countEl.textContent = `(${state.totalItems})`;
  }
  if (deliveryEl) {
    deliveryEl.textContent = state.deliveryMessage;
  }

  if (state.lines.length === 0) {
    if (emptyEl) emptyEl.hidden = false;
    if (linesListEl) {
      linesListEl.hidden = true;
      linesListEl.replaceChildren();
    }
    if (footerEl) footerEl.hidden = true;
    if (checkoutMsgEl) checkoutMsgEl.hidden = true;

    if (focusedLineContext && isBagDrawerOpen()) {
      const continueLink = document.getElementById('bag-continue-link');
      const closeBtn = document.getElementById('bag-close-btn');
      (continueLink || closeBtn)?.focus();
    }
    return;
  }

  if (emptyEl) emptyEl.hidden = true;
  if (linesListEl) {
    linesListEl.hidden = false;
    const fragment = document.createDocumentFragment();
    for (const item of state.lines) {
      fragment.append(createBagLineElement(item));
    }
    linesListEl.replaceChildren(fragment);
  }

  if (footerEl) footerEl.hidden = false;
  if (subtotalEl) subtotalEl.textContent = state.formattedSubtotal;
  if (deliveryEl) deliveryEl.textContent = state.deliveryMessage;

  // Restore focus within the updated line list if a control was previously focused
  if (focusedLineContext && linesListEl && isBagDrawerOpen()) {
    const matchingLi = Array.from(linesListEl.querySelectorAll('.bag-line')).find(
      (li) =>
        li.dataset.productId === focusedLineContext.productId &&
        li.dataset.variantId === focusedLineContext.variantId
    );

    if (matchingLi) {
      const targetBtn = matchingLi.querySelector(
        `button[data-bag-action="${focusedLineContext.action}"]`
      );
      if (targetBtn && !targetBtn.disabled) {
        targetBtn.focus();
      } else {
        const fallbackBtn = matchingLi.querySelector('button.bag-line__step-btn:not([disabled])');
        fallbackBtn?.focus();
      }
    } else {
      const remainingLis = Array.from(linesListEl.querySelectorAll('.bag-line'));
      const targetLi =
        remainingLis[Math.min(focusedLineContext.lineIndex, remainingLis.length - 1)];
      const firstFocusable = targetLi?.querySelector('button:not([disabled])');
      firstFocusable?.focus();
    }
  }
}

function setBackgroundPageInert(isInert) {
  const regions = [
    document.querySelector('.skip-link'),
    document.querySelector('.site-header__bar'),
    document.getElementById('mobile-menu'),
    document.getElementById('main-content'),
    document.getElementById('site-footer'),
  ];

  for (const el of regions) {
    if (!el) continue;
    if (isInert) {
      el.inert = true;
      el.setAttribute('data-bag-inert', 'true');
      if (!el.hasAttribute('aria-hidden')) {
        el.setAttribute('data-bag-aria-hidden', 'true');
        el.setAttribute('aria-hidden', 'true');
      }
    } else {
      el.inert = false;
      el.removeAttribute('data-bag-inert');
      if (el.getAttribute('data-bag-aria-hidden') === 'true') {
        el.removeAttribute('data-bag-aria-hidden');
        el.removeAttribute('aria-hidden');
      }
    }
  }
}

export function isBagDrawerOpen() {
  const drawer = document.getElementById('bag-drawer');
  return drawer?.getAttribute('data-open') === 'true';
}

export function openBagDrawer({ triggerEl } = {}) {
  ensureBagHeaderAndDrawerDom();
  const drawer = document.getElementById('bag-drawer');
  const scrim = document.getElementById('bag-scrim');
  const closeBtn = document.getElementById('bag-close-btn');
  const checkoutMsgEl = document.getElementById('bag-checkout-msg');

  if (!drawer || !scrim) return;

  const resolvedTrigger =
    triggerEl instanceof HTMLElement
      ? triggerEl
      : document.activeElement instanceof HTMLElement && !drawer.contains(document.activeElement)
        ? document.activeElement
        : lastDrawerTriggerEl;

  if (resolvedTrigger) {
    lastDrawerTriggerEl = resolvedTrigger;
  }

  // Close mobile menu first if it was open
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOpenBtn = document.getElementById('menu-open-btn');
  if (mobileMenu?.getAttribute('data-open') === 'true' || mobileMenu?.open) {
    mobileMenu.setAttribute('data-open', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
    if (typeof mobileMenu.close === 'function' && mobileMenu.open) {
      mobileMenu.close();
    }
    menuOpenBtn?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  if (checkoutMsgEl) {
    checkoutMsgEl.hidden = true;
  }

  renderBagDrawerContents();

  drawer.setAttribute('data-open', 'true');
  drawer.setAttribute('aria-hidden', 'false');
  scrim.setAttribute('data-open', 'true');
  scrim.setAttribute('aria-hidden', 'true');

  document.querySelectorAll('[data-bag-trigger], a[href="#bag"]').forEach((el) => {
    el.setAttribute('aria-expanded', 'true');
  });

  document.body.classList.add('bag-open');
  setBackgroundPageInert(true);

  if (closeBtn) {
    // Ensure visibility: visible is computed before moving focus to the Close button
    void drawer.offsetWidth;
    closeBtn.focus();
  }
}

export function closeBagDrawer({ restoreFocus = true } = {}) {
  const drawer = document.getElementById('bag-drawer');
  const scrim = document.getElementById('bag-scrim');
  if (!drawer || !scrim || drawer.getAttribute('data-open') !== 'true') return;

  drawer.setAttribute('data-open', 'false');
  drawer.setAttribute('aria-hidden', 'true');
  scrim.setAttribute('data-open', 'false');

  document.querySelectorAll('[data-bag-trigger], a[href="#bag"]').forEach((el) => {
    el.setAttribute('aria-expanded', 'false');
  });

  document.body.classList.remove('bag-open');
  setBackgroundPageInert(false);

  if (restoreFocus) {
    const mobileMenu = document.getElementById('mobile-menu');
    const menuOpenBtn = document.getElementById('menu-open-btn');
    if (
      lastDrawerTriggerEl &&
      mobileMenu &&
      mobileMenu.contains(lastDrawerTriggerEl) &&
      mobileMenu.getAttribute('data-open') !== 'true'
    ) {
      menuOpenBtn?.focus();
    } else if (lastDrawerTriggerEl && typeof lastDrawerTriggerEl.focus === 'function') {
      lastDrawerTriggerEl.focus();
    }
  }
}

function getFocusableElementsInDrawer(drawer) {
  const selector = 'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  return Array.from(drawer.querySelectorAll(selector)).filter(
    (el) => !el.hidden && !el.closest('[hidden]')
  );
}

export function initBagDrawer() {
  ensureBagHeaderAndDrawerDom();

  // Validate and hydrate from localStorage ("folia-bag") on startup
  loadBagLines();
  renderBagHeaderCounts();
  renderBagDrawerContents();

  const drawer = document.getElementById('bag-drawer');
  const scrim = document.getElementById('bag-scrim');
  const closeBtn = document.getElementById('bag-close-btn');
  const linesListEl = document.getElementById('bag-lines');
  const checkoutBtn = document.getElementById('bag-checkout-btn');
  const checkoutMsgEl = document.getElementById('bag-checkout-msg');
  const continueLink = document.getElementById('bag-continue-link');

  if (!drawer || drawer.dataset.bound === 'true') {
    return;
  }
  drawer.dataset.bound = 'true';

  // Open drawer when clicking any Bag trigger in the header or mobile menu
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-bag-trigger], a[href="#bag"]');
    if (!trigger) return;
    event.preventDefault();
    openBagDrawer({ triggerEl: trigger });
  });

  // Close drawer when clicking the Close button or backdrop scrim
  closeBtn?.addEventListener('click', () => {
    closeBagDrawer({ restoreFocus: true });
  });

  scrim?.addEventListener('click', () => {
    closeBagDrawer({ restoreFocus: true });
  });

  // Continue shopping link in empty state closes drawer and navigates to /#shop
  continueLink?.addEventListener('click', (event) => {
    const shopSection = document.getElementById('shop');
    closeBagDrawer({ restoreFocus: false });

    if (shopSection) {
      event.preventDefault();
      window.location.hash = '#shop';
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const headerHeight =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
      const targetTop = Math.max(
        0,
        shopSection.getBoundingClientRect().top + window.scrollY - headerHeight
      );
      window.scrollTo({
        top: targetTop,
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
      });
    }
  });

  // Line stepper (+/-) and Remove actions
  linesListEl?.addEventListener('click', (event) => {
    const actionBtn = event.target.closest('button[data-bag-action]');
    if (!actionBtn || actionBtn.disabled) return;

    const lineEl = actionBtn.closest('.bag-line');
    if (!lineEl) return;

    const productId = lineEl.dataset.productId || '';
    const variantId = lineEl.dataset.variantId || '';
    const action = actionBtn.dataset.bagAction;

    if (checkoutMsgEl) {
      checkoutMsgEl.hidden = true;
    }

    const currentLines = loadBagLines();
    const existing = currentLines.find(
      (l) => l.productId === productId && l.variantId === variantId
    );
    if (!existing) return;

    if (action === 'increment') {
      if (existing.quantity < MAX_LINE_QTY) {
        setBagLineQuantity(productId, variantId, existing.quantity + 1);
      }
    } else if (action === 'decrement') {
      if (existing.quantity > 1) {
        setBagLineQuantity(productId, variantId, existing.quantity - 1);
      }
    } else if (action === 'remove') {
      removeBagLine(productId, variantId);
    }
  });

  // Checkout stub button shows inline message inside the drawer
  checkoutBtn?.addEventListener('click', () => {
    if (checkoutMsgEl) {
      checkoutMsgEl.textContent = 'Checkout is not built yet';
      checkoutMsgEl.hidden = false;
    }
  });

  // Escape closes drawer and restores focus; Tab traps focus inside the dialog
  document.addEventListener('keydown', (event) => {
    if (!isBagDrawerOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeBagDrawer({ restoreFocus: true });
      return;
    }

    if (event.key === 'Tab') {
      const focusables = getFocusableElementsInDrawer(drawer);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;

      if (!drawer.contains(active)) {
        event.preventDefault();
        first.focus();
        return;
      }

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // Cross-tab synchronization via the storage event
  window.addEventListener('storage', (event) => {
    if (event.key === BAG_STORAGE_KEY || event.key === null) {
      loadBagLines();
      notifyBagSubscribers();
    }
  });

  // Expose addToBag helper on window for interactive console / test convenience
  window.addToBag = addToBag;
}
