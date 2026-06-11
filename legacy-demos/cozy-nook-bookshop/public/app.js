/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import books from "./books.json" with { type: "json" };

/**
 * @function showBookDetails
 * @description Displays the details of a specific book and smoothly scrolls the details section into view.
 * If the book ID is invalid or not found in the database, the function returns early.
 *
 * @param {string} bookId - The unique identifier of the book (typically from `data-book` dataset).
 * @returns {void}
 */
function showBookDetails(bookId) {
  const book = books?.[bookId];
  if (!book) return;

  const detailsGenre = document.getElementById("details-genre");
  const detailsTitle = document.getElementById("details-title");
  const detailsAuthor = document.getElementById("details-author");
  const detailsDescription = document.getElementById("details-description");
  const detailsCoverDisplay = document.getElementById("details-cover-display");
  const detailsPlaceholder = document.getElementById("details-placeholder");
  const detailsSection = document.getElementById("details-section");
  const bookDetails = document.getElementById("book-details");

  const updateContent = () => {
    // Update content
    detailsGenre.textContent = book.genre;
    detailsTitle.textContent = book.title;
    detailsAuthor.textContent = book.author;
    detailsDescription.textContent = book.description;

    // Update cover image
    detailsCoverDisplay.src = book.coverImage;
    detailsCoverDisplay.alt = `${book.title} cover`;

    // Reveal the details
    detailsPlaceholder.classList.add("hidden");
    bookDetails.classList.remove("hidden");
    bookDetails.style.opacity = "1";
  };

  // TODO(MWG 💖): Modernize the page transitions when updating book details.
  updateContent();

  // Smoothly scroll to details
  detailsSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * @function main
 * @description Initializes the application's interactive features, including book selection event handlers,
 * keyboard accessibility support, navigation menu toggling, and scroll-driven scaling animations
 * using an IntersectionObserver.
 * 
 * @returns {void}
 */
function main() {
  const scroller = document.getElementById("book-scroller");
  const bookItems = document.querySelectorAll(".book-item");

  bookItems.forEach((item) => {
    // Click event
    item.addEventListener("click", () => {
      const bookId = item.dataset.book;
      showBookDetails(bookId);
    });

    // Accessibility: Enter key
    item.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const bookId = item.dataset.book;
        showBookDetails(bookId);
      }
    });
  });

  // Legacy navigation toggling
  const menuToggle = document.getElementById("menu-toggle");
  const menuClose = document.getElementById("menu-close");
  const navMenu = document.getElementById("nav-menu");

  if (menuToggle && menuClose && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.add("show");
    });
    menuClose.addEventListener("click", () => {
      navMenu.classList.remove("show");
    });
  }

  // TODO(MWG 💖): Improve the smoothness of the book carousel scroll and zoom animations.
  console.log("Applying JS IntersectionObserver scroll scaling effect.");

  const options = {
    root: scroller,
    rootMargin: "0px",
    threshold: [0, 0.5, 1],
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const ratio = entry.intersectionRatio;
      // Scale between 0.75 and 1.05 based on visibility
      const scale = 0.75 + 0.3 * ratio;
      const opacity = 0.4 + 0.6 * ratio;

      entry.target.style.transform = `scale(${scale})`;
      entry.target.style.opacity = opacity;
    });
  }, options);

  bookItems.forEach((item) => observer.observe(item));

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

if (CSS.supports('selector(:user-invalid)')) {
  document.addEventListener('blur', (e) => syncAria(e.target), true);
  document.addEventListener('input', (e) => {
    if (e.target.hasAttribute && e.target.hasAttribute('aria-invalid')) syncAria(e.target);
  });
}

document.addEventListener("DOMContentLoaded", () => main());
