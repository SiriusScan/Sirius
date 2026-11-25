import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { Z_INDEX } from "./layers";

// The Tailwind classes (z-header, z-dropdown, z-overlay, z-toast) and the
// numbers used inline must be one scale, in the config Tailwind loads.
// Tailwind 3 picks the first of these that exists, so tailwind.config.js
// wins over tailwind.config.ts.
const root = path.resolve(__dirname, "../../..");
const candidates = ["tailwind.config.js", "tailwind.config.cjs", "tailwind.config.mjs", "tailwind.config.ts"];
const expected = {
  header: String(Z_INDEX.header),
  dropdown: String(Z_INDEX.dropdown),
  overlay: String(Z_INDEX.overlay),
  toast: String(Z_INDEX.toast),
};

type TailwindConfig = { theme?: { extend?: { zIndex?: Record<string, string> } } };
type ConfigModule = TailwindConfig & { default?: TailwindConfig };
function zIndexOf(file: string): Record<string, string> | undefined {
  const full = path.join(root, file);
  let mod: ConfigModule;
  if (file.endsWith(".ts")) {
    mod = createRequire(__filename)(full) as ConfigModule;
  } else {
    // Evaluate CommonJS configs directly: tsx would resolve "x.js" to a
    // sibling "x.ts" and test the wrong file.
    const cjs = { exports: {} as ConfigModule };
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function("module", "exports", "require", readFileSync(full, "utf8"))(
      cjs,
      cjs.exports,
      createRequire(full),
    );
    mod = cjs.exports;
  }
  return (mod.default ?? mod).theme?.extend?.zIndex;
}

const present = candidates.filter((file) => existsSync(path.join(root, file)));
assert.ok(present.length > 0, "no Tailwind config found");
const effective = present[0]!;

for (const file of present) {
  assert.deepEqual(
    zIndexOf(file),
    expected,
    `${file}${file === effective ? " (the config Tailwind loads)" : ""} needs theme.extend.zIndex ` +
      `{ header: "30", dropdown: "40", overlay: "50", toast: "60" }; without it z-header, ` +
      `z-overlay and friends generate no CSS`,
  );
}
assert.ok(Z_INDEX.header < Z_INDEX.dropdown);
assert.ok(Z_INDEX.dropdown < Z_INDEX.overlay);
assert.ok(Z_INDEX.overlay < Z_INDEX.toast);

console.log(`layers: z-index scale matches ${present.join(", ")}`);
