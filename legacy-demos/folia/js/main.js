/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Main Application Entry
 */

import { CATEGORIES, PRODUCTS, formatPrice } from './products.js';
import { initProductPage } from './product.js';
import { cartApi } from './cartApi.js';
import { FREE_DELIVERY_THRESHOLD_PENCE, initBagDrawer, syncBagFromCart } from './bag.js';
import { initFooter, subscribe } from './footer.js';

export { subscribe };

export const STORY_DETAILS = [
  {
    term: 'Delivery',
    detail: `2 to 4 working days, free over ${formatPrice(FREE_DELIVERY_THRESHOLD_PENCE)}`,
  },
  {
    term: 'Packaging',
    detail: 'Plain box, tissue and jute twine',
  },
  {
    term: 'Care',
    detail: 'A card in every box with light and watering notes',
  },
  {
    term: 'Returns',
    detail: '14 days if a plant arrives damaged',
  },
];

function initHeaderStateObserver() {
  const header = document.getElementById('site-header');
  const sentinel = document.getElementById('scroll-sentinel');

  if (!header || !sentinel) return;

  // Driven solely by IntersectionObserver on the 1px top sentinel (no scroll listeners).
  // rootMargin '80px 0px 0px 0px' extends the top intersection boundary by 80px so
  // the header transitions to data-state="scrolled" after scrolling ~80px down,
  // and returns to data-state="top" when scrolling back within 80px of the top.
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const nextState = entry.isIntersecting ? 'top' : 'scrolled';
        header.setAttribute('data-state', nextState);
      }
    },
    {
      root: null,
      rootMargin: '80px 0px 0px 0px',
      threshold: 0,
    }
  );

  observer.observe(sentinel);
}

function initMobileMenu() {
  const openBtn = document.getElementById('menu-open-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const menu = document.getElementById('mobile-menu');

  if (!openBtn || !closeBtn || !menu) return;

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
        el.setAttribute('inert', '');
      } else {
        el.removeAttribute('inert');
      }
    }
  }

  function openMenu() {
    menu.setAttribute('data-open', 'true');
    menu.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    setBackgroundInert(true);
    closeBtn.focus();
  }

  function closeMenu({ restoreFocus = true } = {}) {
    if (menu.getAttribute('data-open') !== 'true') return;
    menu.setAttribute('data-open', 'false');
    menu.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    setBackgroundInert(false);
    if (restoreFocus) {
      openBtn.focus();
    }
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', () => closeMenu({ restoreFocus: true }));

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      const isSearchLink = link.hasAttribute('data-nav-search');
      closeMenu({ restoreFocus: !isSearchLink });
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

function initEditorialReveal() {
  const section = document.getElementById('dark-foliage');
  const textBlock = document.getElementById('editorial-text');

  if (!section || !textBlock) return;

  // Respect prefers-reduced-motion: leave text immediately visible without animation.
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    textBlock.removeAttribute('data-reveal');
    return;
  }

  textBlock.setAttribute('data-reveal', 'pending');

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          textBlock.setAttribute('data-reveal', 'visible');
          observer.unobserve(section);
        }
      }
    },
    {
      root: null,
      threshold: 0.35,
    }
  );

  observer.observe(section);
}

function createLookbookItem(product) {
  const li = document.createElement('li');
  li.className = 'lookbook__item';
  li.dataset.category = product.category;

  const formattedPrice = formatPrice(product.price);

  const link = document.createElement('a');
  link.className = 'lookbook__cell';
  link.href = product.href;
  link.setAttribute('aria-label', `${product.name}, ${formattedPrice}`);

  const img = document.createElement('img');
  img.className = 'lookbook__image';
  img.src = product.image;
  img.alt =
    product.alts?.[0] ||
    `${product.name} (${product.latin}, ${product.size}) in a studio pot against a mid-grey backdrop`;
  img.width = 848;
  img.height = 1264;
  img.loading = 'lazy';
  img.decoding = 'async';

  const caption = document.createElement('div');
  caption.className = 'lookbook__caption';
  caption.setAttribute('aria-hidden', 'true');

  const topRow = document.createElement('div');
  topRow.className = 'lookbook__caption-row';

  const nameSpan = document.createElement('span');
  nameSpan.className = 'lookbook__name';
  nameSpan.textContent = product.name;

  const priceSpan = document.createElement('span');
  priceSpan.className = 'lookbook__price';
  priceSpan.textContent = formattedPrice;

  topRow.append(nameSpan, priceSpan);

  const latinSpan = document.createElement('span');
  latinSpan.className = 'lookbook__latin';
  latinSpan.textContent = product.latin;

  caption.append(topRow, latinSpan);
  link.append(img, caption);
  li.append(link);

  return {
    product,
    element: li,
    link,
    searchHaystack: `${product.name} ${product.latin} ${product.size}`.toLowerCase(),
  };
}

