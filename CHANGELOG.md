# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2026-06-02

### Fixed

- **Missing `fs-extra` module in packaged app**: The app crashed on startup after installation with "Cannot find module 'fs-extra'" error. Root cause was pnpm's default isolated `node_modules` structure (symlinks under `.pnpm/`) not being correctly followed by electron-builder when packaging the app, causing transitive dependencies to be omitted from the installer.
  - Added `.npmrc` with `shamefully-hoist=true` to flatten `node_modules` structure, making it compatible with electron-builder.
  - Added `fs-extra` as a direct dependency in `package.json` for explicit inclusion.

- **Windows build script failure**: The `copy` script used Unix commands (`mkdir -p`, `cp -r`) that don't exist on Windows, causing `pnpm build` to fail.
  - Created `scripts/copy.js` using Node.js built-in APIs (`fs.mkdirSync`, `fs.cpSync`) for cross-platform compatibility.
  - Updated `package.json` to use `node scripts/copy.js` instead of shell commands.

### Changed

- Migrated from pnpm's isolated `node_modules` to hoisted structure for electron-builder compatibility.
- Build scripts are now cross-platform (Windows, macOS, Linux).
