# Folia — Architectural Botanicals Storefront

**Folia** is an editorial plant storefront built with vanilla HTML, CSS, and JavaScript on Vite. It serves as a realistic, self-contained playground for evaluating how AI coding agents build new features, refine UI interactions, and verification-test changes in a real browser with **[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance)** and **[Chrome DevTools for agents](https://developer.chrome.com/docs/devtools/agents)**.

---

## App Overview

The storefront ships with two entry points and a shared client-side shopping bag:

- **Home & Lookbook (`index.html`, `js/main.js`)**: Full-bleed hero showcase, editorial feature section (`#dark-foliage`), filterable and searchable 12-specimen catalogue (`#shop`) synced with URL query parameters (`?category=...&q=...`), and brand story section (`#about`).
- **Product Detail Page (`product.html`, `js/product.js`)**: Multi-image scroll gallery with live slide counter, pot finish and pot size selectors, specimen care details, and an add-to-bag flow with idempotent retry support. Reachable at `/product.html?id=<slug>` on static hosts and `/products/<slug>` in the Vite dev/preview server.
- **Slide-Over Bag Drawer (`js/bag.js`)**: Shared cart state validated and persisted to `localStorage` (`folia-bag`) with cross-tab synchronization, quantity steppers (`1–9`), integer-pence subtotal calculation, and free-delivery threshold messaging (`£75`).
- **Dev Cart API Mock (`js/cartApi.js`, `js/mocks/cartMock.js`)**: Development-only Mock Service Worker (`msw`) endpoints (`GET /api/cart`, `POST /api/cart/lines`, `PATCH /api/cart/lines/:productId/:variantId`, `DELETE /api/cart/lines/:productId/:variantId`) with configurable latency and failure simulation.
- **Editorial Footer (`js/footer.js`)**: Newsletter subscription form with client-side email validation and status feedback.

### Directory Layout

```text
legacy-demos/folia/
├── index.html          # Storefront home, editorial section, and lookbook grid
├── product.html        # Product detail page shell
├── css/
│   ├── tokens.css      # Color, typography, spacing, and motion tokens
│   └── base.css        # Layout, component, and responsive styles
├── js/
│   ├── main.js         # Home entry, mobile menu, lookbook filters, search
│   ├── product.js      # Product detail view, variant selection, add-to-bag states
│   ├── products.js     # 12-specimen catalogue data and variant helpers
│   ├── bag.js          # Shared localStorage bag store and slide-over drawer
│   ├── cartApi.js      # Fetch client with timeout and abort handling
│   ├── footer.js       # Newsletter form and footer interactions
│   └── mocks/
│       └── cartMock.js # Dev-only MSW cart handlers & latency/failure simulation
├── public/
│   ├── images/         # Static media served from images/ at runtime (omit /public in URLs)
│   └── mockServiceWorker.js
├── AGENTS.md           # Agent browser verification rules
└── vite.config.js      # Multi-page build config and /products/<slug> route rewrite
```

---

## Local Setup & Commands

### Prerequisites

- **Node.js 20.19+** (or **22.12+**)
- **Google Chrome** (for interactive browser inspection and [Chrome DevTools for agents](https://developer.chrome.com/docs/devtools/agents) verification)

### Quick Start

```bash
cd legacy-demos/folia
npm install
npm run dev
```

| Command | Description |
| :--- | :--- |
| `npm run dev` / `npm start` | Start the local Vite dev server with MSW `/api/cart` mocking enabled |
| `npm run build` | Bundle `index.html` and `product.html` into static files under `dist/` |
| `npm run preview` | Serve the production `dist/` build locally to verify static behavior |

### Simulating Network Latency & Failures (Dev Mode)

When running `npm run dev`, append query parameters to any storefront URL to test pending states, race conditions, and error recovery:

- `?latency=<ms>` — Override mock API response delay in milliseconds (e.g. `http://localhost:5173/products/ficus-lyrata?latency=2000`).
- `?fail=<0..1>` — Fail cart write requests with a probability between `0` and `1` (e.g. `http://localhost:5173/products/ficus-lyrata?fail=0.5` or `?fail=1`).

---

## Testing Modern Web Guidance (Control vs. Guided Workflow)

To evaluate how **[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance)** affects code quality, platform usage, and accessibility, run the **exact same prompt** in two isolated environments: a baseline **Control** run and a **Guided** run.

### 1. Set Up Chrome DevTools for agents (Both Runs)

Enable **[Chrome DevTools for agents](https://developer.chrome.com/docs/devtools/agents)** in your coding agent for **both** control and guided runs so the agent can open Folia in Chrome, inspect computed styles and DOM state, test keyboard/pointer flows, and verify changes against the rules in [`AGENTS.md`](./AGENTS.md).

Follow the [Chrome DevTools for agents setup instructions](https://developer.chrome.com/docs/devtools/agents) for your IDE or CLI before starting either run.

### 2. Run a Side-by-Side Comparison

1. **Create two isolated git worktrees** from the clean branch so neither session can see the other's changes:
   ```bash
   git worktree add ../folia-control -b folia-control
   git worktree add ../folia-guided -b folia-guided
   ```
2. **Control run (`../folia-control` — without Modern Web Guidance):**
   - Ensure `modern-web-guidance` is **not** installed globally or inside `../folia-control`.
   - Start a fresh agent session inside `../folia-control/legacy-demos/folia`, paste a prompt from below, and let the agent implement and verify it with Chrome DevTools for agents.
3. **Guided run (`../folia-guided` — with Modern Web Guidance):**
   - Install **[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance)** inside `../folia-guided`:
     ```bash
     cd ../folia-guided
     npx modern-web-guidance@latest install
     ```
   - Relaunch your agent CLI/IDE so the installed skills load into a fresh session, navigate to `legacy-demos/folia`, and paste the **exact same prompt**.
4. **Compare outcomes:**
   - Diff both branches against the base commit (`git diff setup_folia_storefront_demo..folia-control` vs. `git diff setup_folia_storefront_demo..folia-guided`) to compare custom JavaScript volume, CSS complexity, keyboard/screen-reader behavior, fallback strategy, and live interaction quality in Chrome.

---

## Example Prompts

Frame prompts around **what shoppers should experience**, not which browser APIs or CSS features to use—this tests whether the agent independently selects appropriate platform capabilities and verifies them in Chrome:

1. **Quick-add variant picker on catalogue cards**
   > Let shoppers add a plant to their bag directly from any card in the `#shop` grid by opening a compact picker next to that card's button where they can choose pot finish and pot size before adding. Dismiss the picker on outside click or `Escape`, keep full keyboard navigation, and verify the interaction in Chrome DevTools across desktop and mobile viewports.

2. **Seamless catalogue-to-product navigation**
   > Make navigating from a plant card in the lookbook grid to its product detail page—and returning via "Back to collection"—feel continuous rather than like an abrupt full-page cut, while respecting reduced-motion preferences. Verify both forward and back navigation in Chrome DevTools.

3. **Drawer & mobile menu transitions and focus handling**
   > Polish the mobile navigation menu and slide-over bag drawer so both opening and closing transitions run smoothly without abrupt snaps, background content cannot be scrolled or focused while an overlay is open, and `Escape` or backdrop clicks dismiss cleanly. Verify open, close, and keyboard behavior in Chrome DevTools.

4. **Scroll & gallery polish**
   > Improve the scroll experience across the sticky site header, editorial section reveal, and multi-photo product gallery so state changes and slide indicators stay responsive and free of layout shifts across viewports while honoring reduced-motion preferences. Verify computed styles and runtime behavior in Chrome DevTools.

5. **Resilient async cart feedback**
   > Test the product page add-to-bag flow and bag drawer updates under `?latency=1500` and `?fail=0.5`, tightening loading, disabled, error-announcement, and retry states so rapid clicks or slow responses never leave controls stuck or out of sync. Verify all states live in Chrome DevTools.
