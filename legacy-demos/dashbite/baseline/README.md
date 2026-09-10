# DashBite — Food Delivery Baseline Demo (Use Case 2)

## Scenario Overview

**DashBite** is an on-demand food delivery web application built to simulate modern cross-browser platform realities. It features a complete consumer journey:
- Restaurant discovery feed with category filtering, search, and delivery fee chips.
- Restaurant detail & menu view with categorized sections.
- Dish customization dialog with radio/checkbox modifiers and dynamic pricing.
- Slide-out cart drawer with tip selector, fees, and multi-step delivery tracking.

---

## Embedded Non-Baseline Pitfalls (The "Before" Baseline)

This codebase intentionally utilizes bleeding-edge web platform features that are **not yet widely available across all major browser engines (Chromium, WebKit/Safari, Firefox/Gecko)** or lack progressive enhancement fallbacks:

| # | Feature Area | Specific Code Pattern | Cross-Browser Impact / Baseline Status |
| :-: | :--- | :--- | :--- |
| **1** | **CSS Anchor Positioning** | `anchor-name: --fee-anchor`, `position-anchor: --fee-anchor`, `top: anchor(bottom)` in `css/components.css` | 🔴 **Limited Availability (Chromium Only)**: In Safari and Firefox, delivery fee tooltips fly to `(0,0)` top-left or fail to render. |
| **2** | **JavaScript View Transitions** | Unconditional `document.startViewTransition()` in `js/app.js` | 🟡 **Newly Available / Gaps**: Throws `TypeError: document.startViewTransition is not a function` in Safari <18 and older webviews, blocking navigation. |
| **3** | **CSS Relative Color Syntax & oklch** | `color-mix(in oklch, ...)`, `rgb(from var(--dash-red) r g b / 35%)` in `css/components.css` without sRGB fallback | 🔴 **Engine Gaps**: Older browser engines and embedded webviews drop the entire declaration, breaking button backgrounds and shadows. |
| **4** | **Popover API & `@starting-style`** | `popover="auto"` with `transition-behavior: allow-discrete` in `css/components.css` & `index.html` | 🟡 **Newly Available**: Discrete transition behavior fails on older engines, resulting in abrupt modal pop-in without smooth transitions. |

---

## Running the Demo

```bash
cd demos/02-dashbite-baseline/baseline
python3 server.py 8002
```

Open **`http://localhost:8002`** (or your Cloudtop proxy URL).

### Smoke Verification:
```bash
python3 verify_server.py 8002
```
