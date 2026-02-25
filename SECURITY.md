# Security Policy

Sirius Scan is a security platform. We treat vulnerability handling as a first-class engineering workflow.

## Supported Versions

We currently provide security fixes for:

- `main` branch
- Latest production release tag (for example, `v1.x`)

Older releases may not receive security patches.

## Reporting a Vulnerability

Do not open public issues for suspected vulnerabilities.

Use one of the private channels below:

- GitHub Security Advisories: <https://github.com/SiriusScan/Sirius/security/advisories/new>
- Email: `security@opensecurity.com`

If possible, include:

1. Affected component(s) and version/tag
2. Reproduction steps or proof of concept
3. Expected impact and attack preconditions
4. Suggested mitigation (if known)
5. Contact information for follow-up

## Response Targets

We aim to meet the following timelines:

- Initial acknowledgment: within 24 hours
- Triage decision: within 72 hours
- Mitigation plan: within 7 calendar days for confirmed issues
- Public advisory: after a fix is available and coordinated

Complex vulnerabilities may require longer remediation windows. We will keep reporters informed of status.

## Disclosure Process

1. Report received and acknowledged privately
2. Internal triage and severity classification
3. Fix is prepared and validated
4. Coordinated release and advisory publication
5. Credit is given to reporter (if desired)

## Scope

This policy covers vulnerabilities in:

- `Sirius` primary repository
- Official Sirius Scan release artifacts
- Related services maintained under the SiriusScan organization where applicable

Third-party dependencies should also be reported upstream when required.

## Safe Harbor

We support good-faith security research. We ask researchers to:

- Avoid service disruption or destructive testing
- Avoid accessing or modifying data that is not your own
- Report findings privately and allow coordinated remediation

We will not pursue action against research that follows this policy and applicable law.
