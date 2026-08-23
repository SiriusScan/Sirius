import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CollapsibleScanControls } from "./CollapsibleScanControls";

const targetInput = React.createElement(
  "span",
  { "data-testid": "target-input" },
  "192.168.123.0/24",
);

const collapsed = renderToStaticMarkup(
  <CollapsibleScanControls collapsed hasScanResult>
    {targetInput}
  </CollapsibleScanControls>,
);

assert.match(collapsed, /hidden=""/);
assert.match(collapsed, /data-testid="target-input"/);
assert.match(collapsed, /192\.168\.123\.0\/24/);

const expanded = renderToStaticMarkup(
  <CollapsibleScanControls collapsed={false} hasScanResult>
    {targetInput}
  </CollapsibleScanControls>,
);

assert.doesNotMatch(expanded, /hidden=""/);
assert.match(expanded, /data-testid="target-input"/);

console.log("Collapsible scan controls regression tests passed");
