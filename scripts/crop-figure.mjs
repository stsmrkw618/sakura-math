/**
 * 図形切り出しスクリプト
 * テスト写真から図形部分を切り出してPNG画像として保存する。
 *
 * 使い方:
 *   node scripts/crop-figure.mjs <source> <problemId> <left> <top> <width> <height>
 *
 * 例:
 *   node scripts/crop-figure.mjs problem/20260222_131729.jpg 2026-02-005 2120 1430 880 720
 *
 * 引数:
 *   source    - 元画像のパス（EXIF回転は自動適用）
 *   problemId - 問題ID（出力ファイル名に使用）
 *   left      - 切り出し左端のX座標
 *   top       - 切り出し上端のY座標
 *   width     - 切り出し幅
 *   height    - 切り出し高さ
 *
 * 出力:
 *   public/figures/{problemId}.png
 *
 * 座標の確認方法:
 *   1. まず --preview で縮小版を出力してレイアウトを確認:
 *      node scripts/crop-figure.mjs <source> --preview
 *   2. プレビュー画像で座標を概算し、フル解像度に変換して切り出す
 */

import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('使い方:');
    console.log('  プレビュー: node scripts/crop-figure.mjs <source> --preview');
    console.log('  切り出し:   node scripts/crop-figure.mjs <source> <problemId> <left> <top> <width> <height>');
    console.log('');
    console.log('例:');
    console.log('  node scripts/crop-figure.mjs problem/20260222_131729.jpg --preview');
    console.log('  node scripts/crop-figure.mjs problem/20260222_131729.jpg 2026-02-005 2120 1430 880 720');
    process.exit(1);
  }

  const sourcePath = path.resolve(projectRoot, args[0]);

  // プレビューモード
  if (args[1] === '--preview') {
    const meta = await sharp(sourcePath).rotate().metadata();
    console.log(`元画像サイズ (回転後): ${meta.width} x ${meta.height}`);

    const previewPath = path.resolve(projectRoot, 'public/figures/_preview.jpg');
    await sharp(sourcePath)
      .rotate()
      .resize(750, null, { fit: 'inside' })
      .toFile(previewPath);

    const scale = 750 / meta.width;
    console.log(`プレビュー保存: ${previewPath}`);
    console.log(`スケール: ${scale.toFixed(4)}x (座標を ${(1/scale).toFixed(1)}倍 でフル解像度に変換)`);
    return;
  }

  // 切り出しモード
  if (args.length < 6) {
    console.error('エラー: 座標が不足しています。 <source> <problemId> <left> <top> <width> <height>');
    process.exit(1);
  }

  const [, problemId, leftStr, topStr, widthStr, heightStr] = args;
  const left = parseInt(leftStr);
  const top = parseInt(topStr);
  const width = parseInt(widthStr);
  const height = parseInt(heightStr);

  const outputPath = path.resolve(projectRoot, `public/figures/${problemId}.png`);

  await sharp(sourcePath)
    .rotate()
    .extract({ left, top, width, height })
    .png()
    .toFile(outputPath);

  console.log(`✓ 切り出し完了: ${outputPath}`);
  console.log(`  サイズ: ${width} x ${height}`);
  console.log(`  問題ID: ${problemId}`);
  console.log('');
  console.log('problems.json の figure フィールド:');
  console.log(JSON.stringify({
    type: 'image',
    path: `figures/${problemId}.png`,
    description: '（図の説明を記入）'
  }, null, 2));
}

main().catch((err) => {
  console.error('エラー:', err.message);
  process.exit(1);
});
