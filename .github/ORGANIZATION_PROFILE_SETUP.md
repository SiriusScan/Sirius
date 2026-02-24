# Organization Profile Rollout Checklist

This checklist publishes the organization profile using the content in `.github/profile/README.md`.

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

Pin up to six repositories in this order:

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

## 5. Enable community and trust signals

1. Enable Discussions where appropriate.
2. Confirm each repository has:
   - `README.md`
   - `CONTRIBUTING.md`
   - `SECURITY.md`
   - `CODE_OF_CONDUCT.md`
   - `LICENSE`
3. Confirm branch protection rules are enabled for default branches.
