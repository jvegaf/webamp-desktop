// AIDEV-NOTE: Cross-platform replacement for `mkdir -p ./dist && cp -r ./bundled/* ./dist`.
// The original shell commands fail on Windows (no `mkdir -p` / `cp`).
// This script uses only Node.js built-ins so it works on every OS.
const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname, "..", "bundled");
const dest = path.resolve(__dirname, "..", "dist");

fs.mkdirSync(dest, { recursive: true });

for (const entry of fs.readdirSync(src)) {
  fs.cpSync(path.join(src, entry), path.join(dest, entry), { recursive: true });
}
