import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function resolveDatabaseUrl(): string {
  const isProd = process.env.NODE_ENV === 'production';
  const tmpPath = path.resolve('/tmp', 'chessflow_prod.db');

  const candidates = [
    path.resolve(process.cwd(), 'packages/db/prisma/dev.db'),
    path.resolve(__dirname, '../../../../packages/db/prisma/dev.db'),
    path.resolve(__dirname, '../../../packages/db/prisma/dev.db'),
    path.resolve(__dirname, '../../packages/db/prisma/dev.db'),
    path.resolve(__dirname, '../packages/db/prisma/dev.db'),
    path.resolve(__dirname, './packages/db/prisma/dev.db'),
    path.resolve(__dirname, './dev.db'),
  ];

  let sourceDb = '';
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      sourceDb = c;
      break;
    }
  }

  // In production environments (like Render container), use /tmp to guarantee read/write access
  if (isProd || process.platform === 'linux') {
    if (sourceDb && !fs.existsSync(tmpPath)) {
      try {
        fs.copyFileSync(sourceDb, tmpPath);
        fs.chmodSync(tmpPath, 0o666);
      } catch (err) {
        console.warn('Could not copy db to /tmp, falling back to source path:', err);
      }
    }
    if (fs.existsSync(tmpPath)) {
      return `file:${tmpPath}`;
    }
  }

  if (sourceDb) {
    return `file:${path.resolve(sourceDb)}`;
  }

  return `file:${tmpPath}`;
}

export const db = new PrismaClient({
  datasources: {
    db: {
      url: resolveDatabaseUrl(),
    },
  },
});
