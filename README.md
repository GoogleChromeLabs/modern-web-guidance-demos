# 📖 The Cozy Nook: Modern Web Guidance Demo

Welcome to **The Legacy Cozy Nook**, a legacy web bookstore application built as a live demonstration of [Modern Web Guidance](https://github.com/GoogleChromeLabs/modern-web-guidance) and browser-native optimization techniques. 

---

## 🎯 Modern Web Guidance Demo Purpose

This application is designed to demonstrate:
1. **The Performance Cost of Optimization Anti-Patterns**: We have intentionally misconfigured image loading priorities to showcase how poor heuristics degrade Largest Contentful Paint (LCP) on mobile networks.
2. **Chrome DevTools / Lighthouse Diagnostic Capabilities**: Using Lighthouse on mobile to identify and isolate loading bottlenecks.
3. **Modern Web Progressive Enhancements**: Upgrading legacy JS-heavy implementations to native browser APIs.


## 🛠️ Local Setup & Running the App

### Prerequisites
* **Node.js 18+** installed on your system.

### Installation
Clone the repository and run:
```bash
npm install
```

### Start the Server
Start a local development server to inspect the demo:
```bash
npm start
```

Once the server is running, open the local address in Chrome, open DevTools, and run a mobile Lighthouse audit to observe the performance profile!

---

## 🚨 Intentional Performance Bottleneck

To demonstrate the power of Chrome DevTools and Lighthouse audits, this application has been configured with an **intentional LCP bottleneck**. 

### The Misconfiguration
In [index.html](bookstore-app/index.html#L43-L84), we have applied the following `fetchpriority` anti-patterns to the bookstore carousel:

| Element / Area | Description |
| :--- | :--- |
| **LCP Candidate Deprioritized** | The main above-the-fold hero cover image (Book 1) is set to `fetchpriority="low"`. |
| **Offscreen Carousel Images Eagerly Loaded** | All six offscreen, hidden book items are set to `fetchpriority="high"`. |

```html
<!-- ❌ BAD PRACTICE: LCP image is deprioritized -->
<img src="./assets/cover1.png" alt="The Whispering Shadows cover" class="cover-img" fetchpriority="low">

<!-- ❌ BAD PRACTICE: Off-screen images compete for critical bandwidth -->
<img src="./assets/cover2.png" alt="Midnight at the Oasis cover" class="cover-img" fetchpriority="high">
```

### Lighthouse / Chrome DevTools Impact
When running a Mobile Lighthouse performance audit on this app:

| Diagnostic Metric / Finding | Audit Impact / Explanation |
| :--- | :--- |
| **Largest Contentful Paint (LCP)** | is severely delayed because the browser postpones downloading the visible cover image in favor of the six offscreen images. |
| **Network Contention** | is flagged as a major issue due to multiple critical-priority network requests for images that are not yet visible. |

---

## 🚀 Modern Web Guidance: Showcase of Core Improvements

Leveraging Modern Web Guidance skills, here are the core improvements that could be applied to the app:

| # | Core Improvement | Modern Standard / API | Key Implementation & Fallback Summary |
| :---: | :--- | :--- | :--- |
| **1** | **Optimizing Image Priority** | [`optimize-image-priority`](#1-optimizing-image-priority-optimize-image-priority) | Apply `fetchpriority="high"` on the LCP candidate and let `loading="lazy"` handle offscreen images to resolve mobile performance bottlenecks. |
| **2** | **Progressive Scroll-Driven Animations** | [`scroll-driven-animations`](#2-progressive-scroll-driven-animations-scroll-driven-animations) | Use CSS view timelines for scroll animations. A lightweight [app.js](bookstore-app/app.js#L115-L138) `IntersectionObserver` fallback is provided for cross-browser support. |
| **3** | **Native Popover API for Nav Drawer** | [`popover-navigation`](#3-native-popover-api-for-nav-drawer-popover-navigation) | Utilize the native HTML `popover` attribute for menus, eliminating heavy modal libraries and manual event listeners. |
| **4** | **Dynamic View Transitions** | [`view-transitions`](#4-dynamic-view-transitions-view-transitions) | Wrap DOM state updates in `document.startViewTransition()` to natively animate layout changes with minimal JS. |


#### 1. Optimizing Image Priority (`optimize-image-priority`)
To fix the mobile performance audit, apply the correct priority mappings as guided by Modern Web Use Cases:

```diff
  <!-- Book 1 (Above the Fold / LCP Candidate) -->
- <img src="./assets/cover1.png" class="cover-img" fetchpriority="low">
+ <img src="./assets/cover1.png" class="cover-img" fetchpriority="high">

  <!-- Books 2 to 7 (Initially Off-Screen) -->
- <img src="./assets/cover2.png" class="cover-img" fetchpriority="high">
+ <img src="./assets/cover2.png" class="cover-img" loading="lazy">
```
> [!TIP]
> Set `fetchpriority="high"` only on the primary LCP image. For hidden or offscreen carousel slides, omit `fetchpriority` and let native `loading="lazy"` defer their requests until they enter the viewport.


#### 2. Progressive Scroll-Driven Animations (`scroll-driven-animations`)
Instead of listening to heavy scroll events in JavaScript and forcing layout recalculations, the carousel utilizes **CSS Scroll-Driven Animations** for a premium 3D scaling effect.

```css
/* Native CSS Scroll-Driven Animations */
@supports ((animation-timeline: view()) and (animation-range: entry)) {
  @keyframes scale-up {
    0%   { transform: scale(0.75); opacity: 0.4; }
    50%  { transform: scale(1.05); opacity: 1; }
    100% { transform: scale(0.75); opacity: 0.4; }
  }

  .book-item {
    animation: scale-up auto linear both;
    animation-timeline: view(inline);
  }
}
```
> [!NOTE]
> For browsers that do not yet support scroll-driven timelines, [app.js](bookstore-app/app.js#L115-L138) features a lightweight, performant `IntersectionObserver` fallback, ensuring cross-browser smooth scaling.

#### 3. Native Popover API for Nav Drawer (`popover-navigation`)
We replaced heavy modal libraries and complex JS toggle classes with the native HTML **Popover API**, bringing built-in keyboard accessibility, backdrop click-dismissal, and top-layer stacking out of the box.

```html
<!-- Toggle Button -->
<button popovertarget="nav-menu" aria-label="Open Menu">Menu</button>

<!-- Navigation popover element -->
<nav id="nav-menu" popover="auto" class="nav-menu">
  <!-- Popover Content -->
</nav>
```

#### 4. Dynamic View Transitions (`view-transitions`)
When a user clicks a book cover to load its details, we use the **View Transitions API** to automatically animate the content transition, delivering a seamless app-like feel with a single line of JS.

```javascript
const updateContent = () => {
  detailsGenre.textContent = book.genre;
  detailsTitle.textContent = book.title;
  // Update other details...
};

if (document.startViewTransition) {
  // Seamless cross-fade/layout animation handled natively by browser
  document.startViewTransition(() => updateContent());
} else {
  updateContent();
}
```
