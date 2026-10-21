/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Shared Mobile Navigation & Section Scroll Helpers
 */

export function scrollToSection(targetEl, { instant = false } = {}) {
  if (!targetEl) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const behavior = instant || prefersReducedMotion ? 'auto' : 'smooth';
  const headerHeight =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64;
  const targetTop = Math.max(
    0,
    targetEl.getBoundingClientRect().top + window.scrollY - headerHeight
  );
  window.scrollTo({ top: targetTop, behavior });
}

export function initMobileMenu() {
  const openBtn = document.getElementById('menu-open-btn');
  const closeBtn = document.getElementById('menu-close-btn');
  const menu = document.getElementById('mobile-menu');

  if (!openBtn || !closeBtn || !menu || menu.dataset.bound === 'true') return;
  menu.dataset.bound = 'true';

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
      const href = link.getAttribute('href') || '';
      const staysOnPage =
        link.hasAttribute('data-category') ||
        link.hasAttribute('data-bag-trigger') ||
        href.startsWith('#');
      const shouldRestoreFocus = staysOnPage && !link.hasAttribute('data-nav-search');
      closeMenu({ restoreFocus: shouldRestoreFocus });
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
