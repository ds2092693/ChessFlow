const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '../apps/frontend/dist');
const targets = [
  path.resolve(__dirname, '../dist'),
  path.resolve(__dirname, '../public'),
];

if (fs.existsSync(src)) {
  for (const t of targets) {
    try {
      fs.cpSync(src, t, { recursive: true, force: true });
      console.log(`[copy-dist] Copied frontend build to ${t}`);
    } catch (e) {
      console.warn(`[copy-dist] Warning copying to ${t}:`, e.message);
    }
  }
}
