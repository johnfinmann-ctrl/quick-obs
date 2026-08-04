/**
 * Genererer PNG-ikoner lokalt fra det eksisterende neutrale SVG-ikon.
 *
 * Bruger kun det lokale "sharp"-bibliotek - INGEN eksterne tjenester,
 * ingen download af et andet/nyt ikon. SVG'erne i public/icons/ er
 * kilden; dette script rasteriserer dem blot til de PNG-stoerrelser,
 * som manifest.webmanifest og index.html refererer til.
 *
 * Koer: node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.resolve(__dirname, "../public/icons");

const RENDER_DENSITY = 384; // hoej DPI ved SVG->PNG-rasterisering for skarpe kanter

async function generate() {
  const base = readFileSync(path.join(ICONS_DIR, "icon.svg"));
  const maskable = readFileSync(path.join(ICONS_DIR, "icon-maskable.svg"));

  await sharp(base, { density: RENDER_DENSITY })
    .resize(180, 180)
    .png()
    .toFile(path.join(ICONS_DIR, "apple-touch-icon.png"));

  await sharp(base, { density: RENDER_DENSITY })
    .resize(192, 192)
    .png()
    .toFile(path.join(ICONS_DIR, "icon-192.png"));

  await sharp(base, { density: RENDER_DENSITY })
    .resize(512, 512)
    .png()
    .toFile(path.join(ICONS_DIR, "icon-512.png"));

  await sharp(maskable, { density: RENDER_DENSITY })
    .resize(512, 512)
    .png()
    .toFile(path.join(ICONS_DIR, "icon-512-maskable.png"));

  console.log("Ikoner genereret i", ICONS_DIR);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
