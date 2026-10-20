/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 *
 * Folia Storefront — Site-Wide Footer Controller (Newsletter & Stub Link Toast)
 */

const FOOTER_TEMPLATE = `
  <div class="site-footer__top">
    <form id="footer-newsletter-form" class="site-footer__newsletter" novalidate>
      <label for="footer-newsletter-email" class="site-footer__newsletter-label">
        News of new collections
      </label>
      <div class="site-footer__newsletter-row">
        <input
          id="footer-newsletter-email"
          name="email"
          type="email"
          class="site-footer__newsletter-input"
          placeholder="Email address"
          autocomplete="email"
          aria-describedby="footer-newsletter-status"
          required
        >
        <button
          type="submit"
          id="footer-newsletter-submit"
          class="site-footer__newsletter-btn"
        >Subscribe</button>
      </div>
      <p
        id="footer-newsletter-status"
        class="site-footer__newsletter-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      ></p>
    </form>

    <div class="site-footer__columns">
      <div class="site-footer__col">
        <h2 class="site-footer__heading">Shop</h2>
        <ul class="site-footer__list">
          <li><a href="./?category=large#shop" class="site-footer__link" data-category="large">Large plants</a></li>
          <li><a href="./?category=small#shop" class="site-footer__link" data-category="small">Small plants</a></li>
          <li><a href="./?category=pots#shop" class="site-footer__link" data-category="pots">Pots</a></li>
          <li><a href="./?category=care#shop" class="site-footer__link" data-category="care">Care</a></li>
        </ul>
      </div>

      <div class="site-footer__col">
        <h2 class="site-footer__heading">Help</h2>
        <ul class="site-footer__list">
          <li><a href="#" class="site-footer__link" data-stub-link>Delivery</a></li>
          <li><a href="#" class="site-footer__link" data-stub-link>Plant care</a></li>
          <li><a href="#" class="site-footer__link" data-stub-link>Returns</a></li>
          <li><a href="#" class="site-footer__link" data-stub-link>Contact</a></li>
        </ul>
      </div>

      <div class="site-footer__col">
        <h2 class="site-footer__heading">Folia</h2>
        <ul class="site-footer__list">
          <li><a href="./#about" class="site-footer__link">About</a></li>
          <li><a href="#" class="site-footer__link" data-stub-link>Journal</a></li>
          <li><a href="#" class="site-footer__link" data-stub-link>Stockists</a></li>
        </ul>
      </div>
    </div>
  </div>

  <div class="site-footer__wordmark" aria-hidden="true">FOLIA</div>

  <div class="site-footer__legal">
    <p class="site-footer__legal-item">© 2026 Folia</p>
    <p class="site-footer__legal-item">Prototype storefront. Prices and copy are placeholders.</p>
  </div>

  <div
    id="footer-toast"
    class="site-footer__toast"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    data-visible="false"
  ></div>
`;

const SUBSCRIBE_DELAY_MS = 900;
const TOAST_DURATION_MS = 2400;

/**
 * Stub for the newsletter subscription call.
 * Waits 900ms and resolves without storing or sending the email.
 * @param {string} _email
 * @returns {Promise<void>}
 */
export async function subscribe(_email) {
  await new Promise((resolve) => {
    window.setTimeout(resolve, SUBSCRIBE_DELAY_MS);
  });
}

function isValidEmail(input) {
  const value = input.value.trim();
  if (!value) return false;
  if (typeof input.checkValidity === 'function' && !input.checkValidity()) {
    return false;
  }
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function initFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  if (!footer.querySelector('.site-footer__top')) {
    footer.innerHTML = FOOTER_TEMPLATE;
  }

  if (footer.dataset.bound === 'true') return;
  footer.dataset.bound = 'true';

  if (typeof window !== 'undefined' && typeof window.subscribe !== 'function') {
    window.subscribe = subscribe;
  }

  const form = document.getElementById('footer-newsletter-form');
  const emailInput = document.getElementById('footer-newsletter-email');
  const submitBtn = document.getElementById('footer-newsletter-submit');
  const statusEl = document.getElementById('footer-newsletter-status');
  const toastEl = document.getElementById('footer-toast');

  let isSubmitting = false;
  let toastTimer = null;

  if (form && emailInput && submitBtn && statusEl) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (isSubmitting) return;

      const email = emailInput.value.trim();
      if (!isValidEmail(emailInput)) {
        emailInput.setAttribute('aria-invalid', 'true');
        statusEl.textContent = 'Enter a valid email address.';
        emailInput.focus();
        return;
      }

      isSubmitting = true;
      emailInput.removeAttribute('aria-invalid');
      statusEl.textContent = '';

      submitBtn.textContent = 'Subscribing';
      emailInput.disabled = true;
      submitBtn.disabled = true;
      emailInput.setAttribute('aria-busy', 'true');
      submitBtn.setAttribute('aria-busy', 'true');

      try {
        const subscribeFn =
          typeof window !== 'undefined' && typeof window.subscribe === 'function'
            ? window.subscribe
            : subscribe;
        await subscribeFn(email);
        emailInput.value = '';
        statusEl.textContent = 'Thank you. You are on the list.';
      } catch {
        // Keep the typed email so the user can retry without re-entering it
        statusEl.textContent = 'Something went wrong. Please try again.';
      } finally {
        isSubmitting = false;
        emailInput.disabled = false;
        submitBtn.disabled = false;
        emailInput.removeAttribute('aria-busy');
        submitBtn.removeAttribute('aria-busy');
        submitBtn.textContent = 'Subscribe';
      }
    });
  }

  function showComingSoonToast() {
    if (!toastEl) return;
    if (toastTimer) {
      window.clearTimeout(toastTimer);
      toastTimer = null;
    }

    toastEl.textContent = 'Coming soon';
    toastEl.setAttribute('data-visible', 'true');

    toastTimer = window.setTimeout(() => {
      toastEl.setAttribute('data-visible', 'false');
      toastTimer = null;
    }, TOAST_DURATION_MS);
  }

  footer.querySelectorAll('a[href="#"], [data-stub-link]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showComingSoonToast();
    });
  });
}
