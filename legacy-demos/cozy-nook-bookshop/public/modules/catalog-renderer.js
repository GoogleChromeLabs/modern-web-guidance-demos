/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export async function initCatalogRenderer(onBasketAdd) {
  const grid = document.querySelector('.all-books-grid');
  if (!grid) return;

  try {
    const response = await fetch('./books.json');
    const booksData = await response.json();
    
    // Clear initial placeholder static content
    grid.innerHTML = '';

    // Render books
    Object.entries(booksData).forEach(([id, book]) => {
      const card = document.createElement('a');
      card.className = 'book-grid-card';
      card.href = `details.html?id=${id}`;
      card.setAttribute('data-genre', book.genre || 'Classic Tales');
      card.setAttribute('data-format', book.format || 'paperback');
      card.setAttribute('data-date', book.date || '2026-01-01');
      card.setAttribute('data-id', id);

      card.innerHTML = `
        <div class="book-grid-visual">
          <img src="${book.coverImage}" alt="${book.title}" class="book-grid-img" loading="lazy">
          <div class="floating-basket-container">
            <button class="floating-basket-btn" aria-label="Add ${book.title} to basket" data-book-id="${id}">
              <span class="material-symbols-outlined">shopping_basket</span>
            </button>
          </div>
        </div>
        <h4 class="book-grid-title">${book.title}</h4>
        <p class="book-grid-author">${book.author}</p>
        <span class="book-grid-price">${book.price}</span>
      `;

      // Attach basket click listener
      const basketBtn = card.querySelector('.floating-basket-btn');
      if (basketBtn && typeof onBasketAdd === 'function') {
        basketBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          onBasketAdd(book);
        });
      }

      grid.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load books catalog:', error);
  }
}
