import assert from "node:assert/strict";
import test from "node:test";

import {
  dependenciesToMirror,
  referencedRemoteUrls,
  renderedComponentChunkUrls,
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

test("ignores runtime-generated component paths", () => {
  const sourceUrl =
    "https://cdn.ui.porsche.com/porsche-design-system/components/main.js";

  assert.deepEqual(
    [...referencedRemoteUrls('import(`./${i}.entry.js`);', sourceUrl)],
    []
  );
});

test("discovers Porsche components rendered in static HTML", () => {
  assert.deepEqual(
    [...renderedComponentNames("<p-link-pure></p-link-pure><p-icon />")],
    ["p-link-pure", "p-icon"]
  );
});

test("ignores logical component entry keys from the component loader", () => {
  const sourceUrl =
    "https://cdn.ui.porsche.com/porsche-design-system/components/porsche-design-system.v4.6.0.js";
  const dependencies = new Set([
    "https://cdn.ui.porsche.com/porsche-design-system/components/p-link-pure.entry.js",
    "https://cdn.ui.porsche.com/porsche-design-system/components/p-input-tel.entry.js",
    "https://cdn.ui.porsche.com/porsche-design-system/components/p-text-list_2.entry.js",
    "https://cdn.ui.porsche.com/porsche-design-system/components/chunk-runtime.js",
  ]);

  assert.deepEqual(
    [...dependenciesToMirror(dependencies, sourceUrl)],
    [
      "https://cdn.ui.porsche.com/porsche-design-system/components/chunk-runtime.js",
    ]
  );
});

test("resolves rendered components to their hashed runtime chunks", () => {
  const sourceUrl =
    "https://cdn.ui.porsche.com/porsche-design-system/components/porsche-design-system.v4.6.0.hash.js";
  const content =
    'n.u=e=>"porsche-design-system."+e+"."+{link:"45070c571a2b36568a92","link-pure":"690266e16861ddd17aae","input-tel":"9227be88482d2bb11775"}[e]+".js"';

  assert.deepEqual(
    [
      ...renderedComponentChunkUrls(
        content,
        sourceUrl,
        new Set(["p-link", "p-link-pure", "p-unknown"])
      ),
    ],
    [
      "https://cdn.ui.porsche.com/porsche-design-system/components/porsche-design-system.link.45070c571a2b36568a92.js",
      "https://cdn.ui.porsche.com/porsche-design-system/components/porsche-design-system.link-pure.690266e16861ddd17aae.js",
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
        "https://cdn.ui.porsche.com/porsche-design-system/components/p-link-pure.entry.js"
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
