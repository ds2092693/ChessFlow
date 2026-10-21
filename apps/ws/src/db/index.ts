import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    const raw = process.env.DATABASE_URL;
    if (!raw.includes('/Users/divyanshusharma')) {
      const clean = raw.replace(/^file:/, '');
      if (fs.existsSync(clean)) return raw;
    }
  }

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
      return `file:${c}`;
    }
  }

  return `file:${path.resolve(process.cwd(), 'packages/db/prisma/dev.db')}`;
}

export const db = new PrismaClient({
  datasources: {
    db: {
      url: resolveDatabaseUrl(),
    },
  },
});
