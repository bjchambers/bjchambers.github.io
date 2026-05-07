import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const siteDir = path.join(root, 'site');

const staticFiles = ['index.html', 'styles.css', 'profile.jpg', 'og-image.jpg'];

await fs.rm(siteDir, { recursive: true, force: true });
await fs.mkdir(siteDir, { recursive: true });

for (const f of staticFiles) {
  await fs.copyFile(path.join(root, f), path.join(siteDir, f));
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.goto(`file://${path.join(siteDir, 'index.html')}`, { waitUntil: 'networkidle' });
  await page.pdf({
    path: path.join(siteDir, 'ben-chambers-resume.pdf'),
    format: 'Letter',
    printBackground: true,
    margin: { top: 0, bottom: 0, left: 0, right: 0 },
  });
} finally {
  await browser.close();
}

console.log(`built site/ (${staticFiles.length} static files + resume PDF)`);
