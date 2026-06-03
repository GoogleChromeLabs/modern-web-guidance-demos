# 🚀 Modern Web Guidance Demos

Welcome to the **Modern Web Guidance Demos** repository! This project is a curated collection of "brownfield" (legacy) web applications designed to showcase how using **[Modern Web Guidance (MWG)](https://github.com/GoogleChrome/modern-web-guidance)** with your AI agent can transform legacy web patterns into modern, performant, accessible, and highly premium user experiences.

These demos serve as interactive playground environments designed with AI-assisted workflows in mind. By cloning these mini-apps, you can work with your AI coding assistant to identify common bottlenecks and practice upgrading legacy code using native web platform APIs.

---

## 📦 Repository Structure

At this stage, the repository contains the following self-contained mini-app under `legacy-demos/`:

```
.
├── README.md                    # Main project overview and details (this file)
├── LICENSE                      # Apache 2.0 License
├── CONTRIBUTING.md              # Google CLA and contribution guidelines
├── legacy-demos/
│   └── cozy-nook-bookshop/      # Vanilla JS mini-app (Baseline 2024 target)
│       ├── README.md            # Details: App description and legacy patterns
│       ├── bookstore-app/       # Legacy HTML, CSS, and JS source files
│       └── package.json         # Development and bundling scripts (Vite)
└── examples.md                  # Index linking to live deployments and references
```

---

## 🚀 Branching Strategy

To protect the learning experience from context-sniffing by AI coding assistants, this repository uses a two-branch strategy:

*   **`main` branch**: Contains only the **legacy, "brownfield"** states of the mini-apps. It contains absolutely no solution code or test assertions.
*   **`solution` branch**: Contains the **fully modernized and optimized** versions of the code. If you get stuck or need to compare your implementation with the recommended modern standards, you can checkout this branch to view the reference architecture.

To explore the solutions:
```bash
git checkout solution
```

---

## 🛠️ Getting Started

To run the Cozy Nook Bookshop demo locally, navigate into its directory, install dependencies, and start the development server:

```bash
cd legacy-demos/cozy-nook-bookshop
npm install
npm run dev
```

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
