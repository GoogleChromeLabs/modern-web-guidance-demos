/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { getBasket, clearBasket, updateBasketBadge } from './basket.js';

function renderBasketPage() {
  const container = document.getElementById('basket-items-container');
  const summary = document.getElementById('basket-summary');
  const subtotalElem = document.getElementById('basket-subtotal');
  const totalElem = document.getElementById('basket-total');

  if (!container || !summary) return;

  const items = getBasket();

  if (items.length === 0) {
    container.innerHTML = `<p class="basket-empty-msg">Your basket is currently empty. Visit the <a href="index.html#catalog" style="color: var(--primary); font-weight: bold;">catalog</a> to find your next adventure!</p>`;
    summary.classList.add('hidden');
    return;
  }

  summary.classList.remove('hidden');
  container.innerHTML = '';

  let total = 0;

  items.forEach((item) => {
    const priceNum = parseFloat((item.price || '$0').replace('$', ''));
    if (!isNaN(priceNum)) total += priceNum;

    const itemDiv = document.createElement('div');
    itemDiv.className = 'basket-item-card';
    itemDiv.innerHTML = `
      <img src="${item.coverImage}" alt="${item.title}" class="basket-item-img">
      <div class="basket-item-info">
        <h3 class="basket-item-title">${item.title}</h3>
        <p class="basket-item-author">${item.author}</p>
      </div>
      <div class="basket-item-price">${item.price}</div>
    `;
    container.appendChild(itemDiv);
  });

  const formattedTotal = `$${total.toFixed(2)}`;
  if (subtotalElem) subtotalElem.textContent = formattedTotal;
  if (totalElem) totalElem.textContent = formattedTotal;
}

document.addEventListener('DOMContentLoaded', () => {
  renderBasketPage();

  const clearBtn = document.getElementById('clear-basket-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      clearBasket();
      renderBasketPage();
      updateBasketBadge();
    });
  }

  const checkoutBtn = document.getElementById('checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      alert('Thank you for browsing The Cozy Nook! This is a Modern Web Guidance demonstration.');
      clearBasket();
      renderBasketPage();
      updateBasketBadge();
    });
  }
});
