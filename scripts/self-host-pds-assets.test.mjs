import assert from "node:assert/strict";
import test from "node:test";

import {
  referencedRemoteUrls,
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

test("rewrites root-relative Porsche asset references to the local vendor path", () => {
  assert.equal(
    replaceRemoteUrls(
      'import "/porsche-design-system/components/p-link-pure.entry.js";'
    ),
    'import "/adoption-radar/_vendor/porsche-design-system/components/p-link-pure.entry.js";'
  );
});
