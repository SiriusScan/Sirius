#!/usr/bin/env python3
"""Inspect a docker-save tarball (configs + layer archives) without running containers."""

from __future__ import annotations

import argparse
import gzip
import io
import sys
import tarfile
from pathlib import Path
from typing import BinaryIO, Iterable, List, Optional, Sequence, Tuple, Union

_SCAN_DIR = Path(__file__).resolve().parent
if str(_SCAN_DIR) not in sys.path:
    sys.path.insert(0, str(_SCAN_DIR))

import scan_text  # noqa: E402
from scan_archive import (  # noqa: E402
    MAX_MEMBER_BYTES,
    MAX_TOTAL_BYTES,
    ArchiveSafetyError,
)


def _read_limited(fh: BinaryIO, limit: int) -> bytes:
    data = fh.read(limit + 1)
    if len(data) > limit:
        raise ArchiveSafetyError("expanded member exceeds size limit")
    return data


def _open_maybe_gzip(data: bytes) -> Union[gzip.GzipFile, io.BytesIO]:
    if len(data) >= 2 and data[0] == 0x1F and data[1] == 0x8B:
        return gzip.GzipFile(fileobj=io.BytesIO(data), mode="rb")
    return io.BytesIO(data)


def iter_layer_tar_bytes(layer_bytes: bytes) -> Iterable[Tuple[str, bytes]]:
    total = 0
    stream = _open_maybe_gzip(layer_bytes)
    try:
        with tarfile.open(fileobj=stream, mode="r:*") as tf:
            for member in tf:
                if member.issym() or member.islnk():
                    link = member.linkname or ""
                    if ".." in member.name.replace("\\", "/") or ".." in link.replace(
                        "\\", "/"
                    ):
                        raise ArchiveSafetyError(
                            f"dangerous link in layer: {member.name} -> {link}"
                        )
                    continue
                if not member.isfile():
                    continue
                name = member.name.replace("\\", "/")
                if name.startswith("/") or name.startswith("../") or "/../" in f"/{name}/":
                    raise ArchiveSafetyError(f"illegal layer path: {name}")
                if member.size > MAX_MEMBER_BYTES:
                    raise ArchiveSafetyError(f"layer member too large: {name}")
                extracted = tf.extractfile(member)
                if extracted is None:
                    continue
                data = _read_limited(extracted, MAX_MEMBER_BYTES)
                total += len(data)
                if total > MAX_TOTAL_BYTES:
                    raise ArchiveSafetyError("layer uncompressed budget exceeded")
                yield name, data
    except tarfile.TarError as exc:
        raise ArchiveSafetyError(f"invalid layer archive: {exc}") from exc


def scan_docker_save(save_tar: Path, allowlist: Path, image_label: str) -> List[str]:
    allow = scan_text.load_allowlist(allowlist)
    rules = scan_text.compile_rules()
    findings: List[str] = []

    with tarfile.open(save_tar, mode="r:*") as outer:
        for member in outer:
            name = member.name
            if not member.isfile():
                if member.issym() or member.islnk():
                    raise ArchiveSafetyError(f"link in docker-save tar forbidden: {name}")
                continue
            if member.size > MAX_MEMBER_BYTES:
                # Layer blobs can be large; allow larger outer members for layers only.
                lower_probe = name.lower()
                if not (
                    lower_probe.endswith(".tar")
                    or lower_probe.endswith(".tar.gz")
                    or lower_probe.endswith("/layer.tar")
                    or "/blobs/" in lower_probe
                ):
                    raise ArchiveSafetyError(f"docker-save member too large: {name}")
            fh = outer.extractfile(member)
            if fh is None:
                continue
            # Cap outer read at 256MiB per blob for safety.
            outer_limit = max(MAX_MEMBER_BYTES, 256 * 1024 * 1024)
            data = _read_limited(fh, outer_limit)
            lower_name = name.lower()
            rel = f"image/{image_label}/{scan_text.norm_rel(name)}"

            if lower_name.endswith(".json") or lower_name in {"manifest.json", "index.json"}:
                text = data.decode("utf-8", errors="replace")
                findings.extend(scan_text.scan_text(text, rel, rules, allow))
                continue

            is_layer = (
                lower_name.endswith(".tar")
                or lower_name.endswith(".tar.gz")
                or lower_name.endswith("/layer.tar")
                or ("/blobs/" in lower_name and not lower_name.endswith(".json") and data)
            )
            if not is_layer:
                if b"\x00" not in data[:2048]:
                    text = data.decode("utf-8", errors="replace")
                    findings.extend(scan_text.scan_text(text, rel, rules, allow))
                continue

            for layer_path, layer_data in iter_layer_tar_bytes(data):
                if b"\x00" in layer_data[:2048]:
                    continue
                text = layer_data.decode("utf-8", errors="replace")
                nested = f"image/{image_label}/layer/{scan_text.norm_rel(layer_path)}"
                findings.extend(scan_text.scan_text(text, nested, rules, allow))

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
