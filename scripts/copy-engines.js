const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = path.resolve(__dirname, '..');

// First generate prisma client so all engines are fetched and generated
try {
  console.log('[copy-engines] Generating Prisma Client...');
  execSync('npx prisma generate --schema=packages/db/prisma/schema.prisma', {
    cwd: root,
    stdio: 'inherit',
  });
} catch (err) {
  console.warn('[copy-engines] Prisma generate warning:', err.message);
}

// Ensure database schema is pushed if needed
try {
  console.log('[copy-engines] Syncing SQLite schema...');
  execSync('npx prisma db push --schema=packages/db/prisma/schema.prisma --skip-generate', {
    cwd: root,
    stdio: 'inherit',
  });
} catch (err) {
  console.warn('[copy-engines] Prisma db push warning:', err.message);
}

// Locate candidate source directories containing .prisma or engines
const candidateSources = [
  path.join(root, 'packages/db/node_modules/.prisma/client'),
  path.join(root, 'node_modules/.prisma/client'),
  path.join(root, 'packages/db/node_modules/prisma'),
  path.join(root, 'node_modules/prisma'),
];

const targetDirs = [
  path.join(root, 'apps/backend'),
  path.join(root, 'apps/backend/dist'),
  path.join(root, 'apps/backend/.prisma/client'),
  path.join(root, 'apps/ws'),
  path.join(root, 'apps/ws/dist'),
  path.join(root, 'apps/ws/.prisma/client'),
  path.join(root, 'node_modules/.prisma/client'),
  path.join(root, '.prisma/client'),
];

for (const target of targetDirs) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }
}

for (const src of candidateSources) {
  if (fs.existsSync(src)) {
    const files = fs.readdirSync(src);
    for (const f of files) {
      if (f.includes('engine') || f.endsWith('.node')) {
        const fullSrc = path.join(src, f);
        for (const target of targetDirs) {
          try {
            const dest = path.join(target, f);
            fs.copyFileSync(fullSrc, dest);
            console.log(`[copy-engines] Copied ${f} to ${path.relative(root, dest)}`);
          } catch (e) {
            console.warn(`[copy-engines] Warning copying ${f} to ${target}:`, e.message);
          }
        }
      }
    }
  }
}

console.log('[copy-engines] Finished ensuring engines are present.');
