# 🚀 Modern Web Guidance Demos

Welcome to **Modern Web Guidance Demos** — a collection of self-contained web applications designed for testing AI coding agents with **[Modern Web Guidance (MWG)](https://developer.chrome.com/docs/modern-web-guidance)** and **[Chrome DevTools for agents](https://developer.chrome.com/docs/devtools/agents)**.

Each application provides a realistic baseline codebase where you can give your coding agent product- and UX-level prompts, verify its work in a real Chrome browser, and compare implementations built **without** vs. **with** Modern Web Guidance.

---

## 📦 Repository Structure

```text
.
├── README.md                          # Repository overview & evaluation setup (this file)
├── LICENSE                            # Apache 2.0 License
├── CONTRIBUTING.md                    # Google CLA and contribution guidelines
└── legacy-demos/
    ├── folia/                         # Botanical storefront (multi-page Vite app + mock cart API)
    │   ├── README.md                  # App overview, network flags, A/B workflow & prompts
    │   ├── AGENTS.md                  # Browser verification rules for coding agents
    │   ├── index.html                 # Home, editorial showcase & filterable lookbook
    │   ├── product.html               # Specimen detail view, gallery & variant picker
    │   └── package.json               # Vite dev, build, and preview scripts
    └── cozy-nook-bookshop/            # Online bookshop demo (Vite vanilla JS mini-app)
        ├── README.md                  # App setup and walkthrough notes
        ├── public/                    # HTML, CSS, and JS source files
        └── package.json               # Vite dev and build scripts
```

---

## 🛠️ Getting Started

Navigate into a demo directory, install dependencies, and start its local Vite development server:

### Folia Storefront

```bash
cd legacy-demos/folia
npm install
npm run dev
```

See [`legacy-demos/folia/README.md`](./legacy-demos/folia/README.md) for architecture notes, simulated network flags (`?latency=`, `?fail=`), side-by-side evaluation instructions, and ready-to-run prompts.

### Cozy Nook Bookshop

```bash
cd legacy-demos/cozy-nook-bookshop
npm install
npm run dev
```

---

## 🧪 Agent Tooling Setup

### 1. Chrome DevTools for agents

Set up **[Chrome DevTools for agents](https://developer.chrome.com/docs/devtools/agents)** so your coding agent can inspect live DOM and CSS state, interact with pages in Chrome, and verify visual and keyboard behavior. Follow the [installation instructions on Chrome for Developers](https://developer.chrome.com/docs/devtools/agents) for your preferred IDE or CLI.

### 2. Modern Web Guidance

To install **[Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance)** in a workspace when running a guided session:

```bash
npx modern-web-guidance@latest install
```

> [!TIP]
> For clean before/after comparisons, create two separate branches or `git worktree` checkouts—run your prompt first **without** Modern Web Guidance installed, then run `npx modern-web-guidance@latest install` in the second checkout, restart your agent session so the skills load cleanly, and run the exact same prompt.

---

## 📋 Open Source & Licensing

This project is released under the terms of the **Apache 2.0 License**. See [LICENSE](./LICENSE) for the full text.

To contribute, please read [CONTRIBUTING.md](./CONTRIBUTING.md) for information on signing the Google Contributor License Agreement (CLA).

---

## ⚠️ Disclaimer

> [!IMPORTANT]
> This is not an officially supported Google product. This project is not eligible for the [Google Open Source Software Vulnerability Rewards Program](https://bughunters.google.com/open-source-security).

> [!NOTE]
> This project is intended for demonstration purposes only. It is not intended for use in a production environment.
