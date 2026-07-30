#!/usr/bin/env python3
"""Bounded nested content inspection for gzip/zip/tar payloads (stdlib only)."""

from __future__ import annotations

import gzip
import io
import tarfile
import zipfile
from typing import List, Optional, Sequence, Tuple

import scan_text

MAX_MEMBER_BYTES = 32 * 1024 * 1024
MAX_TOTAL_BYTES = 512 * 1024 * 1024
MAX_MEMBERS = 200_000
MAX_NEST_DEPTH = 5


class ArchiveSafetyError(Exception):
    pass


class _Budget:
    def __init__(self) -> None:
        self.total = 0
        self.members = 0

    def add(self, n: int, label: str) -> None:
        self.members += 1
        if self.members > MAX_MEMBERS:
            raise ArchiveSafetyError(f"too many nested members near {label}")
        self.total += n
        if self.total > MAX_TOTAL_BYTES:
            raise ArchiveSafetyError(f"nested uncompressed budget exceeded near {label}")


def _validate_member_name(name: str) -> str:
    rel = name.replace("\\", "/")
    if not rel or rel.endswith("/"):
        return ""
    if rel.startswith("/") or rel.startswith("../") or "/../" in f"/{rel}/":
        raise ArchiveSafetyError(f"illegal archive member path: {name}")
    if len(rel) >= 2 and rel[1] == ":":
        raise ArchiveSafetyError(f"absolute/drive archive member path: {name}")
    return rel


def _is_gzip(data: bytes) -> bool:
    return len(data) >= 2 and data[0] == 0x1F and data[1] == 0x8B


def _is_zip(data: bytes) -> bool:
    return len(data) >= 4 and data[:2] == b"PK" and data[2] in (0x03, 0x05, 0x07)


def _is_tar(data: bytes) -> bool:
    if len(data) < 512:
        return False
    if data[257:262] == b"ustar":
        return True
    # POSIX tar with empty magic still has a plausible header checksum field.
    try:
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:") as tf:
            # Presence of at least one member confirms tar.
            for _ in tf:
                return True
    except tarfile.TarError:
        return False
    return False


def _gunzip_limited(data: bytes, label: str) -> bytes:
    try:
        with gzip.GzipFile(fileobj=io.BytesIO(data), mode="rb") as gz:
            out = gz.read(MAX_MEMBER_BYTES + 1)
    except OSError as exc:
        raise ArchiveSafetyError(f"gzip parse failed at {label}: {exc}") from exc
    if len(out) > MAX_MEMBER_BYTES:
        raise ArchiveSafetyError(f"gzip member too large at {label}")
    return out


def _read_zip_member(zf: zipfile.ZipFile, info: zipfile.ZipInfo) -> bytes:
    name = info.filename
    _validate_member_name(name)
    mode = (info.external_attr >> 16) & 0o170000
    if mode == 0o120000:
        raise ArchiveSafetyError(f"symlink member forbidden: {name}")
    if info.file_size > MAX_MEMBER_BYTES:
        raise ArchiveSafetyError(f"member too large: {name} ({info.file_size})")
    # Stream decompression; reject excess before allocating beyond the cap.
    try:
        with zf.open(info, "r") as fh:
            data = fh.read(MAX_MEMBER_BYTES + 1)
    except (zipfile.BadZipFile, RuntimeError, OSError) as exc:
        raise ArchiveSafetyError(f"zip member read failed for {name}: {exc}") from exc
    if len(data) > MAX_MEMBER_BYTES:
        raise ArchiveSafetyError(f"expanded member too large: {name}")
    if info.file_size != len(data):
        raise ArchiveSafetyError(
            f"declared/actual size mismatch for {name}: "
            f"declared={info.file_size} actual={len(data)}"
        )
    return data


def iter_zip_bytes(data: bytes, label: str, budget: _Budget) -> List[Tuple[str, bytes]]:
    out: List[Tuple[str, bytes]] = []
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                member = _read_zip_member(zf, info)
                budget.add(len(member), f"{label}/{info.filename}")
                out.append((info.filename, member))
    except zipfile.BadZipFile as exc:
        raise ArchiveSafetyError(f"zip parse failed at {label}: {exc}") from exc
    return out


