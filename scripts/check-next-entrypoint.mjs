import { existsSync, rmSync } from 'node:fs';

const middlewarePaths = ['./middleware.ts', './src/middleware.ts'];
const proxyPaths = ['./proxy.ts', './src/proxy.ts'];

const existingMiddleware = middlewarePaths.filter((path) => existsSync(path));
const hasProxy = proxyPaths.some((path) => existsSync(path));

if (existingMiddleware.length > 0 && hasProxy) {
  for (const file of existingMiddleware) {
    rmSync(file, { force: true });
    console.warn(`⚠️ Removed deprecated entrypoint: ${file}`);
  }
  console.log('✅ Deprecated middleware entrypoint removed; using proxy.ts only.');
  process.exit(0);
}

if (existingMiddleware.length > 0) {
  console.error('❌ Deprecated entrypoint detected: middleware.ts exists. Rename it to proxy.ts for Next.js 16+.');
  process.exit(1);
}

if (!hasProxy) {
  console.error('❌ Missing proxy.ts entrypoint. Add proxy.ts at project root (or src/proxy.ts).');
  process.exit(1);
}

console.log('✅ Next entrypoint check passed.');
