# Demo 02: DashBite Food Delivery (Web Platform Baseline Sandbox)

## Scenario Overview

**DashBite** is an on-demand food delivery web application simulating modern large-scale consumer applications. It serves millions of users across diverse client environments: iOS Safari, Android Chrome, in-app mobile webviews, desktop browsers, and embedded web interfaces.

Adopting modern CSS and Web Platform APIs without verifying **Web Platform Baseline compatibility** introduces subtle, engine-specific regressions:
- UI tooltips and popovers breaking on Safari / WebKit.
- Navigation breaking on older mobile webviews due to un-guarded JavaScript APIs.
- Color functions rendering blank or transparent on engines lacking Color Module Level 4 support.

---

## Directory Organization

```
02-dashbite-baseline/
├── README.md                           # Overview of the DashBite Baseline demo
├── baseline/                           # Unoptimized "Before" code with non-Baseline features (Port 8002)
│   ├── index.html                      # Semantic delivery app structure
│   ├── server.py                       # HTTP server
│   ├── verify_server.py                # Automated test harness
│   ├── css/                            # main.css & components.css
│   ├── js/                             # app.js & restaurants.js
│   └── assets/images/                  # 100% self-contained food imagery
└── optimized/                          # Baseline 2024 Optimized Edition (Port 8003)
    ├── index.html                      # Optimized markup with high-priority LCP
    ├── server.py                       # HTTP server
    ├── verify_server.py                # Automated test harness
    ├── css/                            # Subgrid, Container Queries, color fallbacks
    ├── js/                             # Progressive View Transitions & Popover API
    └── assets/images/                  # Compressed high-gamut assets (-82% payload)
```
