import assert from "node:assert/strict";
import test from "node:test";

import {
  dependenciesToMirror,
  referencedRemoteUrls,
  renderedComponentNames,
  replaceRemoteUrls,
} from "./self-host-pds-assets.mjs";

test("discovers relative Porsche Design System dependencies", () => {
  const sourceUrl =
    "https://cdn.ui.porsche.com/porsche-design-system/components/main.js";
  const content = `
    import "./p-link-pure.entry.js";
    import "../icons/external.svg";
    import "https://cdn.ui.porsche.com/porsche-design-system/styles/font.woff2";
    import "./not-an-asset";
  `;

  assert.deepEqual(
    [...referencedRemoteUrls(content, sourceUrl)].sort(),
    [
      "https://cdn.ui.porsche.com/porsche-design-system/components/p-link-pure.entry.js",
      "https://cdn.ui.porsche.com/porsche-design-system/icons/external.svg",
      "https://cdn.ui.porsche.com/porsche-design-system/styles/font.woff2",
    ]
  );
});

test("ignores relative dependencies outside the Porsche asset tree", () => {
  const sourceUrl = "https://example.com/components/main.js";

  assert.deepEqual(
    [...referencedRemoteUrls('import "./p-link-pure.entry.js";', sourceUrl)],
    []
  );
});

test("discovers Porsche components rendered in static HTML", () => {
  assert.deepEqual(
    [...renderedComponentNames("<p-link-pure></p-link-pure><p-icon />")],
    ["p-link-pure", "p-icon"]
  );
});

test("mirrors only rendered component entries from the component loader", () => {
  const sourceUrl =
    "https://cdn.ui.porsche.com/porsche-design-system/components/porsche-design-system.v4.6.0.js";
  const dependencies = new Set([
    "https://cdn.ui.porsche.com/porsche-design-system/components/p-link-pure.entry.js",
    "https://cdn.ui.porsche.com/porsche-design-system/components/p-input-tel.entry.js",
    "https://cdn.ui.porsche.com/porsche-design-system/components/p-text-list_2.entry.js",
    "https://cdn.ui.porsche.com/porsche-design-system/components/chunk-runtime.js",
  ]);

  assert.deepEqual(
    [...dependenciesToMirror(dependencies, sourceUrl, new Set(["p-link-pure"]))],
    [
      "https://cdn.ui.porsche.com/porsche-design-system/components/p-link-pure.entry.js",
      "https://cdn.ui.porsche.com/porsche-design-system/components/chunk-runtime.js",
    ]
  );
});

test("keeps transitive dependencies outside the component loader", () => {
  const dependency =
    "https://cdn.ui.porsche.com/porsche-design-system/components/chunk-runtime.js";

  assert.deepEqual(
    [
      ...dependenciesToMirror(
        new Set([dependency]),
        "https://cdn.ui.porsche.com/porsche-design-system/components/p-link-pure.entry.js",
        new Set()
      ),
    ],
    [dependency]
  );
});

test("rewrites root-relative Porsche asset references to the local vendor path", () => {
  assert.equal(
    replaceRemoteUrls(
      'import "/porsche-design-system/components/p-link-pure.entry.js";'
    ),
    'import "/adoption-radar/_vendor/porsche-design-system/components/p-link-pure.entry.js";'
  );
});
