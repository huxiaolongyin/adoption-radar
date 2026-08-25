import {
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, extname, join, resolve } from "node:path";

const outputDirectory = join(process.cwd(), "build");
const config = JSON.parse(readFileSync(join(process.cwd(), "config.json"), "utf8"));
const basePath = (config.basePath ?? "").replace(/\/$/, "");
const localCdnBase = `${basePath}/_vendor`;
const remoteAssetPattern =
  /https:\/\/cdn\.ui\.porsche\.(?:com|cn)\/porsche-design-system\/[^\s"'`()<>\\]+/g;
const relativeAssetPattern =
  /(["'`])((?:\.\.?\/|\/porsche-design-system\/)[^"'`\\\s?#]+\.(?:css|js|json|map|svg|woff2?|png|ico|webmanifest)(?:[?#][^"'`]*)?)\1/g;
const renderedComponentPattern = /<(p-[a-z][a-z0-9-]+)\b/g;
const componentEntryPattern = /^(p-[a-z][a-z0-9-]+)(?:_\d+)?\.entry\.js$/;
const componentChunkHashPattern =
  /"?([a-z][a-z0-9-]*)"?:"([a-f0-9]{20})"/g;
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

function localOverrideFor(remoteUrl) {
  const pathname = new URL(remoteUrl).pathname;
  if (!pathname.includes("/porsche-design-system/meta-icons/")) return null;
  if (pathname.includes("/manifest")) return `${basePath}/site.webmanifest`;
  if (pathname.includes("/og-image")) {
    return `${basePath}/brand/adoption-radar-og.png`;
  }
  if (pathname.includes("/apple-touch-icon")) {
    return `${basePath}/brand/adoption-radar-icon-192.png`;
  }
  if (pathname.includes("/mstile")) {
    return `${basePath}/brand/adoption-radar-icon-512.png`;
  }
  if (pathname.endsWith(".ico")) return `${basePath}/favicon.ico`;
  if (pathname.includes("/favicon-32x32")) {
    return `${basePath}/brand/adoption-radar-icon-32.png`;
  }
  return null;
}

function localUrlFor(remoteUrl) {
  return (
    localOverrideFor(remoteUrl) ??
    `${localCdnBase}${new URL(remoteUrl).pathname}`
  );
}

function localPathFor(remoteUrl) {
  const pathname = new URL(remoteUrl).pathname.replace(/^\//, "");
  return join(outputDirectory, "_vendor", ...pathname.split("/"));
}

function isPorscheAssetUrl(url) {
  return (
    /^cdn\.ui\.porsche\.(?:com|cn)$/.test(url.hostname) &&
    url.pathname.startsWith("/porsche-design-system/")
  );
}

function filenameFor(remoteUrl) {
  return new URL(remoteUrl).pathname.split("/").at(-1) ?? "";
}

function isComponentLoader(remoteUrl) {
  return /^porsche-design-system(?:\.[a-z0-9]+)*\.js$/i.test(
    filenameFor(remoteUrl)
  );
}

export function renderedComponentNames(content) {
  return new Set(
    [...content.matchAll(new RegExp(renderedComponentPattern.source, "g"))].map(
      (match) => match[1]
    )
  );
}

export function dependenciesToMirror(urls, sourceUrl) {
  if (!isComponentLoader(sourceUrl)) return new Set(urls);

  return new Set(
    [...urls].filter((url) => {
      const filename = filenameFor(url);
      return !componentEntryPattern.test(filename);
    })
  );
}

export function renderedComponentChunkUrls(
  content,
  sourceUrl,
  renderedComponents
) {
  if (!isComponentLoader(sourceUrl)) return new Set();

  const chunkHashes = new Map(
    [...content.matchAll(new RegExp(componentChunkHashPattern.source, "g"))].map(
      (match) => [match[1], match[2]]
    )
  );
  const urls = new Set();

  for (const component of renderedComponents) {
    const chunkName = component.replace(/^p-/, "");
    const hash = chunkHashes.get(chunkName);
    if (!hash) continue;
    urls.add(
      new URL(`./porsche-design-system.${chunkName}.${hash}.js`, sourceUrl).href
    );
  }

  return urls;
}

export function referencedRemoteUrls(content, sourceUrl) {
  const urls = new Set(content.match(remoteAssetPattern) ?? []);
  if (!sourceUrl) return urls;

  const matches = content.matchAll(
    new RegExp(relativeAssetPattern.source, relativeAssetPattern.flags)
  );
  for (const match of matches) {
    if (match[2].includes("${")) continue;
    const resolved = new URL(match[2], sourceUrl);
    if (isPorscheAssetUrl(resolved)) urls.add(resolved.href);
  }
  return urls;
}

export function replaceRemoteUrls(content) {
  return content
    .replace(remoteAssetPattern, (url) => localUrlFor(url))
    .replace(relativeAssetPattern, (match, quote, reference) => {
      if (!reference.startsWith("/porsche-design-system/")) return match;
      return `${quote}${localCdnBase}${reference}${quote}`;
    });
}

async function main() {
  if (!statSync(outputDirectory).isDirectory()) {
    throw new Error(`Build output does not exist: ${outputDirectory}`);
  }

  const buildFiles = walk(outputDirectory);
  const pending = new Set();
  const renderedComponents = new Set();

  for (const path of buildFiles) {
    if (!isTextFile(path)) continue;
    const content = readFileSync(path, "utf8");
    if (extname(path).toLowerCase() === ".html") {
      for (const component of renderedComponentNames(content)) {
        renderedComponents.add(component);
      }
    }
    for (const url of referencedRemoteUrls(content)) {
      if (!localOverrideFor(url)) pending.add(url);
    }
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
          const dependencies = dependenciesToMirror(
            referencedRemoteUrls(content, remoteUrl),
            remoteUrl
          );
          for (const url of renderedComponentChunkUrls(
            content,
            remoteUrl,
            renderedComponents
          )) {
            dependencies.add(url);
          }
          for (const url of dependencies) {
            if (!downloaded.has(url) && !localOverrideFor(url)) pending.add(url);
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
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await main();
}
