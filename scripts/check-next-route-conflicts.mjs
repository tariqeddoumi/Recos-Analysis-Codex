import { existsSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';

const appDir = join(process.cwd(), 'app');
const routeFiles = [];
const legacyImportExcelPage = join(appDir, '(protected)', 'import-excel', 'page.tsx');
const canonicalImportExcelPage = join(appDir, 'import-excel', 'page.tsx');

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

function printConflictHelp() {
  console.error('');
  console.error('How to fix:');
  console.error('- Keep exactly one page for each public URL after removing route-group folders like `(protected)`.');
  console.error('- For Import Excel, keep `app/import-excel/page.tsx` and remove `app/(protected)/import-excel/page.tsx`.');
  console.error('- Commit the deletion; Vercel builds from Git and will fail if both files are present in the deployed commit.');
}

function removeEmptyDirectory(dir) {
  try {
    rmSync(dir, { recursive: false });
  } catch {
    // Directory is not empty or already absent; nothing else to do.
  }
}

if (existsSync(legacyImportExcelPage) && existsSync(canonicalImportExcelPage)) {
  console.warn('⚠️ Legacy Import Excel route conflict detected before Next.js build:');
  console.warn(`  • ${relative(process.cwd(), legacyImportExcelPage)}`);
  console.warn(`  • ${relative(process.cwd(), canonicalImportExcelPage)}`);
  console.warn('Auto-removing the legacy route from the build workspace so Vercel can continue.');
  console.warn('Please keep the deletion committed in Git; this fallback exists only to protect cached/merged deployments.');
  rmSync(legacyImportExcelPage, { force: true });
  removeEmptyDirectory(dirname(legacyImportExcelPage));
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
  printConflictHelp();
  process.exit(1);
}

console.log('✅ Next route conflict check passed.');
