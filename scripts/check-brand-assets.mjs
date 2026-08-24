import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const requiredFiles = [
  "CONTEXT.md",
  "docs/brand/README.md",
  "public/favicon.svg",
  "public/favicon.ico",
  "public/site.webmanifest",
  "public/brand/adoption-radar-mark.svg",
  "public/brand/adoption-radar-mark-ink.svg",
  "public/brand/adoption-radar-mark-white.svg",
  "public/brand/adoption-radar-icon.svg",
  "public/brand/adoption-radar-icon-16.png",
  "public/brand/adoption-radar-icon-32.png",
  "public/brand/adoption-radar-icon-192.png",
  "public/brand/adoption-radar-icon-512.png",
  "public/brand/adoption-radar-lockup-light.svg",
  "public/brand/adoption-radar-lockup-dark.svg",
  "public/brand/adoption-radar-og.png",
  "public/fonts/manrope-latin-600-normal.woff2",
  "public/fonts/manrope-LICENSE.txt",
  "themes/neutral/header-logo-light.svg",
  "themes/neutral/header-logo-dark.svg",
  "themes/neutral/footer-logo-light.svg",
  "themes/neutral/footer-logo-dark.svg",
];

const missing = requiredFiles.filter((path) => !existsSync(join(root, path)));
if (missing.length > 0) {
  throw new Error(`Missing brand assets: ${missing.join(", ")}`);
}

const mark = readFileSync(
  join(root, "public", "brand", "adoption-radar-mark.svg"),
  "utf8"
);
if (
  !mark.includes('r="23"') ||
  !mark.includes('r="13"') ||
  !mark.includes('r="4.5"') ||
  (mark.match(/<circle/g) ?? []).length !== 3
) {
  throw new Error("Brand mark must contain exactly two tracks and one node.");
}

for (const lockup of ["light", "dark"]) {
  const svg = readFileSync(
    join(root, "public", "brand", `adoption-radar-lockup-${lockup}.svg`),
    "utf8"
  );
  if (svg.includes("<text")) {
    throw new Error(`${lockup} lockup must use outlined wordmark paths.`);
  }
}

const manifest = readFileSync(
  join(root, "themes", "neutral", "manifest.jsonc"),
  "utf8"
);
for (const expected of [
  '"headerLogoFile"',
  '"footerLogoFile"',
  '"#315CF5"',
]) {
  if (!manifest.includes(expected)) {
    throw new Error(`Theme manifest is missing ${expected}.`);
  }
}

const favicon = readFileSync(join(root, "public", "favicon.ico"));
if (
  favicon.readUInt16LE(0) !== 0 ||
  favicon.readUInt16LE(2) !== 1 ||
  favicon.readUInt16LE(4) !== 2
) {
  throw new Error("favicon.ico must contain the 16px and 32px icon variants.");
}

const webManifest = JSON.parse(
  readFileSync(join(root, "public", "site.webmanifest"), "utf8")
);
if (
  webManifest.name !== "Adoption Radar" ||
  webManifest.icons?.length !== 2
) {
  throw new Error("PWA manifest must use the Adoption Radar identity.");
}

for (const size of [16, 32, 192, 512]) {
  const metadata = await sharp(
    join(root, "public", "brand", `adoption-radar-icon-${size}.png`)
  ).metadata();
  if (metadata.width !== size || metadata.height !== size) {
    throw new Error(`Expected ${size}x${size} brand icon.`);
  }
}

const textualBrandFiles = requiredFiles.filter((path) =>
  /\.(?:md|svg|webmanifest)$/.test(path)
);
const leakedPorscheBrand = textualBrandFiles.filter((path) =>
  /porsche-(?:crest|wordmark)/i.test(readFileSync(join(root, path), "utf8"))
);
if (leakedPorscheBrand.length > 0) {
  throw new Error(
    `Porsche visual branding leaked into: ${leakedPorscheBrand.join(", ")}`
  );
}

console.log("[brand] Assets, geometry, typography, theme mapping, and sizes are valid.");
