# Organization Profile Rollout Checklist

This checklist publishes the organization profile using the content in `.github/profile/README.md`.

## 0. Prepare aesthetic baseline (brand/story)

Before publishing, confirm profile content has:

1. A short mission statement in the first paragraph.
2. A clear "what we build" section for first-time visitors.
3. A "start here" section with docs, install, API, and security links.
4. Repository blurbs that use consistent tone and sentence structure.
5. Contributor entry points (`CONTRIBUTING.md`, `SUPPORT.md`, Discussions).

## 1. Create the organization profile repository

1. In the `SiriusScan` organization, create a **public** repository named `.github`.
2. Copy `.github/profile/README.md` from this repository into the new repository at `profile/README.md`.
3. Commit and push.

## 2. Configure organization branding

1. Open organization settings and upload:
   - Organization avatar (square logo)
   - Optional profile banner image
2. Set a concise organization description aligned with the README mission statement.
3. Ensure links are set for website and documentation.

## 3. Configure public pinned repositories

Pin up to six repositories in this order (this is also the brand narrative order):

1. `Sirius`
2. `go-api`
3. `app-scanner`
4. `app-agent`
5. `pingpp`
6. `website`

## 4. Standardize repository metadata

For each pinned repository:

1. Update repository description for consistent language and tone.
2. Add GitHub topics (for example: `security`, `vulnerability-scanner`, `devsecops`, `golang`, `nextjs` as applicable).
3. Verify homepage URL points to product docs or website.

Recommended descriptions and links:

| Repository | Description | Homepage | Suggested topics |
| --- | --- | --- | --- |
| `Sirius` | Core platform, orchestration, docs, and deployment baseline for SiriusScan. | `https://sirius.publickey.io/docs/getting-started/quick-start` | `security`, `devsecops`, `vulnerability-scanner`, `docker`, `nextjs` |
| `go-api` | Backend API services for platform operations and integrations. | `https://sirius.publickey.io/docs/api/rest/authentication` | `golang`, `api`, `security`, `backend` |
| `app-scanner` | Scanning execution service for discovery and vulnerability collection. | `https://sirius.publickey.io/docs/getting-started/installation` | `scanner`, `security`, `golang`, `automation` |
| `app-agent` | Agent runtime for distributed scanning and remote execution workflows. | `https://sirius.publickey.io/docs/getting-started/installation` | `agent`, `golang`, `security`, `distributed-systems` |
| `pingpp` | Network diagnostics and connectivity support utilities. | `https://sirius.publickey.io/docs/getting-started/installation` | `networking`, `golang`, `diagnostics`, `security` |
| `website` | Public website and product-facing content for SiriusScan. | `https://sirius.publickey.io` | `website`, `nextjs`, `security`, `docs` |

## 5. Enable community and trust signals

1. Enable Discussions where appropriate.
2. Confirm each repository has:
   - `README.md`
   - `CONTRIBUTING.md`
   - `SECURITY.md`
   - `CODE_OF_CONDUCT.md`
   - `LICENSE`
3. Confirm branch protection rules are enabled for default branches.

## 6. Publish quality check

Validate from a first-time visitor perspective:

1. Profile page communicates value in under 30 seconds.
2. New contributors can find contribution and support paths quickly.
3. Security reporting path is visible and private-report guidance is explicit.
4. Pinned repositories feel cohesive and professionally described.
