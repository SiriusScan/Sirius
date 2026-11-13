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
`sirius-ui` tree. Existing published tags/releases remain write-once.
