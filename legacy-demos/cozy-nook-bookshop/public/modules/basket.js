/**
 * Copyright 2026 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

const BASKET_STORAGE_KEY = 'cozy_nook_basket';

export function getBasket() {
  try {
    const data = localStorage.getItem(BASKET_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to read basket from localStorage', e);
    return [];
  }
}

export function saveBasket(basket) {
  try {
    localStorage.setItem(BASKET_STORAGE_KEY, JSON.stringify(basket));
    updateBasketBadge();
  } catch (e) {
    console.error('Failed to save basket to localStorage', e);
  }
}

export function addToBasket(item) {
  const basket = getBasket();
  basket.push(item);
  saveBasket(basket);

  // Trigger brief bounce animation on basket icon
  const basketContainer = document.querySelector('.basket-container');
  if (basketContainer) {
    basketContainer.classList.add('basket-pulse');
    setTimeout(() => basketContainer.classList.remove('basket-pulse'), 300);
  }
}

export function clearBasket() {
  saveBasket([]);
}

export function updateBasketBadge() {
  const basket = getBasket();
  const badges = document.querySelectorAll('.basket-badge');
  const containers = document.querySelectorAll('.basket-container');

  badges.forEach(badge => {
    badge.textContent = basket.length;
  });

  containers.forEach(container => {
    container.setAttribute('aria-label', `Shopping basket with ${basket.length} items`);
  });
}

export function initBasket() {
  updateBasketBadge();

  // Attach basket icon navigation click
  const basketContainers = document.querySelectorAll('.basket-container');
  basketContainers.forEach(container => {
    container.addEventListener('click', () => {
      window.location.href = 'basket.html';
    });
  });

  // Attach static staff picks basket add buttons
  const bigPickBtn = document.querySelector('.basket-add-btn');
  if (bigPickBtn) {
    bigPickBtn.addEventListener('click', () => {
      addToBasket({
        title: 'The Hidden Songbird',
        author: 'Elena Thorne',
        price: '$24.00',
        coverImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCOBAC9ishYX-NWrzcWZegKXWoCURYfAjJ3U0_GRYdit3VHM38-RJCFmjJGKe07UkClot-0WplaVVj91p8U34EKNUu69ezO1VL-nXfbZyc4w5p6PvFc27Nk2Od0NFldJUFP9v-AG-XUD_F-3LZ6QOLvXx5I2jYecixu797dIqeiYZqIpZEcxgJEi30HfFOzjp6OOFl4LHNteR_1mCb9LL7f78_iDreIBaeevipmL_zR7XGKoiy3eq_I'
      });
    });
  }
}
