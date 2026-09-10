/**
 * DashBite - Application Controller & User Flow
 * Includes full food ordering journey with intentional non-Baseline JavaScript calls.
 */

import { CATEGORIES, RESTAURANTS } from './restaurants.js';

const state = {
  activeView: 'feed', // 'feed' | 'restaurant'
  activeRestaurantId: null,
  activeCategory: 'all',
  activeFilters: {
    dashPassOnly: false,
    under30Mins: false,
    freeDelivery: false,
    topRated: false
  },
  searchQuery: '',
  cart: [],
  selectedTipPercent: 15,
  customizingItem: null,
  selectedModifiers: {}
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderCategoryCarousel();
  renderRestaurantGrid();
  bindGlobalEvents();
  bindCustomizationEvents();
  bindCartEvents();
}

/**
 * Render Category Carousel
 */
function renderCategoryCarousel() {
  const container = document.getElementById('categoryCarouselList');
  if (!container) return;

  container.innerHTML = CATEGORIES.map(cat => `
    <button class="category-pill-item ${state.activeCategory === cat.id ? 'active' : ''}" data-category="${cat.id}">
      <div class="category-icon-wrap">${cat.icon}</div>
      <span class="category-label">${cat.name}</span>
    </button>
  `).join('');

  container.querySelectorAll('.category-pill-item').forEach(btn => {
    btn.addEventListener('click', () => {
      state.activeCategory = btn.dataset.category;
      renderCategoryCarousel();
      renderRestaurantGrid();
    });
  });
}

/**
 * Filter & Render Restaurant Feed
 */
