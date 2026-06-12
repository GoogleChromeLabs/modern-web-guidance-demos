/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { showBookDetails } from "./book-details.js";

/**
 * @function initCarousel
 * @description Initializes book selection event handlers, keyboard accessibility support,
 * and scroll-driven scaling animations using an IntersectionObserver.
 * 
 * @returns {void}
 */
export function initCarousel() {
  const scroller = document.getElementById("book-scroller");
  const bookItems = document.querySelectorAll(".book-item");

  if (!scroller || bookItems.length === 0) return;

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
}
