#!/usr/bin/env python3
"""Inspect a docker-save tarball (configs + layer archives) without running containers.

Layer blobs are spooled to disk-backed temporary files and scanned with streaming
gzip→tar iteration — never fully buffered at a 256MiB RAM cap.
"""

from __future__ import annotations

import argparse
import sys
import tarfile
import tempfile
from pathlib import Path
from typing import List, Optional, Sequence

_SCAN_DIR = Path(__file__).resolve().parent
if str(_SCAN_DIR) not in sys.path:
    sys.path.insert(0, str(_SCAN_DIR))

import scan_text  # noqa: E402
from nested_content import (  # noqa: E402
    CHUNK_SIZE,
    ArchiveSafetyError,
    _Budget,
    _validate_member_name,
    scan_nested_fileobj,
)


def scan_docker_save(save_tar: Path, allowlist: Path, image_label: str) -> List[str]:
    allow = scan_text.load_allowlist(allowlist)
    rules = scan_text.compile_rules()
    findings: List[str] = []
    budget = _Budget()

    with tarfile.open(save_tar, mode="r:*") as outer:
        for member in outer:
            name = member.name
            if member.issym() or member.islnk():
                link = member.linkname or ""
                raise ArchiveSafetyError(
                    f"link in docker-save tar forbidden: {name} -> {link}"
                )
            if not member.isfile():
                continue
            _validate_member_name(name)
            fh = outer.extractfile(member)
            if fh is None:
                continue

            rel = f"image/{image_label}/{scan_text.norm_rel(name)}"

            # Stream outer member into a spooled temp file (small RAM, disk-backed).
            with tempfile.SpooledTemporaryFile(max_size=8 * 1024 * 1024) as spool:
                while True:
                    chunk = fh.read(CHUNK_SIZE)
                    if not chunk:
                        break
                    spool.write(chunk)
                spool.seek(0)
                findings.extend(
                    scan_nested_fileobj(
                        spool,
                        rel,
                        rules,
                        allow,
                        budget=budget,
                        strict=True,
                    )
                )

    return findings


def main(argv: Optional[Sequence[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--save-tar", required=True)
    parser.add_argument("--allowlist", required=True)
    parser.add_argument("--image-label", required=True)
    args = parser.parse_args(argv)

    try:
        findings = scan_docker_save(
            Path(args.save_tar), Path(args.allowlist), args.image_label
        )
    except ArchiveSafetyError as exc:
        print(f"COMMUNITY INDEPENDENCE IMAGE SAFETY FAILED: {exc}", file=sys.stderr)
        return 1

    if findings:
        print("COMMUNITY INDEPENDENCE IMAGE SCAN FAILED", file=sys.stderr)
        for item in findings:
            print(item, file=sys.stderr)
        print(f"findings={len(findings)}", file=sys.stderr)
        return 1

    print(f"OK image layer scan: {args.image_label}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
