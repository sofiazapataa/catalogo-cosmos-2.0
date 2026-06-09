/**
 * compress-images.js
 * Comprime todas las imágenes de src/assets/images en su lugar.
 * Ejecutar con: node scripts/compress-images.js
 *
 * JPEG/JPG → calidad 82, máximo 1400px de ancho, progresivo
 * PNG      → optimización sin pérdida (preserva transparencia)
 */

import sharp from "sharp";
import { readdir, stat, rename, writeFile } from "fs/promises";
import { join, extname, basename } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = join(__dirname, "../src/assets/images");
const MAX_WIDTH = 1400;
const JPEG_QUALITY = 82;

async function compressImage(filePath) {
  const ext = extname(filePath).toLowerCase();
  const originalStat = await stat(filePath);
  const originalSize = originalStat.size;

  const tmpPath = filePath + ".tmp";

  try {
    const img = sharp(filePath);
    const meta = await img.metadata();

    // Solo redimensionar si es más ancho que MAX_WIDTH
    const needsResize = meta.width && meta.width > MAX_WIDTH;

    if (ext === ".jpg" || ext === ".jpeg") {
      await img
        .rotate() // respeta EXIF orientation
        .resize(needsResize ? { width: MAX_WIDTH, withoutEnlargement: true } : undefined)
        .jpeg({ quality: JPEG_QUALITY, progressive: true, mozjpeg: true })
        .toFile(tmpPath);
    } else if (ext === ".png") {
      await img
        .resize(needsResize ? { width: MAX_WIDTH, withoutEnlargement: true } : undefined)
        .png({ compressionLevel: 9, palette: true })
        .toFile(tmpPath);
    } else {
      return null; // skip otros formatos
    }

    const newStat = await stat(tmpPath);
    const newSize = newStat.size;

    if (newSize < originalSize) {
      // Solo reemplazar si el archivo comprimido es más pequeño
      await rename(tmpPath, filePath);
      return {
        file: basename(filePath),
        before: (originalSize / 1024).toFixed(0) + "KB",
        after: (newSize / 1024).toFixed(0) + "KB",
        saved: ((1 - newSize / originalSize) * 100).toFixed(0) + "%",
      };
    } else {
      // Si no mejoró, borrar el tmp
      const { unlink } = await import("fs/promises");
      await unlink(tmpPath);
      return {
        file: basename(filePath),
        before: (originalSize / 1024).toFixed(0) + "KB",
        after: (originalSize / 1024).toFixed(0) + "KB",
        saved: "0% (ya optimizada)",
      };
    }
  } catch (err) {
    try {
      const { unlink } = await import("fs/promises");
      await unlink(tmpPath).catch(() => {});
    } catch {}
    throw err;
  }
}

async function main() {
  const files = await readdir(IMAGES_DIR);
  const imageFiles = files
    .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
    .map((f) => join(IMAGES_DIR, f));

  console.log(`\n🖼️  Comprimiendo ${imageFiles.length} imágenes...\n`);

  const results = [];
  for (const file of imageFiles) {
    try {
      const result = await compressImage(file);
      if (result) {
        results.push(result);
        const emoji = result.saved.startsWith("0") ? "  ─" : "  ✓";
        console.log(`${emoji} ${result.file.padEnd(40)} ${result.before.padStart(8)} → ${result.after.padStart(8)}  (${result.saved})`);
      }
    } catch (err) {
      console.error(`  ✗ Error en ${basename(file)}: ${err.message}`);
    }
  }

  const totalBefore = results.reduce((acc, r) => acc + parseInt(r.before), 0);
  const totalAfter = results.reduce((acc, r) => {
    const kb = parseInt(r.after);
    return acc + (isNaN(kb) ? 0 : kb);
  }, 0);

  console.log(`\n${"─".repeat(70)}`);
  console.log(`Total antes:  ${(totalBefore / 1024).toFixed(1)} MB`);
  console.log(`Total después: ${(totalAfter / 1024).toFixed(1)} MB`);
  console.log(`Ahorro total:  ${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%`);
  console.log(`\n✅ Listo. Hacé git add src/assets && git commit para guardar los cambios.\n`);
}

main().catch(console.error);
