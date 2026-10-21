import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';

function resolveDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && !envUrl.includes('/Users/divyanshusharma')) {
    // If it is file:./dev.db or similar valid path, check if file exists
    const cleanPath = envUrl.replace(/^file:/, '');
    if (fs.existsSync(cleanPath)) {
      return envUrl;
    }
  }

  const searchPaths = [
    path.resolve(process.cwd(), 'packages/db/prisma/dev.db'),
    path.resolve(__dirname, '../../../../packages/db/prisma/dev.db'),
    path.resolve(__dirname, '../../../packages/db/prisma/dev.db'),
    path.resolve(__dirname, '../../packages/db/prisma/dev.db'),
    path.resolve(__dirname, '../packages/db/prisma/dev.db'),
    path.resolve(__dirname, './packages/db/prisma/dev.db'),
    path.resolve(__dirname, './dev.db'),
  ];

  for (const candidate of searchPaths) {
    if (fs.existsSync(candidate)) {
      return `file:${candidate}`;
    }
  }

  return envUrl || 'file:./packages/db/prisma/dev.db';
}

export const db = new PrismaClient({
  datasources: {
    db: {
      url: resolveDatabaseUrl(),
    },
  },
});
