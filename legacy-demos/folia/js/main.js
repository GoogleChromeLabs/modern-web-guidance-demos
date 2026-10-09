/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Main Application Entry
 */

import { PRODUCTS } from './products.js';

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

  function openMenu() {
    menu.setAttribute('data-open', 'true');
    menu.setAttribute('aria-hidden', 'false');
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
    closeBtn.focus();
  }

  function closeMenu() {
    if (menu.getAttribute('data-open') !== 'true') return;
    menu.setAttribute('data-open', 'false');
    menu.setAttribute('aria-hidden', 'true');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
    openBtn.focus();
  }

  openBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      closeMenu();
    });
  });

  document.addEventListener('keydown', (event) => {
    if (menu.getAttribute('data-open') !== 'true') return;

    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
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

function renderLookbookGrid(items = PRODUCTS) {
  const grid = document.getElementById('lookbook-grid');
  const countEl = document.getElementById('lookbook-count');

  if (!grid) return;

  if (countEl) {
    countEl.textContent = `${items.length} ${items.length === 1 ? 'piece' : 'pieces'}`;
  }

  const fragment = document.createDocumentFragment();

  for (const product of items) {
    const li = document.createElement('li');
    li.className = 'lookbook__item';
    li.dataset.category = product.category;

    const link = document.createElement('a');
    link.className = 'lookbook__cell';
    link.href = product.href;
    link.setAttribute('aria-label', `${product.name}, £${product.price}`);

    const img = document.createElement('img');
    img.className = 'lookbook__image';
    img.src = product.image;
    img.alt = `${product.name} (${product.latin}, ${product.size}) in a studio pot against a mid-grey backdrop`;
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
    priceSpan.textContent = `£${product.price}`;

    topRow.append(nameSpan, priceSpan);

    const latinSpan = document.createElement('span');
    latinSpan.className = 'lookbook__latin';
    latinSpan.textContent = product.latin;

    caption.append(topRow, latinSpan);
    link.append(img, caption);
    li.append(link);
    fragment.append(li);
  }

  grid.replaceChildren(fragment);
}

initHeaderStateObserver();
initMobileMenu();
initEditorialReveal();
renderLookbookGrid();
