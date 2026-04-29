import { existsSync } from 'node:fs';

const hasMiddleware = existsSync('./middleware.ts') || existsSync('./src/middleware.ts');
const hasProxy = existsSync('./proxy.ts') || existsSync('./src/proxy.ts');

if (hasMiddleware && hasProxy) {
  console.error('❌ Conflict detected: both middleware.ts and proxy.ts exist. Keep only proxy.ts for Next.js 16+.');
  process.exit(1);
}

if (hasMiddleware) {
  console.error('❌ Deprecated entrypoint detected: middleware.ts exists. Rename it to proxy.ts for Next.js 16+.');
  process.exit(1);
}

console.log('✅ Next entrypoint check passed.');
