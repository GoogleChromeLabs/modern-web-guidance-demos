# 📖 The Legacy Cozy Nook: Modern Web Guidance Demo

Welcome to **The Legacy Cozy Nook**, a legacy web bookstore application built as a live demonstration of [Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) and browser-native optimization techniques. 
This is an accompaniment to the [Modern Web Guidance codelab](https://codelabs.developers.google.com/codelabs/modern-web-guidance-101).

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

In [index.html](public/index.html), we have applied the following loading anti-pattern to the main hero section:

| Element / Area | Description |
| :--- | :--- |
| **LCP Candidate Delayed** | The main hero image is loaded dynamically using JavaScript in [hero.js](public/modules/hero.js) instead of being declared in the HTML source. |

```html
<!-- ❌ BAD PRACTICE: The src attribute is loaded with JS, delaying LCP -->
<img alt="Old Books stack on wooden table" class="hero-img">
```

When running a Mobile Lighthouse performance audit on this app:

| Diagnostic Metric / Finding | Audit Impact / Explanation |
| :--- | :--- |
| **Largest Contentful Paint (LCP)** | is severely delayed because the browser's preload scanner cannot discover the image URL, postponing the download until JavaScript has loaded and executed. |

---

## 🚀 Modern Web Guidance: Showcase of Core Improvements

Leveraging Modern Web Guidance skills, here are the core improvements that could be applied to the app:

| # | Core Improvement | Modern Standard / API | Key Implementation & Fallback Summary |
| :---: | :--- | :--- | :--- |
| **1** | **Optimizing Image Priority** | [`optimize-image-priority`](#1-optimizing-image-priority-optimize-image-priority) | Load the hero image directly in the HTML with `fetchpriority="high"` to resolve mobile LCP bottlenecks. |
| **2** | **Progressive Scroll-Driven Animations** | [`scroll-driven-animations`](#2-progressive-scroll-driven-animations-scroll-driven-animations) | Smoothly animate the fixed bottom navigation bar on mobile to slide out of view as the user scrolls up and down. |
| **3** | **Dynamic View Transitions** | [`view-transitions`](#3-dynamic-view-transitions-view-transitions) | Wrap DOM state updates in `document.startViewTransition()` to natively animate layout changes with minimal JS. |


#### 1. Optimizing Image Priority (`optimize-image-priority`)
To fix the mobile performance audit, move the image to the HTML source, apply the correct priority mappings and switch from `.png` to `.jpg` for rendering on mobile web.

```diff
  <!-- Hero Section LCP Candidate -->
- <img alt="Old Books stack on wooden table" class="hero-img">
+ <img src="./assets/hero-img.png" fetchpriority="high" alt="Old Books stack on wooden table" class="hero-img">

  <!-- Initially Off-Screen Book Images -->
- <img src="./assets/cover2.png" class="cover-img">
+ <img src="./assets/cover2.png" class="cover-img" loading="lazy">
```
> [!TIP]
> Here we can set `fetchpriority="high"` only on the primary LCP image. For hidden or offscreen images, omit `fetchpriority` and let native `loading="lazy"` defer their requests until they enter the viewport.


#### 2. Progressive Scroll-Driven Animations (`scroll-driven-animations`)
To maximize reading screen space on mobile devices, the bottom navigation bar can be hidden when scrolling down and revealed when scrolling up. 

Instead of listening to heavy scroll events in JavaScript and forcing layout recalculations, we can utilize **CSS Scroll-Driven Animations**.

```css
@keyframes slide-out {
  to {
    transform: translateY(100%);
  }
}

.mobile-bottom-nav {  
  position: fixed;
  bottom: 0;
  animation: slide-out auto linear both;
  animation-timeline: scroll(block root);
  animation-range: 0px 100px;
}
```

#### 3. Dynamic View Transitions (`view-transitions`)
The **View Transitions API** automatically animates content transitions (such as updating book details), delivering a seamless app-like feel with minimal JS.

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
