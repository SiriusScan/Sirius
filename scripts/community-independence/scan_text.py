#!/usr/bin/env python3
"""Path-aware Community independence / private-leakage text scanner (stdlib only).

Markers that name private orgs/registries are assembled from fragments so this
file does not embed literal private registry/module paths as committed strings.
"""

from __future__ import annotations

import argparse
import os
import re
import sys
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

BINARY_SUFFIXES = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".webp",
    ".ico",
    ".pdf",
    ".zip",
    ".gz",
    ".tgz",
    ".bz2",
    ".xz",
    ".woff",
    ".woff2",
    ".ttf",
    ".otf",
    ".exe",
    ".dll",
    ".so",
    ".dylib",
    ".bin",
    ".parquet",
    ".wasm",
}


def _private_org_display() -> str:
    return "OpenSecurity" + "-Infosec"


def _private_org_lower() -> str:
    return "opensecurity" + "-infosec"


def _private_registry_prefix() -> str:
    return "ghcr.io/" + _private_org_lower() + "/"


def _pro_canary() -> str:
    # High-confidence runtime marker that must never appear in Community artifacts.
    return "SIRIUS_PRO_" + "PRIVATE_RUNTIME_CANARY_V1"


def forbidden_markers() -> List[Tuple[str, str]]:
    """Return (rule_id, literal_or_regex) pairs. Literals are matched case-insensitively substring; regex rules start with re:."""
    org = _private_org_display()
    org_l = _private_org_lower()
    reg = _private_registry_prefix()
    canary = _pro_canary()
    return [
        ("private_registry", reg),
        ("private_module_https", f"https://github.com/{org}/"),
        ("private_module_https_lower", f"https://github.com/{org_l}/"),
        ("private_module_ssh", f"git@github.com:{org}/"),
        ("private_module_ssh_lower", f"git@github.com:{org_l}/"),
        ("private_go_module", f"github.com/{org}/"),
        ("private_go_module_lower", f"github.com/{org_l}/"),
        ("private_gh_repo_slug", f"{org}/sirius-"),
        ("private_gh_repo_slug_lower", f"{org_l}/sirius-"),
        ("pro_runtime_canary", canary),
        # High-confidence credential bodies (not mere key names).
        ("re:github_pat", r"\bghp_[A-Za-z0-9]{20,}\b"),
        ("re:github_fine_pat", r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
        ("re:github_oauth", r"\bgho_[A-Za-z0-9]{20,}\b"),
        ("re:github_user_token", r"\bghu_[A-Za-z0-9]{20,}\b"),
        ("re:github_server_token", r"\bghs_[A-Za-z0-9]{20,}\b"),
        ("re:github_refresh", r"\bghr_[A-Za-z0-9]{20,}\b"),
        ("re:aws_access_key", r"\bAKIA[0-9A-Z]{16}\b"),
        ("re:pem_private_key", r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
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
    p = path.replace("\\", "/").lstrip("./")
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
    never_prefixes = (
        ".github/workflows/",
        "docker-compose",
        "Dockerfile",
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
    base = PurePosixPath(rel).name
    if base.startswith("Dockerfile") or base.startswith("docker-compose"):
        return True
    if rel.startswith(".github/workflows/") or rel.endswith(".yml") and "/workflows/" in rel:
        return True
    for p in never_prefixes:
        if p.endswith("/") and rel.startswith(p):
            # scripts/community-independence is scanner tooling; still never
            # allowlisted for private markers (patterns are assembled).
            return True
        if not p.endswith("/") and (rel == p or rel.startswith(p + ".") or rel.startswith(p + "/")):
            return True
    return False


def path_may_use_allowlist(rel_path: str, allowlist: Sequence[str]) -> bool:
    if is_never_allowlist_path(rel_path):
        return False
    return is_allowlisted(rel_path, allowlist)


def looks_binary(path: Path) -> bool:
    if path.suffix.lower() in BINARY_SUFFIXES:
        return True
    try:
        chunk = path.read_bytes()[:8192]
    except OSError:
        return True
    if b"\x00" in chunk:
        return True
    return False


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


def compile_rules() -> List[Tuple[str, Optional[re.Pattern[str]], Optional[str]]]:
    compiled: List[Tuple[str, Optional[re.Pattern[str]], Optional[str]]] = []
    for rule_id, pattern in forbidden_markers():
        if rule_id.startswith("re:") or pattern.startswith("re:"):
            rid = rule_id[3:] if rule_id.startswith("re:") else rule_id
            rx = pattern[3:] if pattern.startswith("re:") else pattern
            compiled.append((rid, re.compile(rx), None))
        else:
            compiled.append((rule_id, None, pattern.lower()))
    return compiled


def scan_text(
    text: str,
    rel_path: str,
    rules: Sequence[Tuple[str, Optional[re.Pattern[str]], Optional[str]]],
    allowlist: Sequence[str],
) -> List[str]:
    findings: List[str] = []
    allowed = path_may_use_allowlist(rel_path, allowlist)
    lower = text.lower()
    for rule_id, rx, literal in rules:
        if allowed:
            continue
        if literal is not None:
            if literal in lower:
                findings.append(f"{rel_path}: forbidden marker [{rule_id}]")
        elif rx is not None and rx.search(text):
            findings.append(f"{rel_path}: forbidden marker [{rule_id}]")
    return findings


def scan_file(
    path: Path,
    root: Path,
    rules: Sequence[Tuple[str, Optional[re.Pattern[str]], Optional[str]]],
    allowlist: Sequence[str],
) -> List[str]:
    try:
        rel = norm_rel(str(path.relative_to(root)))
    except ValueError:
        rel = norm_rel(str(path))
    if looks_binary(path):
        return []
    try:
        text = path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        return [f"{rel}: unreadable ({exc})"]
    return scan_text(text, rel, rules, allowlist)


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", required=True, help="filesystem root for relative paths")
    parser.add_argument(
        "--allowlist",
        required=True,
        help="governance allowlist file",
    )
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
        text = sys.stdin.read()
        findings.extend(scan_text(text, norm_rel(args.stdin_path), rules, allowlist))
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
