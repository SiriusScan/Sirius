#!/usr/bin/env python3
"""Safely inspect source-release archive members and scan for private leakage.

Rejects absolute paths, traversal, symlink escapes, and unreasonable sizes.
Uses only the Python standard library.
"""

from __future__ import annotations

import argparse
import sys
import tarfile
import zipfile
from pathlib import Path
from typing import Iterable, List, Optional, Sequence, Tuple

_SCAN_DIR = Path(__file__).resolve().parent
if str(_SCAN_DIR) not in sys.path:
    sys.path.insert(0, str(_SCAN_DIR))

import scan_text  # noqa: E402
from nested_content import (  # noqa: E402
    MAX_MEMBER_BYTES,
    MAX_MEMBERS,
    MAX_TOTAL_BYTES,
    ArchiveSafetyError,
    _read_zip_member,
    _validate_member_name,
)


def _open_tar(path: Path) -> tarfile.TarFile:
    return tarfile.open(path, mode="r:*")


def _strip_single_top_dir(name: str) -> str:
    """GitHub source archives nest files under Repo-tag/; normalize to repo paths."""
    parts = name.replace("\\", "/").split("/")
    if len(parts) >= 2 and parts[0]:
        return "/".join(parts[1:])
    return name.replace("\\", "/")


def iter_zip_members(path: Path) -> Iterable[Tuple[str, bytes]]:
    total = 0
    count = 0
    with zipfile.ZipFile(path) as zf:
        for info in zf.infolist():
            if info.is_dir():
                continue
            count += 1
            if count > MAX_MEMBERS:
                raise ArchiveSafetyError("too many archive members")
            data = _read_zip_member(zf, info)
            total += len(data)
            if total > MAX_TOTAL_BYTES:
                raise ArchiveSafetyError("archive uncompressed budget exceeded")
            yield info.filename, data


def iter_tar_members(path: Path) -> Iterable[Tuple[str, bytes]]:
    total = 0
    count = 0
    with _open_tar(path) as tf:
        for member in tf:
            if not member.isfile():
                if member.issym() or member.islnk():
                    raise ArchiveSafetyError(f"link member forbidden: {member.name}")
                continue
            count += 1
            if count > MAX_MEMBERS:
                raise ArchiveSafetyError("too many archive members")
            name = member.name
            _validate_member_name(name)
            if member.size > MAX_MEMBER_BYTES:
                raise ArchiveSafetyError(f"member too large: {name} ({member.size})")
            extracted = tf.extractfile(member)
            if extracted is None:
                continue
            data = extracted.read(MAX_MEMBER_BYTES + 1)
            if len(data) > MAX_MEMBER_BYTES:
                raise ArchiveSafetyError(f"expanded member too large: {name}")
            if member.size != len(data):
                raise ArchiveSafetyError(f"declared/actual size mismatch for {name}")
            total += len(data)
            if total > MAX_TOTAL_BYTES:
                raise ArchiveSafetyError("archive uncompressed budget exceeded")
            yield name, data


def scan_archive(path: Path, allowlist_path: Path) -> List[str]:
    allowlist = scan_text.load_allowlist(allowlist_path)
    rules = scan_text.compile_rules()
    findings: List[str] = []

    suffix = path.name.lower()
    if suffix.endswith(".zip"):
        members = iter_zip_members(path)
    elif (
        suffix.endswith(".tar")
        or suffix.endswith(".tar.gz")
        or suffix.endswith(".tgz")
        or suffix.endswith(".tar.bz2")
        or suffix.endswith(".tar.xz")
    ):
        members = iter_tar_members(path)
    else:
        try:
            members = list(iter_tar_members(path))
        except (tarfile.TarError, ArchiveSafetyError):
            members = iter_zip_members(path)

    for name, data in members:
        rel = scan_text.norm_rel(_strip_single_top_dir(name))
        if not rel:
            continue
        findings.extend(scan_text.scan_bytes(data, rel, rules, allowlist))
    return findings


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", required=True)
    parser.add_argument("--allowlist", required=True)
    args = parser.parse_args(argv)

    archive = Path(args.archive)
    if not archive.is_file():
        print(f"archive not found: {archive}", file=sys.stderr)
        return 2

    try:
        findings = scan_archive(archive, Path(args.allowlist))
    except ArchiveSafetyError as exc:
        print(f"COMMUNITY INDEPENDENCE ARCHIVE SAFETY FAILED: {exc}", file=sys.stderr)
        return 1
    except (tarfile.TarError, zipfile.BadZipFile) as exc:
        print(f"COMMUNITY INDEPENDENCE ARCHIVE PARSE FAILED: {exc}", file=sys.stderr)
        return 1

    if findings:
        print("COMMUNITY INDEPENDENCE ARCHIVE SCAN FAILED", file=sys.stderr)
        for item in findings:
            print(item, file=sys.stderr)
        print(f"findings={len(findings)}", file=sys.stderr)
        return 1

    print(f"OK community independence archive scan: {archive.name}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
