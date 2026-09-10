# DashBite — Food Delivery Demo (Baseline 2024 Optimized Edition)

## Overview

This is the **Baseline 2024 Optimized Edition** of DashBite. It demonstrates the direct engineering, performance, and cross-browser resilience benefits of aligning with the **Web Platform Baseline 2024 target**:

1. **100% Cross-Engine SPA Navigation**: Replaced unconditional `document.startViewTransition()` calls with progressive feature detection (`'startViewTransition' in document`), eliminating fatal JavaScript crashes on Safari <18 and older in-app WebViews.
2. **Standardized Tooltip Popovers**: Replaced Chromium-only CSS Anchor Positioning (`anchor-name`) with standardized **HTML5 Popover API & CSS relative positioning**, restoring visual parity on Safari and Firefox.
3. **Subgrid & Container Queries**: Implemented `grid-template-rows: subgrid` and `@container` queries, ensuring synchronized card row alignments and context-aware responsiveness across varying screen sizes.
4. **Resilient Color Spaces**: Paired modern `color-mix(in oklch, ...)` and relative color syntax with standard sRGB fallbacks.
5. **83% Payload Reduction**: Optimized uncompressed image payloads from **7.6 MB down to 1.3 MB**, eliminating the DevTools ImageDelivery bottleneck.

---

## Running the Optimized Demo

```bash
cd demos/02-dashbite-baseline/optimized
python3 server.py 8003
```

Open **`http://localhost:8003`** (or your Cloudtop proxy URL).

### Automated Smoke Verification:
```bash
python3 verify_server.py 8003
```
