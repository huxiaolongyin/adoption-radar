import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const target = join(
  process.cwd(),
  "node_modules",
  "@porscheofficial",
  "porschedigital-technology-radar",
  "scripts",
  "buildThemes.ts"
);

if (!existsSync(target)) {
  console.log("[postinstall] Technology Radar source not present; skipping path compatibility patch.");
  process.exit(0);
}

const source = readFileSync(target, "utf8");
const windowsUnsafe = "path.dirname(new URL(import.meta.url).pathname)";
const crossPlatform = "path.dirname(fileURLToPath(import.meta.url))";

if (source.includes(crossPlatform)) {
  console.log("[postinstall] Technology Radar path handling is already cross-platform.");
  process.exit(0);
}

if (!source.includes(windowsUnsafe)) {
  console.log("[postinstall] Technology Radar path implementation changed; no patch required.");
  process.exit(0);
}

writeFileSync(target, source.replace(windowsUnsafe, crossPlatform), "utf8");
console.log("[postinstall] Applied Technology Radar Windows path compatibility patch.");
