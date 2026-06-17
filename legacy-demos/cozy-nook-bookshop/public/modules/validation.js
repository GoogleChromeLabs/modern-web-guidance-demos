/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

// TODO(MWG 💖): Optimize validation to match the projects Baseline target
const UserInvalidFallback = (() => {
  const dirtyState = new WeakMap();

  const updateState = (input) => {
    const isValid = input.checkValidity();

    // Update both visual and ARIA state
    input.classList.toggle('user-invalid-fallback', !isValid);
    input.classList.toggle('user-valid-fallback', isValid);

    if (!isValid) {
      input.setAttribute('aria-invalid', 'true');
    } else {
      input.removeAttribute('aria-invalid');
    }
  };

  const handleEvent = (event) => {
    const input = event.target;

    if (event.type === 'reset') {
      const controls = input.elements || [];
      for (const control of controls) {
        dirtyState.delete(control);
        control.classList.remove('user-invalid-fallback');
        control.classList.remove('user-valid-fallback');
        control.removeAttribute('aria-invalid');
      }
      return;
    }

    if (!input.checkValidity) return;

    if (event.type === 'input' || event.type === 'change') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasInteracted = true;
      dirtyState.set(input, state);
      if (state.hasBlurred) {
        updateState(input);
      }
    } else if (event.type === 'blur') {
      const state = dirtyState.get(input) || { hasInteracted: false, hasBlurred: false };
      state.hasBlurred = true;
      dirtyState.set(input, state);
      if (state.hasInteracted) {
        updateState(input);
      }
    }
  };

  const init = (root = document) => {
    if (CSS.supports('selector(:user-invalid)')) return;

    root.addEventListener('blur', handleEvent, true); // Capture phase
    root.addEventListener('input', handleEvent);
    root.addEventListener('change', handleEvent);
    root.addEventListener('reset', handleEvent, true); // Capture resets
  };

  return { init };
})();

// Sync aria-invalid with the CSS :user-invalid state for native support
const syncAria = (el) => {
  if (el.setAttribute && el.matches && el.matches('input[required]')) {
    el.setAttribute('aria-invalid', el.matches(':user-invalid') ? 'true' : 'false');
  }
};

/**
 * @function initNewsletterValidation
 * @description Initializes newsletter form validation and fallback support for `:user-invalid`.
 * 
 * @returns {void}
 */
export function initNewsletterValidation() {
  if (CSS.supports('selector(:user-invalid)')) {
    document.addEventListener('blur', (e) => syncAria(e.target), true);
    document.addEventListener('input', (e) => {
      if (e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) syncAria(e.target);
    });
  }

  // Initialize Newsletter validation and fallback
  const newsletterForm = document.getElementById("newsletter-form");
  if (newsletterForm) {
    UserInvalidFallback.init(newsletterForm);

    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletter-email");
      if (emailInput && emailInput.checkValidity()) {
        newsletterForm.innerHTML = `<h3 style="color: var(--accent-gold); text-align: center;">🎉 Thank you for subscribing!</h3><p style="color: var(--text-secondary); text-align: center;">Welcome to our cozy reading community.</p>`;
      } else if (emailInput) {
        if (!CSS.supports('selector(:user-invalid)')) {
          emailInput.classList.add('user-invalid-fallback');
        }
        emailInput.setAttribute('aria-invalid', 'true');
      }
    });
  }
}
