#!/usr/bin/env python3
"""Safely inspect source-release archive members and scan for private leakage.

Rejects absolute paths, traversal, symlink escapes, and unreasonable sizes.
Large members are stream-scanned rather than hard-failed solely for size.
Uses only the Python standard library.
"""

from __future__ import annotations

import argparse
import sys
import tarfile
import zipfile
from pathlib import Path
from typing import List, Optional, Sequence

_SCAN_DIR = Path(__file__).resolve().parent
if str(_SCAN_DIR) not in sys.path:
    sys.path.insert(0, str(_SCAN_DIR))

import scan_text  # noqa: E402
from nested_content import (  # noqa: E402
    MAX_BUFFERED_MEMBER,
    MAX_MEMBERS,
    ArchiveSafetyError,
    _Budget,
    _validate_member_name,
    scan_nested_bytes,
    scan_nested_fileobj,
)


def _strip_single_top_dir(name: str) -> str:
    parts = name.replace("\\", "/").split("/")
    if len(parts) >= 2 and parts[0]:
        return "/".join(parts[1:])
    return name.replace("\\", "/")


def scan_archive(
    path: Path,
    allowlist_path: Path,
    *,
    budget: Optional[_Budget] = None,
) -> List[str]:
    allowlist = scan_text.load_allowlist(allowlist_path)
    rules = scan_text.compile_rules()
    if budget is None:
        budget = _Budget()

    suffix = path.name.lower()
    if suffix.endswith(".zip"):
        return _scan_zip_archive(path, rules, allowlist, budget)
    if (
        suffix.endswith(".tar")
        or suffix.endswith(".tar.gz")
        or suffix.endswith(".tgz")
        or suffix.endswith(".tar.bz2")
        or suffix.endswith(".tar.xz")
    ):
        return _scan_tar_archive(path, rules, allowlist, budget)
    try:
        return _scan_tar_archive(path, rules, allowlist, budget)
    except (tarfile.TarError, ArchiveSafetyError):
        return _scan_zip_archive(path, rules, allowlist, budget)


def _scan_zip_archive(
    path: Path,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    budget: _Budget,
) -> List[str]:
    findings: List[str] = []
    with zipfile.ZipFile(path) as zf:
        count = 0
        for info in zf.infolist():
            if info.is_dir():
                continue
            count += 1
            if count > MAX_MEMBERS:
                raise ArchiveSafetyError("too many archive members")
            rel = scan_text.norm_rel(_strip_single_top_dir(info.filename))
            if not rel:
                continue
            _validate_member_name(info.filename)
            mode = (info.external_attr >> 16) & 0o170000
            if mode == 0o120000:
                raise ArchiveSafetyError(f"symlink member forbidden: {info.filename}")

            with zf.open(info, "r") as fh:
                budget.add_member(rel)
                if info.file_size > MAX_BUFFERED_MEMBER:
                    # Stream/spool and still recurse into nested gzip/tar/zip.
                    findings.extend(
                        scan_nested_fileobj(
                            fh, rel, rules, allowlist, budget=budget, strict=True
                        )
                    )
                    continue
                data = fh.read(MAX_BUFFERED_MEMBER + 1)
            if len(data) > MAX_BUFFERED_MEMBER:
                raise ArchiveSafetyError(f"expanded member too large: {info.filename}")
            if info.file_size != len(data):
                raise ArchiveSafetyError(
                    f"declared/actual size mismatch for {info.filename}"
                )
            findings.extend(
                scan_nested_bytes(
                    data, rel, rules, allowlist, budget=budget, strict=True
                )
            )
    return findings


def _scan_tar_archive(
    path: Path,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    budget: _Budget,
) -> List[str]:
    findings: List[str] = []
    with tarfile.open(path, mode="r:*") as tf:
        count = 0
        for member in tf:
            if not member.isfile():
                if member.issym() or member.islnk():
                    raise ArchiveSafetyError(f"link member forbidden: {member.name}")
                continue
            count += 1
            if count > MAX_MEMBERS:
                raise ArchiveSafetyError("too many archive members")
            _validate_member_name(member.name)
            rel = scan_text.norm_rel(_strip_single_top_dir(member.name))
            if not rel:
                continue
            extracted = tf.extractfile(member)
            if extracted is None:
                continue
            size = int(member.size)
            budget.add_member(rel)
            if size > MAX_BUFFERED_MEMBER:
                # Stream/spool and still recurse into nested gzip/tar/zip.
                findings.extend(
                    scan_nested_fileobj(
                        extracted, rel, rules, allowlist, budget=budget, strict=True
                    )
                )
                continue
            data = extracted.read(MAX_BUFFERED_MEMBER + 1)
            if len(data) > MAX_BUFFERED_MEMBER:
                raise ArchiveSafetyError(f"expanded member too large: {member.name}")
            if size != len(data):
                raise ArchiveSafetyError(
                    f"declared/actual size mismatch for {member.name}"
                )
            findings.extend(
                scan_nested_bytes(
                    data, rel, rules, allowlist, budget=budget, strict=True
                )
            )
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
