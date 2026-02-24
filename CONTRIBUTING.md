# Contributing to Sirius Scan

Thanks for your interest in contributing to Sirius Scan.

This file defines the repository-level contribution contract. For full environment and architecture details, use the extended guide in [`documentation/contributing.md`](./documentation/contributing.md).

## Communication Channels

- Bugs and feature requests: <https://github.com/SiriusScan/Sirius/issues>
- Questions and proposals: <https://github.com/SiriusScan/Sirius/discussions>
- Security reports: follow [`SECURITY.md`](./SECURITY.md) (private reporting only)

## Contribution Types

We welcome:

- Bug fixes
- Reliability and performance improvements
- Security hardening
- Documentation improvements
- Tests and automation improvements

## Development Setup

1. Fork the repository
2. Clone your fork
3. Start environment with installer-first flow:

```bash
git clone https://github.com/<your-user>/Sirius.git
cd Sirius
docker compose -f docker-compose.installer.yaml run --rm sirius-installer
docker compose up -d
```

For advanced local development, follow [`documentation/contributing.md`](./documentation/contributing.md).

## Branch and Commit Standards

- Branch naming: `<type>/<short-description>` (example: `fix/auth-key-drift`)
- Commit format: conventional style (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`)
- Keep PRs focused and atomic

## Pull Request Process

1. Create or reference an issue for non-trivial changes
2. Implement the change with tests
3. Update docs when behavior changes
4. Run validation locally
5. Open a PR using the template and complete every checklist item

### Required Validation Before PR

```bash
# repository checks
cd testing
make validate-all

# return to repo root if needed
cd ..
```

If your change touches only a subset of services, include targeted validation evidence in the PR description.

## Review Expectations

To improve review speed and quality, every PR should include:

- Problem statement and scope
- Why this approach was chosen
- Risk assessment (what could regress)
- Test evidence (logs, screenshots, command output)
- Rollback strategy for operationally sensitive changes

## Definition of Done

A contribution is considered ready to merge when:

- CI is passing
- Required approvals are complete
- Documentation is updated
- Security and compatibility concerns are addressed
- Maintainers confirm readiness

## Large Changes

For major features or architectural changes:

1. Open a proposal in Discussions first
2. Align with maintainers on scope and sequencing
3. Implement in incremental PRs

## License

By contributing, you agree that your contributions are licensed under the project license in [`LICENSE`](./LICENSE).