function initLookbook() {
  const shopSection = document.getElementById('shop');
  const filtersContainer = document.getElementById('lookbook-filters');
  const searchInput = document.getElementById('lookbook-search');
  const countEl = document.getElementById('lookbook-count');
  const grid = document.getElementById('lookbook-grid');
  const emptyEl = document.getElementById('lookbook-empty');
  const emptyTextEl = document.getElementById('lookbook-empty-text');
  const resetBtn = document.getElementById('lookbook-reset-btn');

  if (!shopSection || !filtersContainer || !searchInput || !countEl || !grid || !emptyEl) {
    return;
  }

  // 1. Generate filter buttons from data so categories with 0 products (pots, care) are omitted
  const populatedCategories = CATEGORIES.filter((cat) =>
    PRODUCTS.some((product) => product.category === cat.id)
  );
  const filterDefinitions = [{ id: 'all', label: 'All' }, ...populatedCategories];
  const filterButtons = [];

  const filterFragment = document.createDocumentFragment();
  for (const def of filterDefinitions) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'lookbook__filter-btn';
    btn.dataset.filterCategory = def.id;
    btn.setAttribute('aria-pressed', String(def.id === 'all'));
    btn.textContent = def.label;
    filterButtons.push(btn);
    filterFragment.append(btn);
  }
  filtersContainer.replaceChildren(filterFragment);

  // 2. Render all product cells once; toggle [hidden] when filtering
  const itemRecords = PRODUCTS.map((product) => createLookbookItem(product));
  const gridFragment = document.createDocumentFragment();
  for (const record of itemRecords) {
    gridFragment.append(record.element);
  }
  grid.replaceChildren(gridFragment);

  // 3. Parse initial state from URL (?category=...&q=...)
  const validCategoryIds = new Set(['all', ...CATEGORIES.map((c) => c.id)]);
  const initialParams = new URLSearchParams(window.location.search);
  const rawCategory = (initialParams.get('category') || 'all').toLowerCase().trim();
  const initialQuery = initialParams.get('q') || '';

  const state = {
    category: validCategoryIds.has(rawCategory) ? rawCategory : 'all',
    query: initialQuery,
  };

  searchInput.value = state.query;

  function buildFilterQueryString() {
    const params = new URLSearchParams();
    if (state.category && state.category !== 'all') {
      params.set('category', state.category);
    }
    const trimmedQuery = state.query.trim();
    if (trimmedQuery) {
      params.set('q', trimmedQuery);
    }
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  function syncUrlState(hashOverride) {
    const url = new URL(window.location.href);
    if (state.category && state.category !== 'all') {
      url.searchParams.set('category', state.category);
    } else {
      url.searchParams.delete('category');
    }

    const trimmedQuery = state.query.trim();
    if (trimmedQuery) {
      url.searchParams.set('q', trimmedQuery);
    } else {
      url.searchParams.delete('q');
    }

    if (hashOverride !== undefined) {
      url.hash = hashOverride;
    }

    window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
  }

  function applyLookbookState() {
    for (const btn of filterButtons) {
      const isPressed = btn.dataset.filterCategory === state.category;
      btn.setAttribute('aria-pressed', String(isPressed));
    }

    const normalizedQuery = state.query.trim().toLowerCase();
    const filterQueryString = buildFilterQueryString();
    let visibleCount = 0;

    for (const record of itemRecords) {
      const matchesCategory =
        state.category === 'all' || record.product.category === state.category;
      const matchesQuery =
        !normalizedQuery || record.searchHaystack.includes(normalizedQuery);
      const isVisible = matchesCategory && matchesQuery;

      record.element.hidden = !isVisible;
      record.link.href = `${record.product.href}${filterQueryString}`;
      if (isVisible) {
        visibleCount += 1;
      }
    }

    countEl.textContent = `${visibleCount} ${visibleCount === 1 ? 'piece' : 'pieces'}`;

    if (visibleCount === 0) {
      grid.hidden = true;
      emptyEl.hidden = false;

      const categoryDef = CATEGORIES.find((c) => c.id === state.category);
      const categoryHasProducts =
        state.category === 'all' ||
        PRODUCTS.some((p) => p.category === state.category);

      if (!categoryHasProducts && categoryDef?.emptyMessage && !normalizedQuery) {
        emptyTextEl.textContent = categoryDef.emptyMessage;
      } else {
        emptyTextEl.textContent = 'Nothing matches that search';
      }
    } else {
      grid.hidden = false;
      emptyEl.hidden = true;
    }
  }

  function scrollToShop({ instant = false } = {}) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = instant || prefersReducedMotion ? 'auto' : 'smooth';
    const headerHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    const targetTop = Math.max(
      0,
      shopSection.getBoundingClientRect().top + window.scrollY - headerHeight
    );
    window.scrollTo({ top: targetTop, behavior });
  }

  // 4. Filter button group click handler
  filtersContainer.addEventListener('click', (event) => {
    const btn = event.target.closest('button[data-filter-category]');
    if (!btn) return;

    state.category = btn.dataset.filterCategory;
    applyLookbookState();
    syncUrlState();
  });

  // 5. Search input with 100ms debounce & Escape to clear
  let searchDebounceTimer = null;

  searchInput.addEventListener('input', () => {
    if (searchDebounceTimer) {
      window.clearTimeout(searchDebounceTimer);
    }
    searchDebounceTimer = window.setTimeout(() => {
      state.query = searchInput.value;
      applyLookbookState();
      syncUrlState();
    }, 100);
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (searchDebounceTimer) {
        window.clearTimeout(searchDebounceTimer);
      }
      searchInput.value = '';
      state.query = '';
      applyLookbookState();
      syncUrlState();
    }
  });

  // 6. Empty state "Show everything" button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchDebounceTimer) {
        window.clearTimeout(searchDebounceTimer);
      }
      state.category = 'all';
      state.query = '';
      searchInput.value = '';
      applyLookbookState();
      syncUrlState();
    });
  }

  // 7. Header category links (Large plants, Small plants, Pots, Care) & "Shop the collection" CTA
  document.querySelectorAll('a[data-category]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetCategory = link.dataset.category;
      if (!targetCategory || !validCategoryIds.has(targetCategory)) return;

      event.preventDefault();
      if (searchDebounceTimer) {
        window.clearTimeout(searchDebounceTimer);
      }
      state.category = targetCategory;
      state.query = '';
      searchInput.value = '';
      applyLookbookState();
      syncUrlState('#shop');
      scrollToShop();
    });
  });

  // 8. Header & mobile menu Search links: scroll to grid and focus search field
  document.querySelectorAll('a[data-nav-search]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      syncUrlState('#shop');
      scrollToShop();
      searchInput.focus({ preventScroll: true });
    });
  });

  // Apply initial state immediately on load
  applyLookbookState();

  // If loaded directly with #shop (e.g. /?category=small#shop), position #shop under fixed header
  if (window.location.hash === '#shop') {
    requestAnimationFrame(() => {
      scrollToShop({ instant: true });
    });
  }
}

