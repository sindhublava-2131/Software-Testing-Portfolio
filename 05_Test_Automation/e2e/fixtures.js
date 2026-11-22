import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.resolve(__dirname, '../../07_Screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

export async function shot(page, tcId, step) {
  const filePath = path.join(screenshotsDir, `${tcId}_${step}.png`);
  await page.screenshot({ path: filePath, fullPage: true });
  return filePath;
}

export async function stubCloudinary(page) {
  await page.route('https://api.cloudinary.com/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        public_id: 'auction_system/sample_camera',
        secure_url: 'https://res.cloudinary.com/demo/image/upload/sample.jpg'
      })
    });
  });
}

export function attachConsoleGuard(page, errorsArray) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errorsArray.push(`Console error: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => {
    errorsArray.push(`Page error: ${err.message}`);
  });
}
