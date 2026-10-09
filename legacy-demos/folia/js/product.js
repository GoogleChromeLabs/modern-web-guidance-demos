/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Product Detail Page Controller (/products/[id])
 */

import { CATEGORIES, formatPrice, getProductById } from './products.js';

/**
 * Stub bag handler: logs the product and variant IDs to the console.
 * @param {string} productId
 * @param {string} variantId
 */
export function addToBag(productId, variantId) {
  console.log('addToBag', { productId, variantId });
}

if (typeof window !== 'undefined') {
  window.addToBag = addToBag;
}

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

      <div class="product__actions">
        <button
          type="button"
          id="add-to-bag-btn"
          class="product__add-btn"
          data-state="default"
        >
          Add to bag
        </button>
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

export function initMobileMenu() {
  const openBtn = document.getElementById('menu-open-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const menu = document.getElementById('mobile-menu');

  if (!openBtn || !closeBtn || !menu || menu.dataset.bound === 'true') return;
  menu.dataset.bound = 'true';

  const focusableSelector = 'a[href], button:not([disabled])';

  function openMenu() {
    menu.setAttribute('data-open', 'true');
    menu.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    closeBtn.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (menu.getAttribute('data-open') !== 'true') return;
    menu.setAttribute('data-open', 'false');
    menu.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    if (restoreFocus) {
      openBtn.focus();
    }
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', () => closeMenu({ restoreFocus: true }));

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu({ restoreFocus: false });
    });
  });

  document.addEventListener('keydown', (event) => {
    if (menu.getAttribute('data-open') !== 'true') return;

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
      if (index > 0) {
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

  // 4. Pot Finish Radio Group (Accessible keyboard support)
  const potOptionsContainer = document.getElementById('product-pot-options');
  const pots = Array.isArray(product.pots) ? product.pots : [];
  let selectedVariantId = pots[0]?.id || '';

  if (potOptionsContainer && pots.length > 0) {
    const optionButtons = [];
    const potFragment = document.createDocumentFragment();

    function selectPotOption(targetIndex, { focus = false } = {}) {
      const boundedIndex = (targetIndex + optionButtons.length) % optionButtons.length;
      optionButtons.forEach((btn, idx) => {
        const isSelected = idx === boundedIndex;
        btn.setAttribute('aria-checked', String(isSelected));
        btn.tabIndex = isSelected ? 0 : -1;
        if (isSelected) {
          selectedVariantId = btn.dataset.variantId || '';
          if (focus) {
            btn.focus();
          }
        }
      });
    }

    pots.forEach((pot, index) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.role = 'radio';
      btn.className = 'product__pot-option';
      btn.dataset.variantId = pot.id;
      const isSelected = index === 0;
      btn.setAttribute('aria-checked', String(isSelected));
      btn.tabIndex = isSelected ? 0 : -1;
      btn.textContent = pot.label;

      btn.addEventListener('click', () => {
        selectPotOption(index, { focus: false });
      });

      optionButtons.push(btn);
      potFragment.append(btn);
    });

    potOptionsContainer.replaceChildren(potFragment);

    potOptionsContainer.addEventListener('keydown', (event) => {
      const currentIndex = optionButtons.findIndex(
        (btn) => btn.getAttribute('aria-checked') === 'true'
      );
      if (currentIndex === -1) return;

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        selectPotOption(currentIndex + 1, { focus: true });
      } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        selectPotOption(currentIndex - 1, { focus: true });
      } else if (event.key === 'Home') {
        event.preventDefault();
        selectPotOption(0, { focus: true });
      } else if (event.key === 'End') {
        event.preventDefault();
        selectPotOption(optionButtons.length - 1, { focus: true });
      } else if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        const focusedIndex = optionButtons.indexOf(document.activeElement);
        if (focusedIndex !== -1) {
          selectPotOption(focusedIndex, { focus: true });
        }
      }
    });
  }

  // 5. Add to Bag Button (default, pressed, "Added" for 1.5s while staying enabled)
  const addBtn = document.getElementById('add-to-bag-btn');
  let addedStateTimer = null;

  if (addBtn) {
    addBtn.addEventListener('pointerdown', () => {
      addBtn.setAttribute('data-pressed', 'true');
    });

    const clearPressed = () => {
      addBtn.removeAttribute('data-pressed');
    };
    addBtn.addEventListener('pointerup', clearPressed);
    addBtn.addEventListener('pointerleave', clearPressed);
    addBtn.addEventListener('pointercancel', clearPressed);

    addBtn.addEventListener('click', () => {
      addToBag(product.id, selectedVariantId);

      if (addedStateTimer) {
        window.clearTimeout(addedStateTimer);
      }

      addBtn.textContent = 'Added';
      addBtn.setAttribute('data-state', 'added');

      addedStateTimer = window.setTimeout(() => {
        addBtn.textContent = 'Add to bag';
        addBtn.setAttribute('data-state', 'default');
        addedStateTimer = null;
      }, 1500);
    });
  }

  // 6. Details Definition List (Height, Pot size, Light, Water, Pets — hide rows with no data)
  const detailsList = document.getElementById('product-details');
  const detailMappings = [
    { key: 'height', elId: 'detail-height', value: product.height || product.size || '' },
    { key: 'potSize', elId: 'detail-pot-size', value: product.potSize || '' },
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
