import { createRequire } from "node:module";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import sharp from "sharp";

const require = createRequire(import.meta.url);
const opentypeModule = require("@shuding/opentype.js");
const opentype = opentypeModule.default ?? opentypeModule;

const root = process.cwd();
const cobalt = "#315CF5";
const ink = "#141820";
const white = "#FFFFFF";
const fontWoff = join(
  root,
  "node_modules",
  "@fontsource",
  "manrope",
  "files",
  "manrope-latin-600-normal.woff"
);
const fontWoff2 = join(
  root,
  "node_modules",
  "@fontsource",
  "manrope",
  "files",
  "manrope-latin-600-normal.woff2"
);
const fontLicense = join(
  root,
  "node_modules",
  "@fontsource",
  "manrope",
  "LICENSE"
);

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function symbolGeometry(color) {
  return `
  <g fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round">
    <circle cx="29" cy="35" r="23" stroke-dasharray="118 27" transform="rotate(-12 29 35)"/>
    <circle cx="29" cy="35" r="13" stroke-dasharray="64 18" transform="rotate(-6 29 35)"/>
  </g>
  <circle cx="42" cy="22" r="4.5" fill="${color}"/>`;
}

function markSvg(color, title = "Adoption Radar") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="${title}">
  <title>${title}</title>${symbolGeometry(color)}
</svg>
`;
}

function iconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="Adoption Radar">
  <title>Adoption Radar</title>
  <rect width="64" height="64" rx="14" fill="${cobalt}"/>
  <g transform="translate(6 6) scale(0.8125)">${symbolGeometry(white)}</g>
</svg>
`;
}

const fontBytes = readFileSync(fontWoff);
const fontBuffer = fontBytes.buffer.slice(
  fontBytes.byteOffset,
  fontBytes.byteOffset + fontBytes.byteLength
);
const font = opentype.parse(fontBuffer);

function lockupSvg(markColor, textColor, title) {
  const wordmark = font
    .getPath("Adoption Radar", 76, 46, 30)
    .toPathData(2);

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 306 64" role="img" aria-label="Adoption Radar">
  <title>${title}</title>
  ${symbolGeometry(markColor)}
  <path d="${wordmark}" fill="${textColor}"/>
</svg>
`;
}

function pngIco(images) {
  const header = Buffer.alloc(6 + images.length * 16);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  let dataOffset = header.length;
  images.forEach(({ size, png }, index) => {
    const entryOffset = 6 + index * 16;
    header.writeUInt8(size === 256 ? 0 : size, entryOffset);
    header.writeUInt8(size === 256 ? 0 : size, entryOffset + 1);
    header.writeUInt8(0, entryOffset + 2);
    header.writeUInt8(0, entryOffset + 3);
    header.writeUInt16LE(1, entryOffset + 4);
    header.writeUInt16LE(32, entryOffset + 6);
    header.writeUInt32LE(png.length, entryOffset + 8);
    header.writeUInt32LE(dataOffset, entryOffset + 12);
    dataOffset += png.length;
  });

  return Buffer.concat([header, ...images.map(({ png }) => png)]);
}

const brandDirectory = join(root, "public", "brand");
const fontDirectory = join(root, "public", "fonts");
const themeDirectory = join(root, "themes", "neutral");
const icon = iconSvg();
const lockupLight = lockupSvg(cobalt, ink, "Adoption Radar — light");
const lockupDark = lockupSvg(white, white, "Adoption Radar — dark");

write(join(brandDirectory, "adoption-radar-mark.svg"), markSvg(cobalt));
write(join(brandDirectory, "adoption-radar-mark-ink.svg"), markSvg(ink));
write(join(brandDirectory, "adoption-radar-mark-white.svg"), markSvg(white));
write(join(brandDirectory, "adoption-radar-icon.svg"), icon);
write(join(brandDirectory, "adoption-radar-lockup-light.svg"), lockupLight);
write(join(brandDirectory, "adoption-radar-lockup-dark.svg"), lockupDark);
write(join(root, "public", "favicon.svg"), icon);

write(join(themeDirectory, "header-logo-light.svg"), markSvg(cobalt));
write(join(themeDirectory, "header-logo-dark.svg"), markSvg(white));
write(join(themeDirectory, "footer-logo-light.svg"), lockupLight);
write(join(themeDirectory, "footer-logo-dark.svg"), lockupDark);

mkdirSync(fontDirectory, { recursive: true });
copyFileSync(fontWoff2, join(fontDirectory, "manrope-latin-600-normal.woff2"));
copyFileSync(fontLicense, join(fontDirectory, "manrope-LICENSE.txt"));

const iconPngs = [];

for (const size of [16, 32, 192, 512]) {
  const png = await sharp(Buffer.from(icon)).resize(size, size).png().toBuffer();
  writeFileSync(
    join(brandDirectory, `adoption-radar-icon-${size}.png`),
    png
  );
  if (size <= 32) iconPngs.push({ size, png });
}

writeFileSync(join(root, "public", "favicon.ico"), pngIco(iconPngs));

const ogWordmark = font
  .getPath("Adoption Radar", 360, 340, 72)
  .toPathData(2);
const ogImage = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F7F8FA"/>
  <circle cx="1040" cy="-20" r="320" fill="#315CF5" opacity="0.06"/>
  <circle cx="110" cy="650" r="260" fill="#315CF5" opacity="0.04"/>
  <g transform="translate(130 210) scale(3)">${symbolGeometry(cobalt)}</g>
  <path d="${ogWordmark}" fill="${ink}"/>
</svg>`;
await sharp(Buffer.from(ogImage))
  .png()
  .toFile(join(brandDirectory, "adoption-radar-og.png"));

console.log("[brand] Generated Adoption Radar logo, icon, favicon, and font assets.");
