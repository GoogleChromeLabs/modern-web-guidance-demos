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
      const href = link.getAttribute('href') || '';
      const staysOnPage =
        link.hasAttribute('data-category') ||
        link.hasAttribute('data-bag-trigger') ||
        href.startsWith('#');
      const isSearchLink = link.hasAttribute('data-nav-search');
      const isBagLink =
        link.hasAttribute('data-bag-trigger') || link.getAttribute('href') === '#bag';
      closeMenu({ restoreFocus: staysOnPage && !isSearchLink && !isBagLink });
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
    finishGesture(gesture.lastX, { canceled: true });
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
