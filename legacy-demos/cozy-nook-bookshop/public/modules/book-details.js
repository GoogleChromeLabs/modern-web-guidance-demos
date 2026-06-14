/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import books from "../books.json" with { type: "json" };
import { addToBasket } from "./basket.js";

/**
 * @function showBookDetails
 * @description Displays the details of a specific book and smoothly scrolls the details section into view.
 * If the book ID is invalid or not found in the database, the function returns early.
 *
 * @param {string} bookId - The unique identifier of the book (typically from `data-book` dataset).
 * @returns {void}
 */
export function showBookDetails(bookId) {
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
  const addToBasketBtn = document.getElementById("details-add-to-basket");

  const updateContent = () => {
    // Update content
    if (detailsGenre) detailsGenre.textContent = book.genre;
    if (detailsTitle) detailsTitle.textContent = book.title;
    if (detailsAuthor) detailsAuthor.textContent = book.author;
    if (detailsDescription) detailsDescription.textContent = book.description;

    // Update cover image
    if (detailsCoverDisplay) {
      detailsCoverDisplay.src = book.coverImage;
      detailsCoverDisplay.alt = `${book.title} cover`;
    }

    // Attach basket button listener
    if (addToBasketBtn) {
      addToBasketBtn.onclick = () => {
        addToBasket(book);
      };
    }

    // Reveal the details
    if (detailsPlaceholder) detailsPlaceholder.classList.add("hidden");
    if (bookDetails) {
      bookDetails.classList.remove("hidden");
      bookDetails.style.opacity = "1";
    }
  };

  // TODO(MWG 💖): Modernize the page transitions when updating book details.
  updateContent();

  // Smoothly scroll to details
  if (detailsSection) {
    detailsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  const bookId = urlParams.get("id");
  if (bookId) {
    showBookDetails(bookId);
  }
});
