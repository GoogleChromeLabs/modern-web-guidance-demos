# 🚀 Modern Web Guidance Demos

Welcome to **Modern Web Guidance Demos** — a collection of self-contained web applications designed for testing AI coding agents with **[Modern Web Guidance (MWG)](https://developer.chrome.com/docs/modern-web-guidance)** and **[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)**.

Each application provides a realistic baseline codebase where you can give your coding agent product- and UX-level prompts, verify its work in a real Chrome browser, and compare implementations built **without** vs. **with** Modern Web Guidance.

---

## 📦 Repository Structure

```text
.
├── README.md                          # Repository overview & evaluation setup (this file)
├── LICENSE                            # Apache 2.0 License
├── CONTRIBUTING.md                    # Google CLA and contribution guidelines
└── legacy-demos/
    ├── folia/                         # Botanical storefront (multi-page Vite app + MSW cart API)
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

### 1. Chrome DevTools for Agents (`chrome-devtools-mcp`)

Configure **[Chrome DevTools MCP](https://github.com/ChromeDevTools/chrome-devtools-mcp)** so your coding agent can inspect live DOM/CSS state, interact with pages in Chrome, and verify visual and keyboard behavior:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

### 2. Modern Web Guidance Skill

To add **[Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance)** to a workspace when running a guided session:

```bash
npx skills add GoogleChrome/modern-web-guidance
```

> [!TIP]
> For clean before/after comparisons, create two separate branches or `git worktree` checkouts—run your prompt first **without** the `modern-web-guidance` skill installed, then install the skill in the second checkout, restart your agent session so the skill loads cleanly, and run the exact same prompt.

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
