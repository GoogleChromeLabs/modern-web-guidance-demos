/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Main Application Entry
 */

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

initHeaderStateObserver();
initMobileMenu();
