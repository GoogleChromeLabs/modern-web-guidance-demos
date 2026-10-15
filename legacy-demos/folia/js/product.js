/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Product Detail Page Controller (/products/[id])
 */

import { CATEGORIES, formatPrice, formatVariantId, getProductById } from './products.js';
import { cartApi, CartApiError } from './cartApi.js';
import { initBagDrawer, openBagDrawer, syncBagFromCart, incrementBagLine } from './bag.js';
import { initFooter, subscribe } from './footer.js';

export { subscribe };

const MIN_PENDING_MS = 400;
const SUCCESS_HOLD_MS = 1500;
const ERROR_ALERT_TEXT = 'We could not add this to your bag. Please try again.';

const PRODUCT_MAIN_TEMPLATE = `
  <article id="product-view" class="product">
    <div id="product-gallery" class="product__gallery" data-multi="false">
      <div
        id="product-media-strip"
        class="product__media-strip"
        role="region"
        aria-label="Product images"
      ></div>
      <p
        id="product-media-counter"
        class="product__media-counter"
        aria-live="polite"
        aria-atomic="true"
      >
        1 / 1
      </p>
    </div>

    <div id="product-info" class="product__info">
      <a id="product-back-link" href="/#shop" class="product__back-link">
        Back to collection
      </a>

      <div class="product__header">
        <div class="product__title-row">
          <h1 id="product-name" class="product__name"></h1>
          <p id="product-price" class="product__price"></p>
        </div>
        <p id="product-latin" class="product__latin"></p>
      </div>

      <p id="product-description" class="product__description"></p>

      <div class="product__pot-section">
        <p id="pot-finish-label" class="product__section-label">Pot finish</p>
        <div
          id="product-pot-options"
          class="product__pot-options"
          role="radiogroup"
          aria-labelledby="pot-finish-label"
        ></div>
      </div>

      <div class="product__pot-section">
        <p id="pot-size-label" class="product__section-label">Pot size</p>
        <div
          id="product-pot-size-options"
          class="product__pot-options"
          role="radiogroup"
          aria-labelledby="pot-size-label"
        ></div>
      </div>

      <div class="product__actions">
        <button
          type="button"
          id="add-to-bag-btn"
          class="product__add-btn"
          data-state="idle"
        >
          <span id="add-to-bag-label" class="product__add-btn-label">Add to bag</span>
        </button>
        <p
          id="add-to-bag-error"
          class="product__error"
          role="alert"
          hidden
        ></p>
        <div
          id="product-live-status"
          class="visually-hidden"
          aria-live="polite"
          aria-atomic="true"
        ></div>
        <p class="product__delivery">
          Free delivery over £75. Arrives in 2 to 4 working days.
        </p>
      </div>

      <dl id="product-details" class="product__details">
        <div class="product__detail-row" data-detail="height">
          <dt class="product__detail-term">Height</dt>
          <dd id="detail-height" class="product__detail-value"></dd>
        </div>
        <div class="product__detail-row" data-detail="potSize">
          <dt class="product__detail-term">Pot size</dt>
          <dd id="detail-pot-size" class="product__detail-value"></dd>
        </div>
        <div class="product__detail-row" data-detail="light">
          <dt class="product__detail-term">Light</dt>
          <dd id="detail-light" class="product__detail-value"></dd>
        </div>
        <div class="product__detail-row" data-detail="water">
          <dt class="product__detail-term">Water</dt>
          <dd id="detail-water" class="product__detail-value"></dd>
        </div>
        <div class="product__detail-row" data-detail="pets">
          <dt class="product__detail-term">Pets</dt>
          <dd id="detail-pets" class="product__detail-value"></dd>
        </div>
      </dl>
    </div>
  </article>

  <section
    id="product-not-found"
    class="product-not-found"
    hidden
    aria-labelledby="not-found-title"
  >
    <h1 id="not-found-title" class="product-not-found__title">Plant not found</h1>
    <p class="product-not-found__text">
      The specimen you are looking for is not in the current collection.
    </p>
    <a id="not-found-back-link" href="/#shop" class="product-not-found__link">
      Back to collection
    </a>
  </section>
`;

function createIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function waitMs(ms, signal) {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    const timer = window.setTimeout(resolve, ms);
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          window.clearTimeout(timer);
          resolve();
        },
        { once: true }
      );
    }
  });
}

