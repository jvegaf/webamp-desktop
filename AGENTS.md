# AGENTS.md

## Project summary

Electron desktop wrapper around [Webamp](https://github.com/captbaritone/webamp) (Winamp 2.9 reimplementation in HTML5/JS). Targets Windows, macOS, and Linux.

## Commands

| Task | Command |
|---|---|
| Install deps | `pnpm install` |
| Dev run | `pnpm start` (builds then launches Electron) |
| Watch renderer | `pnpm watch` (parcel watch; run `pnpm electron` separately) |
| Build only | `pnpm build` (copies `bundled/` → `dist/`, then parcel build) |
| Test | `pnpm test` (Spectron e2e — see Testing below) |
| Package | `pnpm pack:win`, `pnpm pack:mac`, `pnpm pack:linux` |

Package manager is **pnpm** (not yarn, despite what the README says). `.npmrc` sets `shamefully-hoist=true` — **do not remove this**; electron-builder cannot follow pnpm's symlinked `node_modules` and the packaged app will crash with missing modules.

## Architecture

Three Electron processes:

- **Main** (`main.js`, plain JS): creates `BrowserWindow`, intercepts `file://` protocol to inject CSP headers, manages window sizing/scaling, injects drag CSS, handles auto-updates.
- **Preload** (`src/preload/index.js`, plain JS): context bridge via `contextBridge.exposeInMainWorld`. Measures Webamp DOM bounding boxes and sends CSS-px dimensions to main via IPC (`resize-to-webamp`). Handles per-platform transparency (mouse event forwarding on Windows, polling on Linux).
- **Renderer** (`src/renderer.ts`, TypeScript): instantiates Webamp, configures initial tracks/skins, exposes playback controls on `window`.

### Window sizing flow

The renderer preload measures the union of `#main-window`, `#equalizer-window`, `#playlist-window` bounding rects, sends `{width, height}` in CSS px to main via IPC. Main multiplies by `SCALE` (env `WEBAMP_SCALE`, default `1.2`) and calls `setContentSize`. The window starts hidden at 100×100 and is shown only after the first successful resize.

### Vendored Webamp bundle

`src/webamp/webamp.bundle.js` is a **custom/vendored build** of Webamp, not the npm `webamp` package. The npm package is listed in devDependencies but is not imported at runtime. Do not attempt to update Webamp via `pnpm add webamp` — the bundle must be replaced manually.

### Static assets

`bundled/` contains skins (`.wsz`) and a sample MP3. `scripts/copy.js` copies them to `dist/` at build time. Skins are referenced by URL in `src/renderer.ts`.

### OS "Open with..." file handling

External audio files opened via the OS context menu use a custom `webamp-file://` protocol (registered in `main.js` via `protocol.handle`). This avoids conflicts with the `file://` interceptor which is scoped to app assets. The CSP in `src/node/protocol.js` must include `webamp-file:` in both `media-src` and `connect-src`. On Windows, the browser normalizes the drive letter to lowercase in the URL host — the handler reconstructs the path using `hostname.toUpperCase()` + `pathname`. Single instance is enforced via `app.requestSingleInstanceLock()`; subsequent launches forward the file path via the `second-instance` event.

## Key gotchas

- **Linux**: hardware acceleration is disabled in `main.js` for transparency support (Chromium bug). Window creation is delayed 100ms.
- **`DRAG_CSS`**: a large CSS string in `main.js` injected at `dom-ready` to make window chrome draggable (`-webkit-app-region: drag`). Interactive elements are explicitly `no-drag`. Changes to drag behavior require editing this string.
- **`thumbar.js`** (`src/preload/thumbar.js`): dead code — imports `@electron/remote` which is not installed. Not referenced from the active preload.
- **`tsconfig.json`** targets ES5 with CommonJS modules. TypeScript only covers `src/**/*`; main.js and preload are plain JS.
- **ESLint** extends `eslint:recommended`, `@typescript-eslint/recommended`, and `prettier`. No separate format command — use the ESLint config as the style source of truth.

## Testing

Tests use **Spectron** (deprecated Electron e2e framework) via Jest. They launch the full Electron app and require a display:
- On Linux CI, `xvfb` is needed (see `.travis.yml`).
- Tests are slow (30s timeout each) and partially skipped.
- Test files live in `src/__tests__/*.spec.ts`.
- Jest config is inline in `package.json` (transforms `.ts` via `ts-jest`).

There is no active CI pipeline — `.travis.yml` is stale (Node 10, old Electron) and there are no GitHub Actions workflows.