function renderRestaurantGrid() {
  const grid = document.getElementById('restaurantGrid');
  const countEl = document.getElementById('resultsCountText');
  if (!grid) return;

  let filtered = RESTAURANTS.filter(res => {
    if (state.activeCategory !== 'all' && res.categoryId !== state.activeCategory) return false;
    if (state.activeFilters.dashPassOnly && !res.isDashPass) return false;
    if (state.activeFilters.under30Mins && res.deliveryTimeMax > 30) return false;
    if (state.activeFilters.freeDelivery && res.deliveryFee > 0) return false;
    if (state.activeFilters.topRated && res.rating < 4.8) return false;
    if (state.searchQuery.trim()) {
      const q = state.searchQuery.toLowerCase();
      const matchName = res.name.toLowerCase().includes(q);
      const matchCuisine = res.cuisine.toLowerCase().includes(q);
      const matchMenu = res.menu.some(item => item.name.toLowerCase().includes(q));
      if (!matchName && !matchCuisine && !matchMenu) return false;
    }
    return true;
  });

  if (countEl) {
    countEl.textContent = `${filtered.length} stores near you`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px;">
        <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 8px;">No restaurants match your filters</h3>
        <p style="color: var(--dash-gray);">Try clearing some filter pills or searching for another cuisine.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(res => `
    <article class="restaurant-card" data-restaurant-id="${res.id}">
      <div class="card-media-wrapper">
        <img src="${res.image}" alt="${res.name}" class="card-restaurant-img" onerror="this.onerror=null;this.src='assets/images/burger.jpg';">
        ${res.offerText ? `<span class="card-offer-badge">${res.offerText}</span>` : ''}
        <button class="card-favorite-btn" onclick="event.stopPropagation(); alert('Saved ${res.name} to favorites!')">❤️</button>
      </div>
      <div class="card-content">
        <div class="card-title-row">
          <h3 class="restaurant-name">${res.name}</h3>
          <span class="rating-chip">★ ${res.rating}</span>
        </div>
        <div class="card-meta-row">
          <span>${res.cuisine}</span>
          <span class="dot-separator">•</span>
          <span>${res.priceTier}</span>
          <span class="dot-separator">•</span>
          <span>${res.distanceMiles} mi</span>
        </div>
        <div class="card-delivery-row">
          <span class="delivery-time-badge">${res.deliveryTimeMin}–${res.deliveryTimeMax} min</span>
          <div class="delivery-fee-wrap">
            <span class="delivery-fee-badge ${res.deliveryFee > 0 ? 'paid' : ''}">
              ${res.deliveryFee === 0 ? '$0 Delivery' : `$${res.deliveryFee.toFixed(2)} Fee`}
              <span class="fee-info-icon">ℹ️</span>
            </span>
            <!-- Non-Baseline CSS Anchor Positioning Tooltip Element -->
            <div class="fee-tooltip-anchor">
              <strong>${res.name} Delivery Policy</strong><br>
              Standard DashBite courier dispatch fee. Free with DashPass.
            </div>
          </div>
        </div>
        ${res.isDashPass ? `
          <div class="promo-chip-row">
            <span class="promo-chip">DashPass</span>
            <span class="promo-chip">${res.promoTag}</span>
          </div>
        ` : ''}
      </div>
    </article>
  `).join('');

  // Attach card click handlers for navigation
  grid.querySelectorAll('.restaurant-card').forEach(card => {
    card.addEventListener('click', () => {
      const resId = card.dataset.restaurantId;
      navigateToRestaurant(resId);
    });
  });
}

/**
 * NON-BASELINE FEATURE 2: JavaScript View Transitions API without Feature Check
 * Intentionally calls document.startViewTransition() directly
 * (Throws uncaught TypeError on Safari <18 and older webviews)
 */
function navigateToRestaurant(restaurantId) {
  state.activeRestaurantId = restaurantId;
  
  // Bleeding-edge call without `if (document.startViewTransition)` check
  document.startViewTransition(() => {
    state.activeView = 'restaurant';
    renderActiveView();
  });
}

function navigateToFeed() {
  document.startViewTransition(() => {
    state.activeView = 'feed';
    renderActiveView();
  });
}

/**
 * Switch Active View (Feed vs Restaurant Detail)
 */
function renderActiveView() {
  const feedSection = document.getElementById('feedViewContainer');
  const restaurantSection = document.getElementById('restaurantViewContainer');

  if (state.activeView === 'feed') {
    if (feedSection) feedSection.style.display = 'block';
    if (restaurantSection) restaurantSection.classList.remove('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    if (feedSection) feedSection.style.display = 'none';
    if (restaurantSection) {
      restaurantSection.classList.add('active');
      renderRestaurantDetail(state.activeRestaurantId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

/**
 * Render Restaurant Detail View with Full Categorized Menu
 */
function renderRestaurantDetail(restaurantId) {
  const res = RESTAURANTS.find(r => r.id === restaurantId);
  const container = document.getElementById('restaurantDetailContent');
  if (!res || !container) return;

  container.innerHTML = `
    <button class="back-to-feed-btn" id="backToFeedBtn">← Back to All Stores</button>
    <div class="restaurant-header-banner">
      <img src="${res.heroImage}" alt="${res.name}" class="res-banner-img" onerror="this.onerror=null;this.src='assets/images/hero-banner.jpg';">
      <div class="res-header-overlay">
        <h1 class="res-hero-title">${res.name}</h1>
        <div class="res-hero-meta">
          <span>★ ${res.rating} (${res.reviewCount} ratings)</span>
          <span class="dot-separator">•</span>
          <span>${res.cuisine}</span>
          <span class="dot-separator">•</span>
          <span>${res.deliveryTimeMin}–${res.deliveryTimeMax} min</span>
          <span class="dot-separator">•</span>
          <span>${res.deliveryFee === 0 ? '$0 Delivery' : `$${res.deliveryFee.toFixed(2)} Delivery Fee`}</span>
        </div>
      </div>
    </div>

    <div class="menu-section">
      <h2 class="menu-section-heading">Featured Menu Items</h2>
      <div class="menu-items-grid">
        ${res.menu.map(item => `
          <div class="menu-item-card" data-item-id="${item.id}">
            <div class="item-info-col">
              <div>
                <h4 class="item-title">${item.name}</h4>
                <p class="item-desc">${item.description}</p>
              </div>
              <span class="item-price">$${item.basePrice.toFixed(2)}</span>
            </div>
            <div class="item-visual-wrap">
              <img src="${item.image}" alt="${item.name}" class="item-img" onerror="this.onerror=null;this.src='assets/images/burger.jpg';">
              <div class="item-add-btn-icon">+</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  // Attach back button
  document.getElementById('backToFeedBtn')?.addEventListener('click', () => {
    navigateToFeed();
  });

  // Attach item click handlers
  container.querySelectorAll('.menu-item-card').forEach(card => {
    card.addEventListener('click', () => {
      const itemId = card.dataset.itemId;
      const item = res.menu.find(m => m.id === itemId);
      if (item) openDishCustomization(item, res);
    });
  });
}

/**
 * Open Dish Customization Popover / Modal
 */
function openDishCustomization(item, restaurant) {
  state.customizingItem = { ...item, restaurantId: restaurant.id, restaurantName: restaurant.name };
  state.selectedModifiers = {};

  // Pre-select required defaults
  if (item.options) {
    item.options.forEach(opt => {
      if (opt.type === 'radio' && opt.choices.length > 0) {
        state.selectedModifiers[opt.name] = opt.choices[0];
      } else if (opt.type === 'checkbox') {
        state.selectedModifiers[opt.name] = [];
      }
    });
  }

  const popover = document.getElementById('dishCustomizationPopover');
  if (!popover) return;

  renderCustomizationContent(popover);

  // Use modern Popover API
  if (popover.showPopover) {
    popover.showPopover();
  } else {
    // Fallback for older browsers
    popover.classList.add('popover-open');
    popover.style.display = 'block';
  }
}

function renderCustomizationContent(popover) {
  const item = state.customizingItem;
  if (!item) return;

  const currentPrice = calculateCustomizedItemPrice();

  popover.innerHTML = `
    <div class="popover-header-media">
      <img src="${item.image}" alt="${item.name}" class="popover-header-img" onerror="this.onerror=null;this.src='assets/images/burger.jpg';">
      <button class="popover-close-btn" id="closePopoverBtn">&times;</button>
    </div>
    <div class="popover-body">
      <h3 class="popover-title">${item.name}</h3>
      <div class="popover-price" id="popoverLivePrice">$${currentPrice.toFixed(2)}</div>
      <p class="popover-desc">${item.description}</p>

      ${(item.options || []).map(group => `
        <div class="modifier-group" data-group-name="${group.name}">
          <div class="modifier-group-header">
            <span class="modifier-group-name">${group.name}</span>
            <span class="modifier-badge ${group.required ? 'required' : ''}">
              ${group.required ? 'Required' : 'Optional'}
            </span>
          </div>
          <div class="modifier-options-list">
            ${group.choices.map((choice, idx) => `
              <label class="modifier-option-row">
                <span>
                  <input type="${group.type}" name="mod_${group.name}" value="${choice.name}" data-price="${choice.priceDelta}"
                    ${group.type === 'radio' && state.selectedModifiers[group.name]?.name === choice.name ? 'checked' : ''}
                    ${group.type === 'checkbox' && (state.selectedModifiers[group.name] || []).some(c => c.name === choice.name) ? 'checked' : ''}
                  >
                  ${choice.name}
                </span>
                <span>${choice.priceDelta > 0 ? `+$${choice.priceDelta.toFixed(2)}` : 'Free'}</span>
              </label>
            `).join('')}
          </div>
        </div>
      `).join('')}
    </div>

    <div class="popover-footer-sticky">
      <div class="qty-counter-ctrl">
        <button class="qty-btn" id="qtyMinusBtn">−</button>
        <span class="qty-number" id="qtyDisplay">1</span>
        <button class="qty-btn" id="qtyPlusBtn">+</button>
      </div>
      <button class="btn-primary-action" id="addToCartBtn" style="flex: 1;">
        Add to Cart • <span id="btnTotalPrice">$${currentPrice.toFixed(2)}</span>
      </button>
    </div>
  `;

  // Attach event handlers inside popover
  document.getElementById('closePopoverBtn')?.addEventListener('click', () => {
    closeDishCustomization();
  });

  let quantity = 1;
  const qtyDisplay = document.getElementById('qtyDisplay');
  const btnTotal = document.getElementById('btnTotalPrice');
  const livePrice = document.getElementById('popoverLivePrice');

  document.getElementById('qtyPlusBtn')?.addEventListener('click', () => {
    quantity++;
    if (qtyDisplay) qtyDisplay.textContent = quantity;
    updatePrice();
  });

  document.getElementById('qtyMinusBtn')?.addEventListener('click', () => {
    if (quantity > 1) {
      quantity--;
      if (qtyDisplay) qtyDisplay.textContent = quantity;
      updatePrice();
    }
  });

  popover.querySelectorAll('input').forEach(input => {
    input.addEventListener('change', (e) => {
      const groupName = e.target.closest('.modifier-group').dataset.groupName;
      const group = item.options.find(g => g.name === groupName);
      if (!group) return;

      if (group.type === 'radio') {
        state.selectedModifiers[groupName] = group.choices.find(c => c.name === e.target.value);
      } else if (group.type === 'checkbox') {
        state.selectedModifiers[groupName] = state.selectedModifiers[groupName] || [];
        if (e.target.checked) {
          const choice = group.choices.find(c => c.name === e.target.value);
          if (choice) state.selectedModifiers[groupName].push(choice);
        } else {
          state.selectedModifiers[groupName] = state.selectedModifiers[groupName].filter(c => c.name !== e.target.value);
        }
      }
      updatePrice();
    });
  });

  function updatePrice() {
    const singlePrice = calculateCustomizedItemPrice();
    const total = singlePrice * quantity;
    if (livePrice) livePrice.textContent = `$${singlePrice.toFixed(2)}`;
    if (btnTotal) btnTotal.textContent = `$${total.toFixed(2)}`;
  }

  document.getElementById('addToCartBtn')?.addEventListener('click', () => {
    addItemToCart(item, quantity, state.selectedModifiers);
    closeDishCustomization();
    openCartDrawer();
  });
}

function calculateCustomizedItemPrice() {
  const item = state.customizingItem;
  if (!item) return 0;
  let price = item.basePrice;

  Object.values(state.selectedModifiers).forEach(mod => {
    if (Array.isArray(mod)) {
      mod.forEach(m => { price += (m.priceDelta || 0); });
    } else if (mod && mod.priceDelta) {
      price += mod.priceDelta;
    }
  });

  return price;
}

function closeDishCustomization() {
  const popover = document.getElementById('dishCustomizationPopover');
  if (!popover) return;
  if (popover.hidePopover) {
    popover.hidePopover();
  } else {
    popover.classList.remove('popover-open');
    popover.style.display = 'none';
  }
}

/**
 * Cart Operations
 */
function addItemToCart(item, quantity, modifiers) {
  const unitPrice = calculateCustomizedItemPrice();
  const summaryMods = [];

  Object.entries(modifiers).forEach(([group, val]) => {
    if (Array.isArray(val)) {
      val.forEach(v => summaryMods.push(v.name));
    } else if (val && val.name) {
      summaryMods.push(val.name);
    }
  });

  state.cart.push({
    cartItemId: 'cart_' + Date.now() + Math.random().toString(36).substring(2, 6),
    id: item.id,
    name: item.name,
    restaurantName: item.restaurantName,
    quantity: quantity,
    unitPrice: unitPrice,
    modifiersText: summaryMods.join(', ')
  });

  updateCartBadge();
  renderCartDrawer();
}

function updateCartBadge() {
  const count = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  const bubble = document.getElementById('headerCartCount');
  if (bubble) bubble.textContent = count;
}

function renderCartDrawer() {
  const container = document.getElementById('cartItemsList');
  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 48px 0; color: var(--dash-gray);">
        <div style="font-size: 48px; margin-bottom: 12px;">🛍️</div>
        <h4 style="font-size: 16px; font-weight: 800; color: var(--dash-dark); margin-bottom: 4px;">Your cart is empty</h4>
        <p style="font-size: 13px;">Add delicious dishes from your favorite local spots.</p>
      </div>
    `;
    updateSummaryTotals(0, 0, 0, 0);
    return;
  }

  container.innerHTML = state.cart.map(item => `
    <div class="cart-item-card" data-cart-id="${item.cartItemId}">
      <div class="cart-item-details">
        <h4 class="cart-item-name">${item.name}</h4>
        <div class="cart-item-modifiers">${item.modifiersText || 'Standard selection'}</div>
        <div class="cart-item-price-row">
          <span style="font-weight: 800; font-size: 14px;">$${(item.unitPrice * item.quantity).toFixed(2)}</span>
          <div class="qty-counter-ctrl" style="padding: 2px 6px;">
            <button class="qty-btn" onclick="window.updateCartItemQty('${item.cartItemId}', -1)">−</button>
            <span class="qty-number" style="font-size: 13px;">${item.quantity}</span>
            <button class="qty-btn" onclick="window.updateCartItemQty('${item.cartItemId}', 1)">+</button>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const subtotal = state.cart.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
  const deliveryFee = subtotal > 20 ? 0.00 : 1.99;
  const tip = subtotal * (state.selectedTipPercent / 100);
  const taxes = subtotal * 0.0925;
  const total = subtotal + deliveryFee + tip + taxes;

  updateSummaryTotals(subtotal, deliveryFee, tip, total);
}

window.updateCartItemQty = function(cartItemId, delta) {
  const item = state.cart.find(i => i.cartItemId === cartItemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(i => i.cartItemId !== cartItemId);
  }
  updateCartBadge();
  renderCartDrawer();
};

function updateSummaryTotals(subtotal, deliveryFee, tip, total) {
  const subEl = document.getElementById('summarySubtotal');
  const feeEl = document.getElementById('summaryDeliveryFee');
  const tipEl = document.getElementById('summaryTip');
  const totEl = document.getElementById('summaryTotal');

  if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
  if (feeEl) feeEl.textContent = deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`;
  if (tipEl) tipEl.textContent = `$${tip.toFixed(2)}`;
  if (totEl) totEl.textContent = `$${total.toFixed(2)}`;
}

function openCartDrawer() {
  const drawer = document.getElementById('cartDrawerPane');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('open');
    backdrop.classList.add('open');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawerPane');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
  }
}

/**
 * Event Bindings
 */
function bindGlobalEvents() {
  // Brand Logo Click ➔ Return to feed
  document.getElementById('brandLogoLink')?.addEventListener('click', (e) => {
    e.preventDefault();
    navigateToFeed();
  });

  // Search input
  document.getElementById('globalSearchInput')?.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderRestaurantGrid();
  });

  // Filter chips
  document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const filterKey = chip.dataset.filter;
      if (filterKey) {
        state.activeFilters[filterKey] = !state.activeFilters[filterKey];
        chip.classList.toggle('active', state.activeFilters[filterKey]);
        renderRestaurantGrid();
      }
    });
  });

  // Mode buttons (Delivery vs Pickup)
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function bindCustomizationEvents() {
  // Click backdrop outside modal to close
  const popover = document.getElementById('dishCustomizationPopover');
  if (popover) {
    popover.addEventListener('click', (e) => {
      if (e.target === popover) closeDishCustomization();
    });
  }
}

function bindCartEvents() {
  document.getElementById('headerCartBtn')?.addEventListener('click', () => {
    openCartDrawer();
  });

  document.getElementById('closeCartBtn')?.addEventListener('click', () => {
    closeCartDrawer();
  });

  document.getElementById('cartDrawerBackdrop')?.addEventListener('click', () => {
    closeCartDrawer();
  });

  // Tip buttons
  document.querySelectorAll('.tip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedTipPercent = parseInt(btn.dataset.tip, 10) || 15;
      renderCartDrawer();
    });
  });

  // Checkout button
  document.getElementById('placeOrderBtn')?.addEventListener('click', () => {
    if (state.cart.length === 0) {
      alert('Your cart is empty! Please add some delicious items first.');
      return;
    }
    closeCartDrawer();
    showOrderConfirmation();
  });

  document.getElementById('closeTrackingModalBtn')?.addEventListener('click', () => {
    document.getElementById('orderTrackingModal')?.classList.remove('open');
    state.cart = [];
    updateCartBadge();
    renderCartDrawer();
    navigateToFeed();
  });
}

function showOrderConfirmation() {
  const modal = document.getElementById('orderTrackingModal');
  if (!modal) return;
  modal.classList.add('open');

  // Simulated live delivery tracker steps
  setTimeout(() => {
    document.getElementById('stepKitchen')?.classList.add('done');
  }, 2000);

  setTimeout(() => {
    document.getElementById('stepCourier')?.classList.add('done');
  }, 4500);
}