function ensureMenuScrimDom(menu) {
  let scrim = document.getElementById('menu-scrim');
  if (!scrim && menu?.parentNode) {
    scrim = document.createElement('div');
    scrim.id = 'menu-scrim';
    scrim.className = 'mobile-menu-scrim';
    scrim.setAttribute('data-open', 'false');
    scrim.setAttribute('aria-hidden', 'true');
    menu.parentNode.insertBefore(scrim, menu);
  }
  return scrim;
}

export function closeMobileMenu({ restoreFocus = true, durationMs } = {}) {
  const openBtn = document.getElementById('menu-open-btn');
  const menu = document.getElementById('mobile-menu');
  const scrim = document.getElementById('menu-scrim');

  if (!menu) return;

  menu.removeAttribute('data-dragging');
  scrim?.removeAttribute('data-dragging');
  menu.style.transform = '';
  if (scrim) {
    scrim.style.opacity = '';
  }

  if (menu.getAttribute('data-open') !== 'true') return;

  if (typeof durationMs === 'number' && Number.isFinite(durationMs) && durationMs > 0) {
    const durationValue = `${Math.round(durationMs)}ms`;
    menu.style.setProperty('--menu-transition-duration', durationValue);
    scrim?.style.setProperty('--menu-transition-duration', durationValue);
    window.setTimeout(() => {
      menu.style.removeProperty('--menu-transition-duration');
      scrim?.style.removeProperty('--menu-transition-duration');
    }, Math.round(durationMs) + 50);
  } else {
    menu.style.removeProperty('--menu-transition-duration');
    scrim?.style.removeProperty('--menu-transition-duration');
  }

  menu.setAttribute('data-open', 'false');
  menu.setAttribute('aria-hidden', 'true');
  scrim?.setAttribute('data-open', 'false');
  openBtn?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');

  const regions = [
    document.getElementById('main-content'),
    document.getElementById('site-footer'),
    document.querySelector('.site-header__bar'),
  ];
  for (const el of regions) {
    if (!el || el.hasAttribute('data-bag-inert')) continue;
    el.inert = false;
    el.removeAttribute('inert');
  }

  if (restoreFocus && openBtn) {
    openBtn.focus();
  }
}

