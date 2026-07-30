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

# Reuse text scanner helpers.
_SCAN_DIR = Path(__file__).resolve().parent
if str(_SCAN_DIR) not in sys.path:
    sys.path.insert(0, str(_SCAN_DIR))

import scan_text  # noqa: E402


MAX_MEMBER_BYTES = 32 * 1024 * 1024  # 32 MiB per member
MAX_TOTAL_BYTES = 512 * 1024 * 1024  # 512 MiB uncompressed text budget
MAX_MEMBERS = 200_000


class ArchiveSafetyError(Exception):
    pass


def _open_tar(path: Path) -> tarfile.TarFile:
    # tarfile detects gz/bz2/xz when mode is r:*
    return tarfile.open(path, mode="r:*")


def _strip_single_top_dir(name: str) -> str:
    """GitHub source archives nest files under Repo-tag/; normalize to repo paths."""
    parts = name.replace("\\", "/").split("/")
    if len(parts) >= 2 and parts[0]:
        return "/".join(parts[1:])
    return name.replace("\\", "/")


def _validate_member_name(name: str) -> str:
    rel = name.replace("\\", "/")
    if not rel or rel.endswith("/"):
        return ""
    if rel.startswith("/") or rel.startswith("../") or "/../" in f"/{rel}/":
        raise ArchiveSafetyError(f"illegal archive member path: {name}")
    if PureHasDrive(rel):
        raise ArchiveSafetyError(f"absolute/drive archive member path: {name}")
    # After stripping GitHub top dir for allowlist, still reject oddities.
    return rel


def PureHasDrive(rel: str) -> bool:
    return len(rel) >= 2 and rel[1] == ":"


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
            name = info.filename
            _validate_member_name(name)
            if info.file_size > MAX_MEMBER_BYTES:
                raise ArchiveSafetyError(f"member too large: {name} ({info.file_size})")
            # Reject symlink-like zip extras loosely by checking external attrs on Unix.
            # Zip symlinks often have create_system==3 and mode with IFMT symlink.
            mode = (info.external_attr >> 16) & 0o170000
            if mode == 0o120000:
                raise ArchiveSafetyError(f"symlink member forbidden: {name}")
            data = zf.read(info)
            if len(data) > MAX_MEMBER_BYTES:
                raise ArchiveSafetyError(f"expanded member too large: {name}")
            total += len(data)
            if total > MAX_TOTAL_BYTES:
                raise ArchiveSafetyError("archive uncompressed budget exceeded")
            yield name, data


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
        # Try tar then zip.
        try:
            members = list(iter_tar_members(path))
        except (tarfile.TarError, ArchiveSafetyError):
            members = iter_zip_members(path)

    for name, data in members:
        rel = _strip_single_top_dir(name)
        rel = scan_text.norm_rel(rel)
        if not rel:
            continue
        if b"\x00" in data[:8192]:
            continue
        try:
            text = data.decode("utf-8", errors="replace")
        except Exception:
            continue
        findings.extend(scan_text.scan_text(text, rel, rules, allowlist))
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
