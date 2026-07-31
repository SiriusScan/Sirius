package contract

// DefaultBaselineOpenAPIPath is a local seed/documentation copy of the last
// accepted published contract. CI and fail-closed tests MUST NOT treat this
// file as authoritative — use ResolveProtectedBaseline / CheckProtectedBreaking
// against the protected git ref (merge-base / PR base / main).
//
// Baseline advancement procedure:
//  1. Open a dedicated contract-change PR (or obtain an explicit human gate).
//  2. Update sirius-api/contracts/openapi.v1.yaml with the intentional change.
//  3. CI compares the candidate against openapi.v1.yaml at the protected base.
//  4. Breaking changes fail unless SIRIUS_OPENAPI_ALLOW_BREAKING=1 is set by an
//     approved advancement workflow (not by editing any local baseline file).
//  5. After merge to main, the protected baseline advances immutably with main.
//  6. Optionally refresh openapi.v1.baseline.yaml to match for local docs/fixtures.
const DefaultBaselineOpenAPIPath = "contracts/openapi.v1.baseline.yaml"
