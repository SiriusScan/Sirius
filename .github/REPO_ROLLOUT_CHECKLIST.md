# SiriusScan Repository Rollout Checklist

Use this checklist to apply the core `Sirius` standards to other SiriusScan repositories.

Target repositories:

- `go-api`
- `app-scanner`
- `app-agent`
- `pingpp`
- `website`

## 1) Pre-check

- Confirm default branch and active maintainers.
- Confirm repository is public or intended visibility is documented.
- Confirm whether Discussions should be enabled for that repository.

## 2) Copy baseline artifacts

Copy and adapt from `Sirius`:

- `CONTRIBUTING.md`
- `SECURITY.md`
- `CODE_OF_CONDUCT.md`
- `SUPPORT.md` (recommended)
- `.github/PULL_REQUEST_TEMPLATE.md`
- `.github/ISSUE_TEMPLATE/config.yml`
- Relevant `.github/ISSUE_TEMPLATE/*.yml` files

## 3) Customize repository-specific content

Adjust per repository:

- Repository description (one clear sentence)
- Homepage URL (docs, API reference, or website)
- Topics (4-6 relevant tags)
- README architecture and setup sections
- Template wording for component names and troubleshooting paths

## 4) Labels and workflows

- Apply label taxonomy from `.github/labels.yml` where relevant.
- Ensure issue triage workflow is compatible with current labels.
- Keep CI and automation advisory-first in this phase (no new hard gates required).

## 5) Verification rubric (professional-ready)

A repository is considered ready when all checks below pass:

- Professional first impression from repo homepage
- Clear contribution and support paths
- Security reporting path is present and understandable
- Issue and PR templates collect enough context for maintainers
- Metadata (description/topics/homepage) is complete and coherent

## 6) Completion record

For each repository, record:

- Date completed
- Maintainer reviewer
- Deviations from baseline and rationale
- Follow-up items
