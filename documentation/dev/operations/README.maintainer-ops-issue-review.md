---
title: "Maintainer Issue Review System"
description: "Issue and PR triage taxonomy, lifecycle, and ChatOps conventions for mobile-friendly Sirius maintenance."
template: "TEMPLATE.documentation-standard"
version: "1.0.0"
last_updated: "2026-02-22"
author: "Sirius Team"
tags: ["operations", "triage", "chatops", "github", "labels"]
categories: ["operations", "development"]
difficulty: "intermediate"
prerequisites: ["github", "github-actions", "sirius-workflows"]
related_docs:
  - "README.git-operations.md"
  - "README.api-key-operations.md"
  - "../deployment/README.workflows.md"
  - "../test/CHECKLIST.testing-by-type.md"
dependencies:
  - ".github/labels.yml"
  - ".github/workflows/issue-triage.yml"
  - ".github/workflows/chatops-runner.yml"
llm_context: "high"
search_keywords: ["triage", "labels", "issue forms", "chatops", "slash commands", "mobile maintainer"]
---

# Maintainer Issue Review System

## Purpose

Define a deterministic, evidence-driven issue and PR review workflow that works well from mobile and minimizes maintainer back-and-forth.

## Label Taxonomy

### Status Labels (single active status)

- `status:needs-triage`
- `status:needs-info`
- `status:repro-ready`
- `status:confirmed`
- `status:in-progress`
- `status:blocked`
- `status:ready-to-merge`
- `status:done`

### Type Labels

- `type:bug`
- `type:enhancement`
- `type:security`
- `type:docs`
- `type:question`

### Area Labels

- `area:installer-secrets`
- `area:compose-dev`
- `area:compose-prod`
- `area:ui`
- `area:api`
- `area:engine`
- `area:rabbitmq`
- `area:postgres`
- `area:valkey`
- `area:auth`

### Severity Labels

- `sev:critical`
- `sev:high`
- `sev:medium`
- `sev:low`

## Issue Intake

Issue forms are required and live under `.github/ISSUE_TEMPLATE/`.

Current form set:

- `install-startup.yml`
- `auth-401.yml`
- `dev-overlay.yml`
- `windows-wsl.yml`
- `security-report.yml`

Intake quality baseline:

- run mode (standard/dev/prod overlay)
- runtime version/tag
- host OS + Docker version
- compose render validation outcome
- key service logs
- minimal reproduction steps

## Triage and ChatOps Lifecycle

1. New issue receives `status:needs-triage`.
2. Triage automation applies `type:*`, `area:*`, and severity hints from deterministic rules.
3. Triage Card comment is posted with missing-info checks and recommended commands.
4. Maintainer drives progression from comments:
   - `/triage needs-info`
   - `/triage repro-ready`
   - `/triage confirmed`
5. Maintainer triggers evidence workflows from comments:
   - `/test health`
   - `/test integration`
   - `/test security <suite>`

## PR Review Policy

PRs are path-labeled (`area:*`) and receive an automated review card summarizing:

- changed surfaces and risk zones
- recommended test checklist slices
- mobile-safe slash commands for additional validation

Required test guidance is sourced from `documentation/dev/test/CHECKLIST.testing-by-type.md`.

## Operational Notes

- Deterministic rules decide labels/states; AI summaries are optional and advisory.
- Security and confirmed issues are exempt from stale auto-close.
- Health and integration evidence should be posted in-thread for auditability.

---

_This document follows the Sirius Documentation Standard. For documentation governance, see `documentation/dev/ABOUT.documentation.md`._
