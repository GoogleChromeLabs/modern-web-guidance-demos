# Folia — Architectural Botanicals Storefront

**Folia** is an editorial plant storefront built with vanilla HTML, CSS, and JavaScript on Vite.

---

## App Overview

The storefront ships with three pages and a shared client-side shopping bag:

- **Home (`index.html`, `js/main.js`)**: Full-bleed hero showcase, editorial feature section (`#dark-foliage`), featured 12-specimen shop grid (`#shop`) synced with URL query parameters (`?category=...&q=...`), and brand story section (`#about`).
- **Lookbook (`lookbook.html`, `js/main.js`)**: Filterable and searchable 200-specimen catalogue synced with URL query parameters (`?category=...&q=...`).
- **Product Detail Page (`product.html`, `js/product.js`)**: Multi-image scroll gallery with live slide counter, pot finish and pot size selectors, specimen care details, and an add-to-bag flow with idempotent retry support. Reachable at `/product.html?id=<slug>` on static hosts and `/products/<slug>` in the Vite dev/preview server.
- **Slide-Over Bag Drawer (`js/bag.js`)**: Shared cart state validated and persisted to `localStorage` (`folia-bag`) with cross-tab synchronization, quantity steppers (`1–9`), integer-pence subtotal calculation, and free-delivery threshold messaging (`£75`).
- **Dev Cart API Mock (`js/cartApi.js`, `js/mocks/cartMock.js`)**: Development-only Mock Service Worker (`msw`) endpoints (`GET /api/cart`, `POST /api/cart/lines`, `PATCH /api/cart/lines/:productId/:variantId`, `DELETE /api/cart/lines/:productId/:variantId`).
- **Editorial Footer (`js/footer.js`)**: Newsletter subscription form with client-side email validation and status feedback.

### Directory Layout

```text
folia/
├── index.html          # Storefront home, editorial section, and featured shop grid
├── lookbook.html       # Full 200-specimen lookbook catalogue
├── product.html        # Product detail page shell
├── css/
│   ├── tokens.css      # Color, typography, spacing, and motion tokens
│   ├── base.css        # Base reset, layout shell, and stylesheet imports
│   ├── nav.css         # Fixed editorial header and mobile navigation overlay
│   ├── hero.css        # Full-bleed hero showcase
│   ├── editorial.css   # Art-directed "Dark Foliage" editorial section
│   ├── lookbook.css    # Filterable plant grid, sticky filter bar, and search
│   ├── story.css       # Brand story (#about) section
│   ├── product.css     # Product detail gallery, variant selectors, and care notes
│   ├── bag.css         # Slide-over shopping bag drawer
│   └── footer.css      # Site-wide editorial footer and newsletter form
├── js/
│   ├── main.js         # Home & lookbook entry, editorial reveal, filters, search
│   ├── product.js      # Product detail view, variant selection, add-to-bag states
│   ├── nav.js          # Shared mobile navigation menu and section scroll helpers
│   ├── products.js     # 200-specimen catalogue data and variant helpers
│   ├── bag.js          # Shared localStorage bag store and slide-over drawer
│   ├── cartApi.js      # Fetch client with timeout and abort handling
│   ├── footer.js       # Newsletter form and footer interactions
│   └── mocks/
│       └── cartMock.js # Dev-only MSW cart handlers
├── public/
│   ├── images/         # Static media served from /images at runtime
│   └── mockServiceWorker.js # Dev-only MSW service worker script
└── vite.config.js      # Multi-page build config and /products/<slug> route rewrite
```

---

## Local Setup & Commands

### Prerequisites

- **Node.js 20.19+** (or **22.12+**)

### Quick Start

```bash
npm install
npm run dev
```

| Command | Description |
| :--- | :--- |
| `npm run dev` / `npm start` | Start the local Vite dev server with MSW `/api/cart` mocking enabled |
| `npm run build` | Bundle `index.html`, `lookbook.html`, and `product.html` into static files under `dist/` |
| `npm run preview` | Serve the production `dist/` build locally to verify static behavior |