function initStory() {
  const storySection = document.getElementById('about');
  const detailsList = document.getElementById('story-details');
  if (!detailsList) return;

  const fragment = document.createDocumentFragment();
  for (const row of STORY_DETAILS) {
    const rowEl = document.createElement('div');
    rowEl.className = 'story__detail-row';

    const dt = document.createElement('dt');
    dt.className = 'story__term';
    dt.textContent = row.term;

    const dd = document.createElement('dd');
    dd.className = 'story__detail';
    dd.textContent = row.detail;

    rowEl.append(dt, dd);
    fragment.append(rowEl);
  }

  detailsList.replaceChildren(fragment);

  if (!storySection) return;

  function scrollToStory({ instant = false } = {}) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = instant || prefersReducedMotion ? 'auto' : 'smooth';
    const headerHeight =
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
    const targetTop = Math.max(
      0,
      storySection.getBoundingClientRect().top + window.scrollY - headerHeight
    );
    window.scrollTo({ top: targetTop, behavior });
  }

  document.querySelectorAll('a[href="#about"], a[href="/#about"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const url = new URL(window.location.href);
      url.hash = '#about';
      window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`);
      scrollToStory();
    });
  });

  if (window.location.hash === '#about') {
    requestAnimationFrame(() => {
      scrollToStory({ instant: true });
    });
  }
}

const isProductRoute =
  window.location.pathname === '/products' ||
  window.location.pathname.startsWith('/products/');

if (isProductRoute) {
  initMobileMenu();
  initBagDrawer();
  initProductPage();
  initFooter();
} else {
  initHeaderStateObserver();
  initMobileMenu();
  initBagDrawer();
  initFooter();
  initEditorialReveal();
  initLookbook();
  initStory();

  const homeController = new AbortController();
  window.addEventListener('pagehide', () => homeController.abort(), { once: true });
  cartApi
    .getCart({ signal: homeController.signal })
    .then((cart) => {
      if (!homeController.signal.aborted) {
        syncBagFromCart(cart);
      }
    })
    .catch(() => {
      // Ignore background cart fetch abort or error
    });
}
