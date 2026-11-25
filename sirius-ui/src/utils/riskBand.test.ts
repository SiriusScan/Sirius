import assert from "node:assert/strict";
import { riskBand, riskBandLabel } from "./riskBand";

const cases: Array<[number | null | undefined, ReturnType<typeof riskBand>]> = [
  [10, "critical"],
  [9.8, "critical"],
  [9, "critical"],
  [8.99, "high"],
  [8.1, "high"],
  [7, "high"],
  [6.9, "medium"],
  [5, "medium"],
  [4, "medium"],
  [3.99, "low"],
  [0.1, "low"],
  [0, "none"],
  [-1, "none"],
  [Number.NaN, "none"],
  [Number.POSITIVE_INFINITY, "none"],
  [null, "none"],
  [undefined, "none"],
];
for (const [score, band] of cases) {
  assert.equal(riskBand(score), band, `riskBand(${String(score)})`);
}

assert.equal(riskBandLabel("high"), "High");
assert.equal(riskBandLabel("critical"), "Critical");
assert.equal(riskBandLabel("none"), "None");

console.log("riskBand: " + cases.length + " cases pass");
