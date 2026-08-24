import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join } from "node:path";

const outputDirectory = join(process.cwd(), "build");
const config = JSON.parse(readFileSync(join(process.cwd(), "config.json"), "utf8"));
const basePath = (config.basePath ?? "").replace(/\/$/, "");
const localCdnBase = `${basePath}/_vendor`;
const remoteAssetPattern =
  /https:\/\/cdn\.ui\.porsche\.(?:com|cn)\/porsche-design-system\/[^\s"'`()<>\\]+/g;
const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".map",
  ".svg",
  ".txt",
  ".webmanifest",
  ".xml",
]);

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? walk(path) : [path];
  });
}

function isTextFile(path, contentType = "") {
  return (
    textExtensions.has(extname(path).toLowerCase()) ||
    /(?:text|javascript|json|svg|xml)/i.test(contentType)
  );
}

function localUrlFor(remoteUrl) {
  return `${localCdnBase}${new URL(remoteUrl).pathname}`;
}

function localPathFor(remoteUrl) {
  const pathname = new URL(remoteUrl).pathname.replace(/^\//, "");
  return join(outputDirectory, "_vendor", ...pathname.split("/"));
}

function replaceRemoteUrls(content) {
  return content.replace(remoteAssetPattern, (url) => localUrlFor(url));
}

if (!statSync(outputDirectory).isDirectory()) {
  throw new Error(`Build output does not exist: ${outputDirectory}`);
}

const buildFiles = walk(outputDirectory);
const pending = new Set();

for (const path of buildFiles) {
  if (!isTextFile(path)) continue;
  const content = readFileSync(path, "utf8");
  for (const url of content.match(remoteAssetPattern) ?? []) pending.add(url);
}

const downloaded = new Set();

while (pending.size > 0) {
  const batch = [...pending].filter((url) => !downloaded.has(url));
  pending.clear();

  await Promise.all(
    batch.map(async (remoteUrl) => {
      const response = await fetch(remoteUrl);
      if (!response.ok) {
        throw new Error(`Unable to download ${remoteUrl}: HTTP ${response.status}`);
      }

      const path = localPathFor(remoteUrl);
      const contentType = response.headers.get("content-type") ?? "";
      const bytes = Buffer.from(await response.arrayBuffer());
      mkdirSync(dirname(path), { recursive: true });

      if (isTextFile(path, contentType)) {
        const content = bytes.toString("utf8");
        for (const url of content.match(remoteAssetPattern) ?? []) {
          if (!downloaded.has(url)) pending.add(url);
        }
        writeFileSync(path, replaceRemoteUrls(content), "utf8");
      } else {
        writeFileSync(path, bytes);
      }

      downloaded.add(remoteUrl);
    })
  );
}

for (const path of buildFiles) {
  if (!isTextFile(path)) continue;
  const content = readFileSync(path, "utf8");
  writeFileSync(path, replaceRemoteUrls(content), "utf8");
}

const remaining = walk(outputDirectory).filter((path) => {
  if (!isTextFile(path)) return false;
  remoteAssetPattern.lastIndex = 0;
  return remoteAssetPattern.test(readFileSync(path, "utf8"));
});

if (remaining.length > 0) {
  throw new Error(`Porsche CDN references remain in: ${remaining.join(", ")}`);
}

console.log(
  `[self-host] Mirrored ${downloaded.size} Porsche Design System assets under ${localCdnBase}.`
);
