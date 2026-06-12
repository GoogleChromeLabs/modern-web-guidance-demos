/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

export function initFiltering() {
  const grid = document.querySelector('.all-books-grid');
  const signs = document.querySelectorAll('.sign-container');
  const sortBtn = document.querySelector('.filter-btn');

  if (!grid) return;

  let activeGenre = null;
  let isSorted = false;

  // Map sign text to data-genre values
  const genreMap = {
    'The Mystery Corner': 'Mystery',
    'Poetry Garden': 'Poetry Garden',
    'Classic Tales': 'Classic Tales',
    'Slow Living': 'Slow Living'
  };

  // Quarters Genre Filtering
  signs.forEach(sign => {
    sign.addEventListener('click', () => {
      const labelElem = sign.querySelector('.sign-label');
      if (!labelElem) return;

      const labelText = labelElem.textContent.trim();
      const targetGenre = genreMap[labelText] || labelText;

      // Toggle active state
      if (activeGenre === targetGenre) {
        activeGenre = null;
        signs.forEach(s => s.querySelector('.sign-card')?.classList.remove('active-filter'));
      } else {
        activeGenre = targetGenre;
        signs.forEach(s => s.querySelector('.sign-card')?.classList.remove('active-filter'));
        sign.querySelector('.sign-card')?.classList.add('active-filter');
      }

      // Filter grid cards
      const cards = grid.querySelectorAll('.book-grid-card');
      cards.forEach(card => {
        const cardGenre = card.getAttribute('data-genre');
        if (!activeGenre || cardGenre === activeGenre) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });

      // Smooth scroll to catalog view
      const catalogSection = document.getElementById('catalog');
      if (catalogSection) {
        catalogSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Date Sorting
  if (sortBtn) {
    sortBtn.textContent = 'Sort: Oldest First';
    sortBtn.addEventListener('click', () => {
      isSorted = !isSorted;
      
      const cards = Array.from(grid.querySelectorAll('.book-grid-card'));
      
      cards.sort((a, b) => {
        const dateA = a.getAttribute('data-date') || '2026-01-01';
        const dateB = b.getAttribute('data-date') || '2026-01-01';
        // isSorted === true means sort Oldest First (ascending)
        return isSorted ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      });

      grid.innerHTML = '';
      cards.forEach(card => grid.appendChild(card));

      if (isSorted) {
        sortBtn.textContent = 'Sorted: Oldest First';
        sortBtn.style.backgroundColor = 'var(--primary-container)';
        sortBtn.style.color = 'var(--on-primary-container)';
      } else {
        sortBtn.textContent = 'Sort: Oldest First';
        sortBtn.style.backgroundColor = 'var(--surface)';
        sortBtn.style.color = 'var(--on-surface)';
      }
    });
  }
}