export function initMobileMenu() {
  const openBtn = document.getElementById('menu-open-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const menu = document.getElementById('mobile-menu');

  if (!openBtn || !closeBtn || !menu || menu.dataset.bound === 'true') return;
  menu.dataset.bound = 'true';

  const scrim = ensureMenuScrimDom(menu);
  const focusableSelector = 'a[href], button:not([disabled])';

  function setBackgroundInert(inert) {
    const regions = [
      document.getElementById('main-content'),
      document.getElementById('site-footer'),
      document.querySelector('.site-header__bar'),
    ];
    for (const el of regions) {
      if (!el) continue;
      if (inert) {
        el.inert = true;
        el.setAttribute('inert', '');
      } else if (!el.hasAttribute('data-bag-inert')) {
        el.inert = false;
        el.removeAttribute('inert');
      }
    }
  }

  function isMenuOpen() {
    return menu.getAttribute('data-open') === 'true';
  }

  function openMenu() {
    menu.removeAttribute('data-dragging');
    scrim?.removeAttribute('data-dragging');
    menu.style.transform = '';
    menu.style.removeProperty('--menu-transition-duration');
    if (scrim) {
      scrim.style.opacity = '';
      scrim.style.removeProperty('--menu-transition-duration');
      scrim.setAttribute('data-open', 'true');
      scrim.setAttribute('aria-hidden', 'true');
    }

    menu.setAttribute('data-open', 'true');
    menu.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    setBackgroundInert(true);

    // Ensure visibility: visible is computed before moving focus to Close button
    void menu.offsetWidth;
    closeBtn.focus();
  }

  function closeMenu(options = {}) {
    closeMobileMenu(options);
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', () => closeMenu({ restoreFocus: true }));

  // Dismiss when tapping/clicking the backdrop scrim
  scrim?.addEventListener('click', () => {
    closeMenu({ restoreFocus: true });
  });

  // Dismiss when tapping outside the drawer panel while open
  document.addEventListener('pointerdown', (event) => {
    if (!isMenuOpen()) return;
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (menu.contains(target) || openBtn.contains(target) || scrim?.contains(target)) {
      return;
    }
    closeMenu({ restoreFocus: true });
  });

  let suppressClickUntil = 0;

  menu.addEventListener(
    'click',
    (event) => {
      if (performance.now() < suppressClickUntil) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    { capture: true }
  );

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      if (performance.now() < suppressClickUntil) return;
      const isSearchLink = link.hasAttribute('data-nav-search');
      const isBagLink =
        link.hasAttribute('data-bag-trigger') || link.getAttribute('href') === '#bag';
      closeMenu({ restoreFocus: !isSearchLink && !isBagLink });
    });
  });

  // Swipe-to-dismiss gesture tracking (1:1 finger tracking + velocity flick detection)
  const SWIPE_SLOP_PX = 6;
  const DISMISS_DISTANCE_RATIO = 0.3;
  const DISMISS_VELOCITY_PX_PER_MS = -0.35;

  const gesture = {
    active: false,
    source: '',
    pointerId: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    axis: null,
    isDragging: false,
    drawerWidth: 0,
  };

  function startGesture(clientX, clientY, source, pointerId = null) {
    if (!isMenuOpen()) return;
    if (gesture.active) return;

    const width = menu.getBoundingClientRect().width || 320;
    gesture.active = true;
    gesture.source = source;
    gesture.pointerId = pointerId;
    gesture.startX = clientX;
    gesture.startY = clientY;
    gesture.lastX = clientX;
    gesture.lastTime = performance.now();
    gesture.velocityX = 0;
    gesture.axis = null;
    gesture.isDragging = false;
    gesture.drawerWidth = width;
  }

  function updateGesture(clientX, clientY, rawEvent) {
    if (!gesture.active || !isMenuOpen()) return;

    const dx = clientX - gesture.startX;
    const dy = clientY - gesture.startY;

    if (gesture.axis === null) {
      if (Math.abs(dx) < SWIPE_SLOP_PX && Math.abs(dy) < SWIPE_SLOP_PX) {
        return;
      }
      if (Math.abs(dy) > Math.abs(dx)) {
        gesture.axis = 'y';
        return;
      }
      gesture.axis = 'x';
    }

    if (gesture.axis !== 'x') return;

    if (!gesture.isDragging) {
      gesture.isDragging = true;
      menu.setAttribute('data-dragging', 'true');
      scrim?.setAttribute('data-dragging', 'true');
    }

    if (rawEvent && rawEvent.cancelable) {
      rawEvent.preventDefault();
    }

    const now = performance.now();
    const dt = now - gesture.lastTime;
    if (dt > 0) {
      const instantVx = (clientX - gesture.lastX) / dt;
      gesture.velocityX =
        gesture.velocityX === 0 ? instantVx : gesture.velocityX * 0.35 + instantVx * 0.65;
      gesture.lastX = clientX;
      gesture.lastTime = now;
    }

    const width = gesture.drawerWidth || 320;
    const clampedX = Math.min(0, Math.max(-width, dx));
    const progress = Math.min(1, Math.max(0, Math.abs(clampedX) / width));

    menu.style.transform = `translate3d(${clampedX}px, 0, 0)`;
    if (scrim) {
      scrim.style.opacity = String(Number((1 - progress).toFixed(3)));
    }
  }

  function finishGesture(clientX, { canceled = false } = {}) {
    if (!gesture.active) return;

    const wasDragging = gesture.isDragging;
    const endX = typeof clientX === 'number' ? clientX : gesture.lastX;
    const dx = endX - gesture.startX;
    const vx = gesture.velocityX;
    const width = gesture.drawerWidth || 320;

    gesture.active = false;
    gesture.source = '';
    gesture.pointerId = null;
    gesture.axis = null;
    gesture.isDragging = false;

    menu.removeAttribute('data-dragging');
    scrim?.removeAttribute('data-dragging');

    if (!wasDragging) return;

    if (Math.abs(dx) > 10) {
      suppressClickUntil = performance.now() + 350;
    }

    const draggedRatio = Math.abs(Math.min(0, dx)) / width;
    const shouldDismiss =
      !canceled &&
      (draggedRatio >= DISMISS_DISTANCE_RATIO ||
        (vx <= DISMISS_VELOCITY_PX_PER_MS && dx < -20) ||
        (dx < -60 && vx <= -0.15));

    if (shouldDismiss) {
      const remainingPx = Math.max(0, width - Math.abs(Math.min(0, dx)));
      const speed = Math.max(Math.abs(vx), 0.8);
      const durationMs = Math.min(280, Math.max(140, Math.round(remainingPx / speed)));
      closeMenu({ restoreFocus: true, durationMs });
    } else {
      menu.style.transform = '';
      if (scrim) {
        scrim.style.opacity = '';
      }
    }
  }

  // Touch events for mobile browsers and touch emulation
  const onTouchStart = (event) => {
    if (event.touches.length !== 1) return;
    const touch = event.touches[0];
    startGesture(touch.clientX, touch.clientY, 'touch');
  };

  const onTouchMove = (event) => {
    if (!gesture.active || event.touches.length !== 1) return;
    const touch = event.touches[0];
    updateGesture(touch.clientX, touch.clientY, event);
  };

  const onTouchEnd = (event) => {
    if (!gesture.active) return;
    const touch = event.changedTouches?.[0];
    finishGesture(touch ? touch.clientX : gesture.lastX, { canceled: false });
  };

  const onTouchCancel = () => {
    if (!gesture.active) return;
    finishGesture(gesture.lastX, { canceled: true });
  };

  menu.addEventListener('touchstart', onTouchStart, { passive: true });
  menu.addEventListener('touchmove', onTouchMove, { passive: false });
  menu.addEventListener('touchend', onTouchEnd, { passive: true });
  menu.addEventListener('touchcancel', onTouchCancel, { passive: true });

  scrim?.addEventListener('touchstart', onTouchStart, { passive: true });
  scrim?.addEventListener('touchmove', onTouchMove, { passive: false });
  scrim?.addEventListener('touchend', onTouchEnd, { passive: true });
  scrim?.addEventListener('touchcancel', onTouchCancel, { passive: true });

  // Pointer events for mouse/pen drag and pointer-based touch environments
  const onPointerDown = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    startGesture(event.clientX, event.clientY, 'pointer', event.pointerId);
  };

  menu.addEventListener('pointerdown', onPointerDown);
  scrim?.addEventListener('pointerdown', onPointerDown);

  window.addEventListener('pointermove', (event) => {
    if (!gesture.active || gesture.source !== 'pointer') return;
    if (gesture.pointerId !== null && event.pointerId !== gesture.pointerId) return;
    updateGesture(event.clientX, event.clientY, event);
  });

  window.addEventListener('pointerup', (event) => {
    if (!gesture.active || gesture.source !== 'pointer') return;
    if (gesture.pointerId !== null && event.pointerId !== gesture.pointerId) return;
    finishGesture(event.clientX, { canceled: false });
  });

  window.addEventListener('pointercancel', (event) => {
    if (!gesture.active || gesture.source !== 'pointer') return;
    if (gesture.pointerId !== null && event.pointerId !== gesture.pointerId) return;
    finishGesture( gesture.lastX, { canceled: true });
  });

  // Automatically close the mobile drawer if viewport expands to desktop (>= 900px)
  if (typeof window.matchMedia === 'function') {
    const desktopMq = window.matchMedia('(min-width: 900px)');
    const handleViewportChange = (event) => {
      if (event.matches && isMenuOpen()) {
        closeMenu({ restoreFocus: false });
      }
    };
    if (typeof desktopMq.addEventListener === 'function') {
      desktopMq.addEventListener('change', handleViewportChange);
    }
  }

  document.addEventListener('keydown', (event) => {
    if (!isMenuOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
      return;
    }

    if (event.key === 'Tab') {
      const focusables = Array.from(menu.querySelectorAll(focusableSelector));
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}

function resolveBackToCollectionHref() {
  const validCategoryIds = new Set(CATEGORIES.map((c) => c.id));
  const currentParams = new URLSearchParams(window.location.search);

  let category = (currentParams.get('category') || '').toLowerCase().trim();
  let query = (currentParams.get('q') || '').trim();

  // Fallback to same-origin referrer if the URL itself didn't carry query params
  if (!category && !query && document.referrer) {
    try {
      const refUrl = new URL(document.referrer);
      if (refUrl.origin === window.location.origin) {
        category = (refUrl.searchParams.get('category') || '').toLowerCase().trim();
        query = (refUrl.searchParams.get('q') || '').trim();
      }
    } catch {
      // Ignore malformed referrer
    }
  }

  const outParams = new URLSearchParams();
  if (category && validCategoryIds.has(category)) {
    outParams.set('category', category);
  }
  if (query) {
    outParams.set('q', query);
  }

  const qs = outParams.toString();
  return qs ? `/?${qs}#shop` : '/#shop';
}

function extractProductIdFromLocation() {
  const params = new URLSearchParams(window.location.search);
  const queryId = params.get('id');
  if (queryId) return queryId;

  const segments = window.location.pathname.split('/').filter(Boolean);
  if (segments[0] === 'products' && segments[1]) {
    return segments[1];
  }
  return '';
}

function setDocumentMeta(title, description) {
  document.title = title;
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.name = 'description';
    document.head.append(metaDesc);
  }
  metaDesc.setAttribute('content', description);
}

function ensureProductDomShell() {
  const header = document.getElementById('site-header');
  if (header) {
    header.setAttribute('data-state', 'scrolled');
    const wordmark = header.querySelector('.site-header__wordmark');
    if (wordmark) {
      wordmark.setAttribute('href', '/');
    }
  }

  const sentinel = document.getElementById('scroll-sentinel');
  if (sentinel) {
    sentinel.remove();
  }

  document.querySelectorAll('a[data-nav-search]').forEach((searchLink) => {
    searchLink.setAttribute('href', '/#shop');
    searchLink.removeAttribute('data-nav-search');
  });

  const mainEl = document.getElementById('main-content');
  if (mainEl && !document.getElementById('product-view')) {
    mainEl.classList.add('product-main');
    mainEl.innerHTML = PRODUCT_MAIN_TEMPLATE;
  }
}

export function initProductPage() {
  ensureProductDomShell();
  initBagDrawer();
  initFooter();

  const pageController = new AbortController();
  const abortPageRequests = () => {
    if (!pageController.signal.aborted) {
      pageController.abort('PAGE_LEAVE');
    }
  };

  window.addEventListener('pagehide', abortPageRequests, { once: true });
  window.addEventListener('beforeunload', abortPageRequests, { once: true });

  // Also abort cleanly if user clicks an internal navigation link mid-request
  document.addEventListener(
    'click',
    (event) => {
      const anchor = event.target.closest('a[href]');
      if (!anchor) return;
      const href = anchor.getAttribute('href') || '';
      if (href && !href.startsWith('#')) {
        abortPageRequests();
      }
    },
    { capture: true }
  );

  // Sync initial bag count from GET /api/cart without blocking page render
  cartApi
    .getCart({ signal: pageController.signal })
    .then((cart) => {
      if (!pageController.signal.aborted) {
        syncBagFromCart(cart);
      }
    })
    .catch(() => {
      // Ignore initial background sync errors or aborts
    });

  const productView = document.getElementById('product-view');
  const notFoundView = document.getElementById('product-not-found');
  const backLink = document.getElementById('product-back-link');
  const notFoundBackLink = document.getElementById('not-found-back-link');

  const backHref = resolveBackToCollectionHref();
  if (backLink) backLink.href = backHref;
  if (notFoundBackLink) notFoundBackLink.href = backHref;

  const productId = extractProductIdFromLocation();
  const product = getProductById(productId);

  if (!product) {
    if (productView) productView.hidden = true;
    if (notFoundView) notFoundView.hidden = false;
    setDocumentMeta(
      'Plant not found | Folia',
      'The specimen you are looking for is not in the current Folia collection.'
    );
    return;
  }

  if (productView) productView.hidden = false;
  if (notFoundView) notFoundView.hidden = true;

  // 1. Document Title & Meta Description
  setDocumentMeta(`${product.name} | Folia`, product.description);

  // 2. Gallery Images & Scroll-Snap Counter
  const galleryEl = document.getElementById('product-gallery');
  const mediaStripEl = document.getElementById('product-media-strip');
  const mediaCounterEl = document.getElementById('product-media-counter');

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];
  const alts = Array.isArray(product.alts) ? product.alts : [];
  const totalImages = images.length;
  const isMulti = totalImages > 1;

  if (galleryEl) {
    galleryEl.setAttribute('data-multi', String(isMulti));
  }

  if (mediaStripEl) {
    if (isMulti) {
      mediaStripEl.tabIndex = 0;
    } else {
      mediaStripEl.removeAttribute('tabindex');
    }
    const fragment = document.createDocumentFragment();
    images.forEach((src, index) => {
      const item = document.createElement('div');
      item.className = 'product__media-item';
      item.dataset.index = String(index);

      const img = document.createElement('img');
      img.className = 'product__media-image';
      img.src = src;
      img.alt = alts[index] || `${product.name} (${product.latin}) — view ${index + 1}`;
      img.width = 848;
      img.height = 1264;
      if (index === 0) {
        img.fetchPriority = 'high';
      } else {
        img.loading = 'lazy';
      }
      img.decoding = 'async';

      item.append(img);
      fragment.append(item);
    });
    mediaStripEl.replaceChildren(fragment);
  }

  if (mediaCounterEl) {
    mediaCounterEl.textContent = `1 / ${totalImages}`;
  }

  if (mediaStripEl && mediaCounterEl && isMulti) {
    const updateCounterFromScroll = () => {
      const firstSlide = mediaStripEl.querySelector('.product__media-item');
      const slideWidth = firstSlide
        ? firstSlide.getBoundingClientRect().width
        : mediaStripEl.clientWidth;
      if (!slideWidth) return;
      const rawIndex = Math.round(mediaStripEl.scrollLeft / slideWidth) + 1;
      const currentIndex = Math.min(totalImages, Math.max(1, rawIndex));
      mediaCounterEl.textContent = `${currentIndex} / ${totalImages}`;
    };

    mediaStripEl.addEventListener('scroll', updateCounterFromScroll, { passive: true });
  }

  // 3. Info Panel Copy (Name, Price, Latin name, Description)
  const nameEl = document.getElementById('product-name');
  const priceEl = document.getElementById('product-price');
  const latinEl = document.getElementById('product-latin');
  const descEl = document.getElementById('product-description');

  if (nameEl) nameEl.textContent = product.name;
  if (priceEl) priceEl.textContent = formatPrice(product.price);
  if (latinEl) latinEl.textContent = product.latin;
  if (descEl) descEl.textContent = product.description;

  // 4. Pot Finish & Pot Size Radio Groups (Accessible keyboard support + pending lock)
  const potOptionsContainer = document.getElementById('product-pot-options');
  const potSizeOptionsContainer = document.getElementById('product-pot-size-options');
  const pots = Array.isArray(product.pots) ? product.pots : [];
  const potSizes = Array.isArray(product.potSizes) ? product.potSizes : [];

  let selectedPotId = pots[0]?.id || '';
  let selectedPotSizeId = potSizes[0]?.id || '';
  let selectedPotSizeLabel = potSizes[0]?.label || product.potSize || '';
  let isPending = false;
  const optionButtons = [];
  const sizeOptionButtons = [];

  function setContainerLocked(container, buttons, locked) {
    if (!container) return;
    if (locked) {
      container.setAttribute('data-locked', 'true');
      container.setAttribute('aria-disabled', 'true');
    } else {
      container.removeAttribute('data-locked');
      container.removeAttribute('aria-disabled');
    }
    for (const btn of buttons) {
      if (locked) {
        btn.setAttribute('aria-disabled', 'true');
      } else {
        btn.removeAttribute('aria-disabled');
      }
    }
  }

  function setPotSelectorLocked(locked) {
    setContainerLocked(potOptionsContainer, optionButtons, locked);
    setContainerLocked(potSizeOptionsContainer, sizeOptionButtons, locked);
  }

  function setupRadioGroup(container, options, buttonsList, onSelect) {
    if (!container || options.length === 0) return;

    const fragment = document.createDocumentFragment();

    function selectOption(targetIndex, { focus = false } = {}) {
      if (isPending) return;
      const boundedIndex = (targetIndex + buttonsList.length) % buttonsList.length;
      buttonsList.forEach((btn, idx) => {
        const isSelected = idx === boundedIndex;
        btn.setAttribute('aria-checked', String(isSelected));
        btn.tabIndex = isSelected ? 0 : -1;
        if (isSelected) {
          onSelect(options[idx], btn);
          if (focus) {
            btn.focus();
          }
        }
      });
    }

    options.forEach((opt, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'radio';
      btn.className = 'product__pot-option';
      btn.dataset.variantId = opt.id;
      const isSelected = index === 0;
      btn.setAttribute('aria-checked', String(isSelected));
      btn.tabIndex = isSelected ? 0 : -1;
      btn.textContent = opt.label;

      btn.addEventListener('click', () => {
        if (isPending) return;
        selectOption(index, { focus: false });
      });

      buttonsList.push(btn);
      fragment.append(btn);
    });

    container.replaceChildren(fragment);

    container.addEventListener('keydown', (event) => {
      if (isPending) {
        if (
          event.key === 'ArrowRight' ||
          event.key === 'ArrowDown' ||
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowUp' ||
          event.key === 'Home' ||
          event.key === 'End' ||
          event.key === ' ' ||
          event.key === 'Enter'
        ) {
          event.preventDefault();
        }
        return;
      }

      const currentIndex = buttonsList.findIndex(
        (btn) => btn.getAttribute('aria-checked') === 'true'
      );
      if (currentIndex === -1) return;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        selectOption(currentIndex + 1, { focus: true });
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        selectOption(currentIndex - 1, { focus: true });
      } else if (event.key === 'Home') {
        event.preventDefault();
        selectOption(0, { focus: true });
      } else if (event.key === 'End') {
        event.preventDefault();
        selectOption(buttonsList.length - 1, { focus: true });
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        const focusedIndex = buttonsList.indexOf(document.activeElement);
        if (focusedIndex !== -1) {
          selectOption(focusedIndex, { focus: true });
        }
      }
    });
  }

  setupRadioGroup(potOptionsContainer, pots, optionButtons, (opt) => {
    selectedPotId = opt.id;
  });

  setupRadioGroup(potSizeOptionsContainer, potSizes, sizeOptionButtons, (opt) => {
    selectedPotSizeId = opt.id;
    selectedPotSizeLabel = opt.label;
    const potSizeDd = document.getElementById('detail-pot-size');
    if (potSizeDd) {
      potSizeDd.textContent = selectedPotSizeLabel;
    }
  });

  // 5. Add to Bag Button (idle -> pending -> success / failure with Idempotency-Key retry)
  const addBtn = document.getElementById('add-to-bag-btn');
  const addBtnLabel = document.getElementById('add-to-bag-label');
  const errorEl = document.getElementById('add-to-bag-error');
  const liveStatusEl = document.getElementById('product-live-status');

  let addedStateTimer = null;
  let retryIntent = null;

  function setButtonLabel(text) {
    if (addBtnLabel) {
      addBtnLabel.textContent = text;
    } else if (addBtn) {
      addBtn.textContent = text;
    }
  }

  function announcePolite(message) {
    if (!liveStatusEl) return;
    liveStatusEl.textContent = '';
    window.requestAnimationFrame(() => {
      if (!pageController.signal.aborted) {
        liveStatusEl.textContent = message;
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener('pointerdown', () => {
      if (isPending) return;
      addBtn.setAttribute('data-pressed', 'true');
    });

    const clearPressed = () => {
      addBtn.removeAttribute('data-pressed');
    };
    addBtn.addEventListener('pointerup', clearPressed);
    addBtn.addEventListener('pointerleave', clearPressed);
    addBtn.addEventListener('pointercancel', clearPressed);

    addBtn.addEventListener('click', async () => {
      // Ignore extra clicks while pending; focus stays on the button
      if (isPending) return;

      if (addedStateTimer) {
        window.clearTimeout(addedStateTimer);
        addedStateTimer = null;
      }

      // Capture product and variant (pot finish + pot size) at click time
      const capturedProductId = product.id;
      const capturedVariantId = formatVariantId(selectedPotId, selectedPotSizeId);

      // Reuse the same Idempotency-Key when retrying a failed attempt for the same product + variant
      if (
        !retryIntent ||
        retryIntent.productId !== capturedProductId ||
        retryIntent.variantId !== capturedVariantId
      ) {
        retryIntent = {
          productId: capturedProductId,
          variantId: capturedVariantId,
          idempotencyKey: createIdempotencyKey(),
        };
      }

      const activeIdempotencyKey = retryIntent.idempotencyKey;

      // Enter pending state
      isPending = true;
      setPotSelectorLocked(true);

      if (errorEl) {
        errorEl.hidden = true;
        errorEl.textContent = '';
      }

      setButtonLabel('Adding');
      addBtn.setAttribute('data-state', 'pending');
      addBtn.setAttribute('aria-busy', 'true');
      addBtn.setAttribute('aria-disabled', 'true');
      announcePolite(`Adding ${product.name} to your bag`);

      const startedAt = performance.now();

      try {
        let updatedCart;
        if (import.meta.env.DEV) {
          updatedCart = await cartApi.addLine({
            productId: capturedProductId,
            variantId: capturedVariantId,
            quantity: 1,
            idempotencyKey: activeIdempotencyKey,
            signal: pageController.signal,
          });
        } else {
          const nextLines = incrementBagLine(capturedProductId, capturedVariantId, 1);
          updatedCart = { lines: nextLines, updatedAt: new Date().toISOString() };
        }

        const elapsed = performance.now() - startedAt;
        if (elapsed < MIN_PENDING_MS) {
          await waitMs(MIN_PENDING_MS - elapsed, pageController.signal);
        }

        if (pageController.signal.aborted) return;

        // Transition to success state
        isPending = false;
        retryIntent = null;
        setPotSelectorLocked(false);

        syncBagFromCart(updatedCart);

        setButtonLabel('Added');
        addBtn.setAttribute('data-state', 'added');
        addBtn.removeAttribute('aria-busy');
        addBtn.removeAttribute('aria-disabled');
        announcePolite('Added to your bag');

        openBagDrawer({ triggerEl: addBtn });

        addedStateTimer = window.setTimeout(() => {
          if (pageController.signal.aborted || isPending) return;
          setButtonLabel('Add to bag');
          addBtn.setAttribute('data-state', 'idle');
          addedStateTimer = null;
        }, SUCCESS_HOLD_MS);
      } catch (err) {
        if (
          pageController.signal.aborted ||
          (err instanceof CartApiError && err.code === 'ABORT_ERROR')
        ) {
          return;
        }

        const elapsed = performance.now() - startedAt;
        if (elapsed < MIN_PENDING_MS) {
          await waitMs(MIN_PENDING_MS - elapsed, pageController.signal);
        }

        if (pageController.signal.aborted) return;

        // Transition to failure state (keeping retryIntent.idempotencyKey for retry)
        isPending = false;
        setPotSelectorLocked(false);

        setButtonLabel('Try again');
        addBtn.setAttribute('data-state', 'error');
        addBtn.removeAttribute('aria-busy');
        addBtn.removeAttribute('aria-disabled');

        if (errorEl) {
          errorEl.textContent = ERROR_ALERT_TEXT;
          errorEl.hidden = false;
        }
      }
    });
  }

  // 6. Details Definition List (Height, Pot size, Light, Water, Pets — hide rows with no data)
  const detailsList = document.getElementById('product-details');
  const detailMappings = [
    { key: 'height', elId: 'detail-height', value: product.height || product.size || '' },
    { key: 'potSize', elId: 'detail-pot-size', value: selectedPotSizeLabel },
    { key: 'light', elId: 'detail-light', value: product.care?.light || '' },
    { key: 'water', elId: 'detail-water', value: product.care?.water || '' },
    { key: 'pets', elId: 'detail-pets', value: product.care?.pets || '' },
  ];

  let visibleRowCount = 0;
  for (const field of detailMappings) {
    const row = detailsList?.querySelector(`[data-detail="${field.key}"]`);
    const dd = document.getElementById(field.elId);
    const hasValue = Boolean(field.value && String(field.value).trim());

    if (row && dd) {
      if (hasValue) {
        dd.textContent = field.value;
        row.hidden = false;
        visibleRowCount += 1;
      } else {
        dd.textContent = '';
        row.hidden = true;
      }
    }
  }

  if (detailsList) {
    detailsList.hidden = visibleRowCount === 0;
  }
}

// Auto-initialize when loaded directly via product.html
if (document.getElementById('product-view')) {
  initMobileMenu();
  initProductPage();
}
