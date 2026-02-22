/**
 * PWAアイコン生成スクリプト
 *
 * 使い方:
 *   npm install sharp --save-dev
 *   node scripts/generate-icons.mjs
 *
 * public/icon.svg → public/icon-192.png, public/icon-512.png を生成
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function generate() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('sharp がインストールされていません。');
    console.error('  npm install sharp --save-dev');
    console.error('を実行してから再度お試しください。');
    process.exit(1);
  }

  const svgBuffer = readFileSync(join(root, 'public', 'icon.svg'));

  for (const size of [192, 512]) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(join(root, 'public', `icon-${size}.png`));
    console.log(`✓ public/icon-${size}.png を生成しました`);
  }
}

generate();
