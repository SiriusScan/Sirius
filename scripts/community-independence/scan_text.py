#!/usr/bin/env python3
"""Path-aware Community independence / private-leakage text scanner (stdlib only).

Markers that name private orgs/registries are assembled from fragments so this
file does not embed literal private registry/module paths as committed strings.

Governance allowlists may suppress only boundary vocabulary (private org/repo/
registry references). Credentials, PEM keys, tokens, and the Pro runtime canary
are never allowlisted.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
from dataclasses import dataclass
from pathlib import Path, PurePosixPath
from typing import Iterable, List, Optional, Sequence, Tuple


# Skip noise / vendored trees when walking a directory (non-git mode).
SKIP_DIR_NAMES = {
    ".git",
    "node_modules",
    "vendor",
    ".venv",
    "venv",
    "__pycache__",
    ".pytest_cache",
    "dist",
    "build",
    ".next",
    "coverage",
    "tmp",
}


@dataclass(frozen=True)
class Rule:
    category: str  # "boundary" | "secret"
    rule_id: str
    literal: Optional[str] = None
    regex: Optional[re.Pattern[str]] = None


def _private_org_display() -> str:
    return "OpenSecurity" + "-Infosec"


def _private_org_lower() -> str:
    return "opensecurity" + "-infosec"


def _private_registry_prefix() -> str:
    return "ghcr.io/" + _private_org_lower() + "/"


def _pro_canary() -> str:
    return "SIRIUS_PRO_" + "PRIVATE_RUNTIME_CANARY_V1"


def forbidden_markers() -> List[Tuple[str, str, str]]:
    """Return (category, rule_id, pattern). Regex rule_ids are prefixed with re:."""
    org = _private_org_display()
    org_l = _private_org_lower()
    reg = _private_registry_prefix()
    canary = _pro_canary()
    return [
        ("boundary", "private_registry", reg),
        ("boundary", "private_module_https", f"https://github.com/{org}/"),
        ("boundary", "private_module_https_lower", f"https://github.com/{org_l}/"),
        ("boundary", "private_module_ssh", f"git@github.com:{org}/"),
        ("boundary", "private_module_ssh_lower", f"git@github.com:{org_l}/"),
        ("boundary", "private_go_module", f"github.com/{org}/"),
        ("boundary", "private_go_module_lower", f"github.com/{org_l}/"),
        ("boundary", "private_gh_repo_slug", f"{org}/sirius-"),
        ("boundary", "private_gh_repo_slug_lower", f"{org_l}/sirius-"),
        ("secret", "pro_runtime_canary", canary),
        ("secret", "re:github_pat", r"\bghp_[A-Za-z0-9]{20,}\b"),
        ("secret", "re:github_fine_pat", r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
        ("secret", "re:github_oauth", r"\bgho_[A-Za-z0-9]{20,}\b"),
        ("secret", "re:github_user_token", r"\bghu_[A-Za-z0-9]{20,}\b"),
        ("secret", "re:github_server_token", r"\bghs_[A-Za-z0-9]{20,}\b"),
        ("secret", "re:github_refresh", r"\bghr_[A-Za-z0-9]{20,}\b"),
        ("secret", "re:aws_access_key", r"\bAKIA[0-9A-Z]{16}\b"),
        ("secret", "re:pem_private_key", r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
    ]


def load_allowlist(path: Path) -> List[str]:
    if not path.is_file():
        raise SystemExit(f"allowlist not found: {path}")
    out: List[str] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        out.append(line.rstrip("/"))
    if not out:
        raise SystemExit(f"allowlist is empty (fail closed): {path}")
    return out


def norm_rel(path: str) -> str:
    """Normalize to a repo-relative POSIX path.

    Only strips explicit leading './' segments and leading '/' characters.
    Never uses character-set lstrip('./'), which would corrupt names like
    '.github/...' or 'github/...'.
    """
    p = path.replace("\\", "/")
    while p.startswith("./"):
        p = p[2:]
    while p.startswith("/"):
        p = p[1:]
    return p


def is_allowlisted(rel_path: str, allowlist: Sequence[str]) -> bool:
    rel = norm_rel(rel_path)
    for entry in allowlist:
        prefix = entry.rstrip("/")
        if rel == prefix or rel.startswith(prefix + "/"):
            return True
    return False


def is_never_allowlist_path(rel_path: str) -> bool:
    """Runtime/build/workflow paths can never use the governance allowlist."""
    rel = norm_rel(rel_path)
    base = PurePosixPath(rel).name

    if rel.startswith(".github/workflows/"):
        # Both .yml and .yaml workflow definitions are never allowlisted.
        if rel.endswith(".yml") or rel.endswith(".yaml") or rel.endswith("/"):
            return True
        return True

    if base.startswith("Dockerfile") or base.startswith("docker-compose"):
        return True

    never_prefixes = (
        "scripts/",
        "sirius-ui/",
        "sirius-api/",
        "sirius-engine/",
        "sirius-postgres/",
        "sirius-rabbitmq/",
        "sirius-valkey/",
        "installer/",
        "deploy/",
        "testing/container-testing/",
    )
    for p in never_prefixes:
        if rel.startswith(p):
            return True
    if rel == "docker-compose" or rel.startswith("docker-compose.") or rel.startswith("docker-compose/"):
        return True
    if rel == "Dockerfile" or rel.startswith("Dockerfile."):
        return True
    return False


def path_may_use_allowlist(rel_path: str, allowlist: Sequence[str]) -> bool:
    if is_never_allowlist_path(rel_path):
        return False
    return is_allowlisted(rel_path, allowlist)


def compile_rules() -> List[Rule]:
    compiled: List[Rule] = []
    for category, rule_id, pattern in forbidden_markers():
        if rule_id.startswith("re:"):
            compiled.append(
                Rule(category=category, rule_id=rule_id[3:], regex=re.compile(pattern))
            )
        else:
            compiled.append(
                Rule(category=category, rule_id=rule_id, literal=pattern.lower())
            )
    return compiled


def scan_text(
    text: str,
    rel_path: str,
    rules: Sequence[Rule],
    allowlist: Sequence[str],
) -> List[str]:
    """Scan a Unicode string. Prefer scan_bytes for binary/NUL-safe coverage."""
    return scan_bytes(text.encode("utf-8", errors="surrogateescape"), rel_path, rules, allowlist)


def scan_bytes(
    data: bytes,
    rel_path: str,
    rules: Sequence[Rule],
    allowlist: Sequence[str],
    *,
    nest_depth: int = 0,
    strict: bool = False,
) -> List[str]:
    """Always raw-byte scan (including NUL binaries) and recurse into archives.

    Default strict=False: opportunistic nested detection for ordinary source/stdin
    scans — malformed gzip/zip/tar magic keeps raw findings and does not fail the
    whole scan. Explicit archive/image callers pass strict=True.
    """
    # Import here to avoid circular import at module load for archive helpers.
    from nested_content import scan_nested_bytes  # noqa: WPS433

    return scan_nested_bytes(
        data,
        rel_path,
        rules,
        allowlist,
        nest_depth=nest_depth,
        strict=strict,
    )


def match_rules(
    data: bytes,
    rel_path: str,
    rules: Sequence[Rule],
    allowlist: Sequence[str],
) -> List[str]:
    findings: List[str] = []
    boundary_allowed = path_may_use_allowlist(rel_path, allowlist)
    # latin-1 preserves every byte including NUL for regex/literal search.
    as_text = data.decode("latin-1")
    lower = as_text.lower()
    for rule in rules:
        if rule.category == "boundary" and boundary_allowed:
            continue
        # secret markers are never allowlisted anywhere
        if rule.literal is not None:
            if rule.literal in lower:
                findings.append(f"{rel_path}: forbidden marker [{rule.rule_id}]")
        elif rule.regex is not None and rule.regex.search(as_text):
            findings.append(f"{rel_path}: forbidden marker [{rule.rule_id}]")
    return findings


def scan_file(
    path: Path,
    root: Path,
    rules: Sequence[Rule],
    allowlist: Sequence[str],
) -> List[str]:
    try:
        rel = norm_rel(str(path.relative_to(root)))
    except ValueError:
        rel = norm_rel(str(path))
    try:
        data = path.read_bytes()
    except OSError as exc:
        return [f"{rel}: unreadable ({exc})"]
    return scan_bytes(data, rel, rules, allowlist)


def iter_git_tracked(root: Path) -> Iterable[Path]:
    import subprocess

    proc = subprocess.run(
        ["git", "-C", str(root), "ls-files", "-z"],
        check=True,
        capture_output=True,
    )
    for rel in proc.stdout.split(b"\x00"):
        if not rel:
            continue
        yield root / rel.decode("utf-8", errors="surrogateescape")


def iter_walk(root: Path) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIR_NAMES]
        for name in filenames:
            yield Path(dirpath) / name


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, help="filesystem root for relative paths")
    parser.add_argument("--allowlist", required=True, help="governance allowlist file")
    parser.add_argument(
        "--git-tracked",
        action="store_true",
        help="scan only git-tracked files under --root",
    )
    parser.add_argument(
        "--paths-file",
        help="optional newline-delimited relative paths to scan (instead of walk/git)",
    )
    parser.add_argument(
        "--stdin-path",
        help="read file content from stdin; attribute findings to this relative path",
    )
    args = parser.parse_args(argv)

    root = Path(args.root).resolve()
    allowlist = load_allowlist(Path(args.allowlist))
    rules = compile_rules()
    findings: List[str] = []

    if args.stdin_path:
        data = sys.stdin.buffer.read()
        findings.extend(scan_bytes(data, norm_rel(args.stdin_path), rules, allowlist))
    elif args.paths_file:
        for raw in Path(args.paths_file).read_text(encoding="utf-8").splitlines():
            rel = raw.strip()
            if not rel:
                continue
            findings.extend(scan_file(root / rel, root, rules, allowlist))
    else:
        paths = iter_git_tracked(root) if args.git_tracked else iter_walk(root)
        for path in paths:
            if not path.is_file():
                continue
            findings.extend(scan_file(path, root, rules, allowlist))

    if findings:
        print("COMMUNITY INDEPENDENCE SCAN FAILED", file=sys.stderr)
        for item in findings:
            print(item, file=sys.stderr)
        print(f"findings={len(findings)}", file=sys.stderr)
        return 1

    print("OK community independence text scan (0 findings)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
