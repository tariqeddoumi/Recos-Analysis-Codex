import { readdirSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const appDir = join(process.cwd(), 'app');
const routeFiles = [];

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      if (entry === 'node_modules' || entry === '.next') continue;
      walk(fullPath);
    } else if (/^(page|route)\.(tsx|ts|jsx|js)$/.test(entry)) {
      routeFiles.push(fullPath);
    }
  }
}

function normalizeRoute(filePath) {
  const parts = relative(appDir, filePath).split(sep);
  const fileName = parts.pop();
  const routeParts = parts.filter((part) => !/^\(.+\)$/.test(part) && !part.startsWith('@'));
  const routePath = `/${routeParts.join('/')}`.replace(/\/index$/, '') || '/';
  return `${fileName?.split('.')[0]}:${routePath}`;
}

walk(appDir);

const routes = new Map();
for (const file of routeFiles) {
  const key = normalizeRoute(file);
  const existing = routes.get(key) ?? [];
  existing.push(relative(process.cwd(), file));
  routes.set(key, existing);
}

const conflicts = [...routes.entries()].filter(([, files]) => files.length > 1);
if (conflicts.length > 0) {
  console.error('❌ Duplicate Next.js routes detected:');
  for (const [route, files] of conflicts) {
    console.error(`- ${route}`);
    for (const file of files) console.error(`  • ${file}`);
  }
  process.exit(1);
}

console.log('✅ Next route conflict check passed.');
