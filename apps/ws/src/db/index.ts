import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function resolveDatabaseUrl(): string {
  let targetPath = '';

  if (process.env.DATABASE_URL) {
    const raw = process.env.DATABASE_URL;
    if (!raw.includes('/Users/divyanshusharma')) {
      const clean = raw.replace(/^file:/, '');
      const abs = path.isAbsolute(clean) ? clean : path.resolve(process.cwd(), clean);
      if (fs.existsSync(abs)) {
        targetPath = abs;
      }
    }
  }

  if (!targetPath) {
    const candidates = [
      path.resolve(process.cwd(), 'packages/db/prisma/dev.db'),
      path.resolve(__dirname, '../../../../packages/db/prisma/dev.db'),
      path.resolve(__dirname, '../../../packages/db/prisma/dev.db'),
      path.resolve(__dirname, '../../packages/db/prisma/dev.db'),
      path.resolve(__dirname, '../packages/db/prisma/dev.db'),
      path.resolve(__dirname, './packages/db/prisma/dev.db'),
      path.resolve(__dirname, './dev.db'),
    ];

    for (const c of candidates) {
      if (fs.existsSync(c)) {
        targetPath = c;
        break;
      }
    }
  }

  if (!targetPath) {
    targetPath = path.resolve(process.cwd(), 'packages/db/prisma/dev.db');
  }

  const resolved = path.resolve(targetPath);
  return `file:${resolved}`;
}

export const db = new PrismaClient({
  datasources: {
    db: {
      url: resolveDatabaseUrl(),
    },
  },
});
