# Deployment metadata 1.0.0

The release manifest records the UI/API container ports and production Dockerfile
stage names from this source commit. `api_module_build_tag` identifies the Go
build constraint excluding Community's default composition entry point. A build
using that tag must supply its own `buildModuleRegistry` implementation using
the public module registry. This field does not claim the stock Dockerfile enables
that tag or that any downstream extension has passed acceptance.

UI contributions use the documented `src/ui/extensions/registered.ts`,
`src/server/extensions/registered.ts` and
`src/server/extensions/registered-routers.ts` slots. Downstream composition must
keep proprietary inputs outside the public checkout.

## Maintenance release lane

`release/1.2.x` starts at `v1.2.5` and carries backend/release-tooling fixes.
CI uses separate `maintenance-1.2` staging image tags, then records immutable
`sha-<commit>` digests. Main's staging tags and canary dispatch stay on main.
The canonical publish workflow still runs on main with its existing signing
identity. For a tag on the maintenance lane it resolves the successful push
inventory for that branch and requires both v1.2.5 ancestry and an identical
`sirius-ui` tree. Maintenance releases are published with `--latest=false`, leaving the main
release channel unchanged. Existing published tags/releases remain write-once.

## Offline Scribe evidence review

Use the existing Core release manifest and build inventory from the reviewed
release source. Supply the raw engine OCI index bytes from the inventory's
digest reference. Preserve the bytes exactly, since reformatting the JSON
changes the OCI digest.

From `scripts/core-manifest`, check the existing release metadata and resolve
the engine image digests for Linux AMD64 and ARM64.

```sh
go run . --mode scribe-evidence \
  --schema-map schema_map.json \
  --dockerfile ../../sirius-engine/Dockerfile \
  --inventory /path/to/core-build-inventory.json \
  --engine-index /path/to/engine-index.json \
  /path/to/core-manifest.yaml
```

The output reports `legacy_baseline` when no Scribe evidence receipt was
supplied. This identifies the existing release lane without an evidence claim
about the packaged scanner's linked modules.

To compare a candidate lineage receipt from
[Scribe lineage schema 1](https://github.com/SiriusScan/scribe/blob/45fcdd8ccf632dd930e072d725e49427002bce43/docs/compatibility.md#offline-reference-lineage), add
`--scribe-receipt /path/to/receipt.json`,
`--scribe-receipt-sha256 sha256:<receipt-hex>`,
`--scribe-scope <workflow-id>`, and
`--scribe-scope-sha256 <scope-hex>` before the manifest path. Obtain the pins
from the approved review record for the exact release and required workflow.
The receipt digest covers the exact file bytes. The scope digest covers the
sorted required cases, normalized input digests and Scribe release tuple.

The verifier checks the receipt's source commit, scanner commit and catalog
revision against the Core manifest. It also checks the pinned scope's case
counts, terminal verdicts and evidence identities. Drift in release or scope,
missing evidence and ambiguous platform descriptors produce errors.

A matching workflow reports `scope_matches_core_pins` even if another scope
is unqualified. `scribe_release_qualified` preserves the producer’s decision for
the complete receipt. The Core result lists pending checks for each platform's
packaged scanner artifact, its Scribe module metadata and the effective catalog
digest. The mode reports
`release_qualified: false` until those checks have verified inputs.
[Issue #183](https://github.com/SiriusScan/Sirius/issues/183) tracks
image-to-binary provenance, publish-time validation and rollback.
