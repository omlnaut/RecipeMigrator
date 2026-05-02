# Section 1 — Environment Setup

## Overview

This section establishes the development environment for the Recipe Migrator app. You will configure a DevContainer to pin a reproducible Node.js runtime, scaffold the app using Vite with React and TypeScript, and orient yourself in the resulting project structure. By the end you will have a running development server with a blank-slate TypeScript React app ready for the sections ahead.

## Background

### 1.1 — DevContainer: VS Code, Node.js, extensions

A DevContainer defines a reproducible development environment as code. VS Code reads `.devcontainer/devcontainer.json` and provisions a Docker container with the specified runtime, tools, and extensions. For a Node.js project this eliminates "works on my machine" problems by pinning the Node version and pre-installing extensions.

The key fields in `devcontainer.json`:

```json
{
  "name": "Recipe Migrator",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode"
      ]
    }
  }
}
```

- **`image`** — The base Docker image. Microsoft publishes pre-built images for Node.js at `mcr.microsoft.com/devcontainers/javascript-node:<version>`.
- **`customizations.vscode.extensions`** — Extension IDs to auto-install inside the container. TypeScript language support is built into VS Code and does not need to be listed here.

This is conceptually analogous to a `pyproject.toml` + virtualenv setup in Python, except the container boundary is stronger — it includes the runtime itself, not just package dependencies.

### 1.2 — Scaffolding the app with Vite + React + TypeScript

Vite is a build tool and dev server. Compared to older tools like webpack or Create React App, it starts faster because it serves files as native ES modules in dev mode without bundling them first. Production builds are handled by Rollup. You will not need to configure Vite directly for this project — the defaults work.

The `npm create vite@latest` command runs Vite's interactive scaffolder. Selecting the `react-ts` template produces:

- React 18 and its TypeScript type definitions
- TypeScript configured in strict mode (`tsconfig.json`)
- A minimal `src/App.tsx` demonstrating JSX syntax
- A `vite.config.ts` that wires Vite to the React JSX transform

After scaffolding, `npm install` downloads all declared dependencies into `node_modules/`. This is equivalent to `pip install -r requirements.txt`. Never commit `node_modules/` — it is excluded via `.gitignore`.

### 1.3 — Project structure tour

A freshly scaffolded Vite + React + TypeScript project has this layout:

```
├── index.html           # The single HTML file. Vite injects the JS bundle here.
├── vite.config.ts       # Vite configuration. Declares the React plugin.
├── tsconfig.json        # Root TypeScript config. Sets "strict": true.
├── tsconfig.app.json    # TS config for src/ (targets browser, extends tsconfig.json).
├── tsconfig.node.json   # TS config for vite.config.ts (runs in Node, not browser).
├── package.json         # Dependencies and npm scripts: dev, build, preview.
├── public/              # Static assets served as-is. Not processed by Vite.
└── src/
    ├── main.tsx         # React entry point. Mounts <App /> into index.html.
    ├── App.tsx          # Root component. This is where your app starts.
    ├── App.css          # Boilerplate styles for App.tsx. Can be deleted.
    ├── index.css        # Global styles. Can be replaced.
    └── assets/          # Imported assets (images, SVGs) processed by Vite.
```

**`index.html` is the true entry point** — not `main.tsx`. Vite loads `index.html` first, follows the `<script type="module" src="/src/main.tsx">` tag, and builds the dependency graph from there.

**`tsconfig.json` + `tsconfig.app.json`** — Vite splits TypeScript config so that browser code (`src/`) and build-tool code (`vite.config.ts`) can target different environments. The important settings live in `tsconfig.app.json`:

- `"strict": true` — enables all strict checks, equivalent to `mypy --strict` in Python
- `"moduleResolution": "bundler"` — tells TypeScript that a bundler (Vite) handles import resolution, not Node.js

The boilerplate in the generated `src/App.tsx` (Vite logo, counter button, CSS imports) serves no purpose for this project. It should be removed before work begins in Section 2.

## Exercises

### Exercise 1.1 — Create the DevContainer configuration

**File:** `.devcontainer/devcontainer.json`

**Task:** Create the DevContainer configuration file. Use the official Microsoft Node.js 20 devcontainer image (`mcr.microsoft.com/devcontainers/javascript-node:20`). Include the `dbaeumer.vscode-eslint` and `esbenp.prettier-vscode` extensions in the VS Code customizations. Set the container name to `"Recipe Migrator"`.

**Why:** Pins the Node.js runtime and VS Code extensions as code, ensuring the environment is reproducible across machines.

---

### Exercise 1.2 — Scaffold the Vite app

**Files:** `package.json`, `src/`, `vite.config.ts`, `tsconfig.json`

**Task:** Inside the devcontainer terminal, scaffold a new Vite project in the repository root using the `react-ts` template. After scaffolding, run `npm install` to fetch all dependencies. Verify the dev server starts with `npm run dev` and the browser shows the default Vite + React page. Confirm `node_modules/` is present in `.gitignore`.

**Why:** Produces the base application structure that all later sections build on. Running the dev server confirms the full toolchain is functional.

---

### Exercise 1.3 — Strip the boilerplate from App.tsx

**File:** `src/App.tsx`

**Task:** Replace the contents of `src/App.tsx` with a minimal functional component that renders a single `<h1>` element containing the text `"Recipe Migrator"`. Remove the CSS imports from `App.tsx`. Do not delete `index.css` or `main.tsx`. Confirm the dev server compiles without TypeScript errors.

**Why:** Forces you to distinguish boilerplate from structurally required code, and confirms you can read and modify JSX.

---

## Acceptance Criteria

### s1.1 — DevContainer

- [ ] A `.devcontainer/devcontainer.json` file exists
- [ ] The `image` field references a Node.js 20 devcontainer image (`javascript-node:20` or equivalent)
- [ ] `dbaeumer.vscode-eslint` is listed in `customizations.vscode.extensions`
- [ ] `esbenp.prettier-vscode` is listed in `customizations.vscode.extensions`
- [ ] The container `name` is `"Recipe Migrator"`

### s1.2 — Vite Scaffold

- [ ] `package.json` exists and declares `react` and `react-dom` as dependencies
- [ ] `package.json` declares `vite` as a dev dependency
- [ ] `tsconfig.json` or `tsconfig.app.json` exists and includes `"strict": true`
- [ ] `src/main.tsx` exists and mounts the React app
- [ ] `node_modules/` is listed in `.gitignore`

### s1.3 — Stripped App.tsx

- [ ] `src/App.tsx` contains no import of `App.css` or any other CSS file
- [ ] `src/App.tsx` exports a default function component
- [ ] The component renders an `<h1>` containing the text `"Recipe Migrator"`
- [ ] No other JSX elements from the Vite boilerplate remain in `src/App.tsx`