def iter_tar_bytes(data: bytes, label: str, budget: _Budget) -> List[Tuple[str, bytes]]:
    out: List[Tuple[str, bytes]] = []
    try:
        with tarfile.open(fileobj=io.BytesIO(data), mode="r:*") as tf:
            for member in tf:
                if member.issym() or member.islnk():
                    link = member.linkname or ""
                    if (
                        ".." in member.name.replace("\\", "/")
                        or ".." in link.replace("\\", "/")
                        or link.startswith("/")
                        or member.name.startswith("/")
                    ):
                        raise ArchiveSafetyError(
                            f"dangerous link in archive: {member.name} -> {link}"
                        )
                    # Non-dangerous links still rejected fail-closed for nested payloads.
                    raise ArchiveSafetyError(
                        f"link member forbidden in nested archive: {member.name}"
                    )
                if not member.isfile():
                    continue
                _validate_member_name(member.name)
                if member.size > MAX_MEMBER_BYTES:
                    raise ArchiveSafetyError(
                        f"member too large: {member.name} ({member.size})"
                    )
                extracted = tf.extractfile(member)
                if extracted is None:
                    continue
                blob = extracted.read(MAX_MEMBER_BYTES + 1)
                if len(blob) > MAX_MEMBER_BYTES:
                    raise ArchiveSafetyError(f"expanded member too large: {member.name}")
                if member.size != len(blob):
                    raise ArchiveSafetyError(
                        f"declared/actual size mismatch for {member.name}"
                    )
                budget.add(len(blob), f"{label}/{member.name}")
                out.append((member.name, blob))
    except tarfile.TarError as exc:
        raise ArchiveSafetyError(f"tar parse failed at {label}: {exc}") from exc
    return out


def scan_nested_bytes(
    data: bytes,
    rel_path: str,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    *,
    nest_depth: int = 0,
    budget: Optional[_Budget] = None,
) -> List[str]:
    if budget is None:
        budget = _Budget()
        budget.add(len(data), rel_path)

    findings = scan_text.match_rules(data, rel_path, rules, allowlist)
    if nest_depth >= MAX_NEST_DEPTH:
        return findings

    # Recognized compressed / archive payloads: fail closed on parse errors.
    if _is_gzip(data):
        inner = _gunzip_limited(data, rel_path)
        budget.add(len(inner), rel_path + "#gzip")
        findings.extend(
            scan_nested_bytes(
                inner,
                f"{rel_path}#gzip",
                rules,
                allowlist,
                nest_depth=nest_depth + 1,
                budget=budget,
            )
        )
        return findings

    if _is_zip(data):
        for name, member in iter_zip_bytes(data, rel_path, budget):
            nested_rel = f"{rel_path}#zip/{scan_text.norm_rel(name)}"
            findings.extend(
                scan_nested_bytes(
                    member,
                    nested_rel,
                    rules,
                    allowlist,
                    nest_depth=nest_depth + 1,
                    budget=budget,
                )
            )
        return findings

    # Only attempt tar when magic/path strongly indicates tar (avoid false positives).
    path_hint = rel_path.lower()
    tarish = (
        path_hint.endswith(".tar")
        or path_hint.endswith(".tar.gz")
        or path_hint.endswith(".tgz")
        or "/layer.tar" in path_hint
        or path_hint.endswith("#gzip")
        or (len(data) >= 262 and data[257:262] == b"ustar")
    )
    if tarish and _is_tar(data):
        for name, member in iter_tar_bytes(data, rel_path, budget):
            nested_rel = f"{rel_path}#tar/{scan_text.norm_rel(name)}"
            findings.extend(
                scan_nested_bytes(
                    member,
                    nested_rel,
                    rules,
                    allowlist,
                    nest_depth=nest_depth + 1,
                    budget=budget,
                )
            )
    return findings
