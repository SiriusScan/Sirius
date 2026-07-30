#!/usr/bin/env python3
"""Bounded nested content inspection for gzip/zip/tar payloads (stdlib only).

Image/OCI layers stream gzip→tar without buffering full decompressed archives.
Ordinary source scans treat nested detection as opportunistic: malformed magic
keeps raw-byte findings and does not fail the whole scan. Explicit archive/image
modes remain fail-closed.
"""

from __future__ import annotations

import gzip
import io
import struct
import tarfile
import tempfile
import zipfile
from typing import BinaryIO, List, Optional, Sequence

import scan_text

# Small members may be fully buffered for nested recursion.
MAX_BUFFERED_MEMBER = 32 * 1024 * 1024
# Realistic total uncompressed scan budget (GiB-level) per top-level scan root.
MAX_TOTAL_BYTES = 4 * 1024 * 1024 * 1024
MAX_MEMBERS = 200_000
MAX_NEST_DEPTH = 5
CHUNK_SIZE = 1024 * 1024
CHUNK_OVERLAP = 64 * 1024

# Back-compat aliases used by other modules/tests.
MAX_MEMBER_BYTES = MAX_BUFFERED_MEMBER


class ArchiveSafetyError(Exception):
    pass


class _Budget:
    def __init__(self, limit: int = MAX_TOTAL_BYTES) -> None:
        self.total = 0
        self.members = 0
        self.limit = limit

    def add_member(self, label: str) -> None:
        self.members += 1
        if self.members > MAX_MEMBERS:
            raise ArchiveSafetyError(f"too many nested members near {label}")

    def add_bytes(self, n: int, label: str) -> None:
        if n < 0:
            raise ArchiveSafetyError(f"negative budget add near {label}")
        self.total += n
        if self.total > self.limit:
            raise ArchiveSafetyError(
                f"uncompressed scan budget exceeded near {label} "
                f"({self.total} > {self.limit})"
            )


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


def _looks_tar_header(head: bytes) -> bool:
    if len(head) < 262:
        return False
    if head[257:262] == b"ustar":
        return True
    return False


def _reject_link(member: tarfile.TarInfo) -> None:
    link = member.linkname or ""
    name = member.name or ""
    if (
        ".." in name.replace("\\", "/")
        or ".." in link.replace("\\", "/")
        or link.startswith("/")
        or name.startswith("/")
    ):
        raise ArchiveSafetyError(f"dangerous link in archive: {name} -> {link}")
    raise ArchiveSafetyError(f"link member forbidden in nested archive: {name}")


def _prefer_tar_path(rel_path: str) -> bool:
    # Only the current leaf segment (after the last nest marker) decides tar-ishness.
    # Otherwise parent names like "layer.tar#tar/etc/issue" falsely force tar parsing.
    leaf = rel_path.split("#")[-1].lower()
    base = leaf.rsplit("/", 1)[-1]
    return (
        base.endswith(".tar")
        or base.endswith(".tar.gz")
        or base.endswith(".tgz")
        or base == "layer.tar"
        or leaf.endswith("/layer.tar")
    )


def _opportunistic_exc(exc: BaseException) -> bool:
    return isinstance(
        exc,
        (
            ArchiveSafetyError,
            OSError,
            EOFError,
            tarfile.TarError,
            zipfile.BadZipFile,
            zipfile.LargeZipFile,
            ValueError,
            struct.error,
        ),
    )


class _ChainReader(io.RawIOBase):
    """Readable stream that yields prefix bytes then delegates to an underlying reader."""

    def __init__(self, prefix: bytes, rest: BinaryIO) -> None:
        super().__init__()
        self._prefix = prefix
        self._rest = rest
        self._pos = 0

    def readable(self) -> bool:
        return True

    def read(self, size: int = -1) -> bytes:  # type: ignore[override]
        if size == 0:
            return b""
        if self._pos < len(self._prefix):
            if size < 0:
                out = self._prefix[self._pos :]
                self._pos = len(self._prefix)
                more = self._rest.read(-1) or b""
                return out + more
            take = self._prefix[self._pos : self._pos + size]
            self._pos += len(take)
            if len(take) == size:
                return take
            more = self._rest.read(size - len(take)) or b""
            return take + more
        if size < 0:
            return self._rest.read(-1) or b""
        return self._rest.read(size) or b""


def scan_stream_chunks(
    fh: BinaryIO,
    rel_path: str,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    budget: _Budget,
    *,
    chunk_size: int = CHUNK_SIZE,
    overlap: int = CHUNK_OVERLAP,
) -> List[str]:
    """Stream-scan a readable binary stream with overlap for boundary-spanning markers."""
    findings: List[str] = []
    prev = b""
    while True:
        chunk = fh.read(chunk_size)
        if not chunk:
            break
        budget.add_bytes(len(chunk), rel_path)
        window = prev + chunk
        findings.extend(scan_text.match_rules(window, rel_path, rules, allowlist))
        if len(window) > overlap:
            prev = window[-overlap:]
        else:
            prev = window
    return findings


def _scan_tar_stream(
    fh: BinaryIO,
    rel_path: str,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    budget: _Budget,
    *,
    nest_depth: int,
    strict: bool,
    stream_mode: bool,
) -> List[str]:
    findings: List[str] = []
    mode = "r|" if stream_mode else "r:*"
    try:
        with tarfile.open(fileobj=fh, mode=mode) as tf:
            for member in tf:
                if member.issym() or member.islnk():
                    _reject_link(member)
                if not member.isfile():
                    continue
                _validate_member_name(member.name)
                nested_rel = f"{rel_path}#tar/{scan_text.norm_rel(member.name)}"
                budget.add_member(nested_rel)

                extracted = tf.extractfile(member)
                if extracted is None:
                    continue

                size = int(member.size)
                if size < 0:
                    raise ArchiveSafetyError(f"negative tar size for {member.name}")

                if size > MAX_BUFFERED_MEMBER:
                    findings.extend(
                        scan_stream_chunks(
                            extracted, nested_rel, rules, allowlist, budget
                        )
                    )
                    continue

                blob = extracted.read(MAX_BUFFERED_MEMBER + 1)
                if len(blob) > MAX_BUFFERED_MEMBER:
                    raise ArchiveSafetyError(f"expanded member too large: {member.name}")
                if size != len(blob):
                    raise ArchiveSafetyError(
                        f"declared/actual size mismatch for {member.name}"
                    )
                budget.add_bytes(len(blob), nested_rel)
                findings.extend(
                    scan_nested_bytes(
                        blob,
                        nested_rel,
                        rules,
                        allowlist,
                        nest_depth=nest_depth + 1,
                        budget=budget,
                        strict=strict,
                    )
                )
    except tarfile.TarError as exc:
        raise ArchiveSafetyError(f"tar parse failed at {rel_path}: {exc}") from exc
    return findings


def _scan_gzip_payload(
    fh: BinaryIO,
    rel_path: str,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    budget: _Budget,
    *,
    nest_depth: int,
    strict: bool,
    prefer_tar: bool,
) -> List[str]:
    try:
        gz = gzip.GzipFile(fileobj=fh, mode="rb")
    except OSError as exc:
        raise ArchiveSafetyError(f"gzip parse failed at {rel_path}: {exc}") from exc

    try:
        head = gz.read(512)
    except OSError as exc:
        raise ArchiveSafetyError(f"gzip parse failed at {rel_path}: {exc}") from exc

    rest = _ChainReader(head, gz)
    gzip_rel = f"{rel_path}#gzip"

    if prefer_tar or _looks_tar_header(head):
        return _scan_tar_stream(
            rest,
            gzip_rel,
            rules,
            allowlist,
            budget,
            nest_depth=nest_depth,
            strict=strict,
            stream_mode=True,
        )

    return scan_stream_chunks(rest, gzip_rel, rules, allowlist, budget)


def _scan_zip_bytes(
    data: bytes,
    rel_path: str,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    budget: _Budget,
    *,
    nest_depth: int,
    strict: bool,
) -> List[str]:
    findings: List[str] = []
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as zf:
            for info in zf.infolist():
                if info.is_dir():
                    continue
                findings.extend(
                    _scan_zip_member(
                        zf,
                        info,
                        rel_path,
                        rules,
                        allowlist,
                        budget,
                        nest_depth=nest_depth,
                        strict=strict,
                    )
                )
    except zipfile.BadZipFile as exc:
        raise ArchiveSafetyError(f"zip parse failed at {rel_path}: {exc}") from exc
    return findings


def _scan_zip_member(
    zf: zipfile.ZipFile,
    info: zipfile.ZipInfo,
    rel_base: str,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    budget: _Budget,
    *,
    nest_depth: int,
    strict: bool,
) -> List[str]:
    name = info.filename
    _validate_member_name(name)
    mode = (info.external_attr >> 16) & 0o170000
    if mode == 0o120000:
        raise ArchiveSafetyError(f"symlink member forbidden: {name}")
    nested_rel = f"{rel_base}#zip/{scan_text.norm_rel(name)}"
    budget.add_member(nested_rel)

    try:
        fh = zf.open(info, "r")
    except (zipfile.BadZipFile, RuntimeError, OSError) as exc:
        raise ArchiveSafetyError(f"zip member read failed for {name}: {exc}") from exc

    with fh:
        if info.file_size > MAX_BUFFERED_MEMBER:
            return scan_stream_chunks(fh, nested_rel, rules, allowlist, budget)
        data = fh.read(MAX_BUFFERED_MEMBER + 1)

    if len(data) > MAX_BUFFERED_MEMBER:
        raise ArchiveSafetyError(f"expanded member too large: {name}")
    if info.file_size != len(data):
        raise ArchiveSafetyError(
            f"declared/actual size mismatch for {name}: "
            f"declared={info.file_size} actual={len(data)}"
        )
    budget.add_bytes(len(data), nested_rel)
    return scan_nested_bytes(
        data,
        nested_rel,
        rules,
        allowlist,
        nest_depth=nest_depth + 1,
        budget=budget,
        strict=strict,
    )


def scan_nested_bytes(
    data: bytes,
    rel_path: str,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    *,
    nest_depth: int = 0,
    budget: Optional[_Budget] = None,
    strict: bool = True,
) -> List[str]:
    if budget is None:
        budget = _Budget()

    # Raw-byte findings first (including NUL binaries / large blobs).
    if len(data) > MAX_BUFFERED_MEMBER:
        findings = scan_stream_chunks(
            io.BytesIO(data), rel_path, rules, allowlist, budget
        )
    else:
        budget.add_bytes(len(data), rel_path)
        findings = scan_text.match_rules(data, rel_path, rules, allowlist)

    if nest_depth >= MAX_NEST_DEPTH:
        return findings

    prefer_tar = _prefer_tar_path(rel_path)

    try:
        if _is_gzip(data):
            findings.extend(
                _scan_gzip_payload(
                    io.BytesIO(data),
                    rel_path,
                    rules,
                    allowlist,
                    budget,
                    nest_depth=nest_depth,
                    strict=strict,
                    prefer_tar=prefer_tar,
                )
            )
            return findings

        if _is_zip(data):
            findings.extend(
                _scan_zip_bytes(
                    data,
                    rel_path,
                    rules,
                    allowlist,
                    budget,
                    nest_depth=nest_depth,
                    strict=strict,
                )
            )
            return findings

        tarish = prefer_tar or _looks_tar_header(data[:512] if len(data) >= 512 else data)
        if tarish:
            findings.extend(
                _scan_tar_stream(
                    io.BytesIO(data),
                    rel_path,
                    rules,
                    allowlist,
                    budget,
                    nest_depth=nest_depth,
                    strict=strict,
                    stream_mode=False,
                )
            )
    except Exception as exc:  # noqa: BLE001 - opportunistic fallback is intentional
        if strict or not _opportunistic_exc(exc):
            if isinstance(exc, ArchiveSafetyError):
                raise
            raise ArchiveSafetyError(f"nested parse failed at {rel_path}: {exc}") from exc
        return findings

    return findings


def scan_nested_fileobj(
    fh: BinaryIO,
    rel_path: str,
    rules: Sequence[scan_text.Rule],
    allowlist: Sequence[str],
    *,
    nest_depth: int = 0,
    budget: Optional[_Budget] = None,
    strict: bool = True,
) -> List[str]:
    """Scan a file object using spooling/streaming (no multi-hundred-MiB RAM buffer)."""
    if budget is None:
        budget = _Budget()

    # Ensure seekable backing store without holding the whole blob in RAM.
    if not (hasattr(fh, "seek") and hasattr(fh, "tell")):
        spool: BinaryIO = tempfile.SpooledTemporaryFile(max_size=8 * 1024 * 1024)
        while True:
            chunk = fh.read(CHUNK_SIZE)
            if not chunk:
                break
            spool.write(chunk)
        spool.seek(0)
        fh = spool

    head = fh.read(512)
    fh.seek(0)

    # Raw findings via streaming (counts compressed/raw blob bytes once).
    findings = scan_stream_chunks(fh, rel_path, rules, allowlist, budget)
    fh.seek(0)

    if nest_depth >= MAX_NEST_DEPTH:
        return findings

    prefer_tar = _prefer_tar_path(rel_path)

    try:
        if _is_gzip(head):
            findings.extend(
                _scan_gzip_payload(
                    fh,
                    rel_path,
                    rules,
                    allowlist,
                    budget,
                    nest_depth=nest_depth,
                    strict=strict,
                    prefer_tar=prefer_tar,
                )
            )
            return findings

        if _is_zip(head):
            with zipfile.ZipFile(fh) as zf:
                for info in zf.infolist():
                    if info.is_dir():
                        continue
                    findings.extend(
                        _scan_zip_member(
                            zf,
                            info,
                            rel_path,
                            rules,
                            allowlist,
                            budget,
                            nest_depth=nest_depth,
                            strict=strict,
                        )
                    )
            return findings

        if prefer_tar or _looks_tar_header(head):
            findings.extend(
                _scan_tar_stream(
                    fh,
                    rel_path,
                    rules,
                    allowlist,
                    budget,
                    nest_depth=nest_depth,
                    strict=strict,
                    stream_mode=False,
                )
            )
    except Exception as exc:  # noqa: BLE001
        if strict or not _opportunistic_exc(exc):
            if isinstance(exc, ArchiveSafetyError):
                raise
            raise ArchiveSafetyError(f"nested parse failed at {rel_path}: {exc}") from exc
        return findings

    return findings


def _read_zip_member(zf: zipfile.ZipFile, info: zipfile.ZipInfo) -> bytes:
    """Buffered zip read for small members (explicit archive mode helpers)."""
    name = info.filename
    _validate_member_name(name)
    mode = (info.external_attr >> 16) & 0o170000
    if mode == 0o120000:
        raise ArchiveSafetyError(f"symlink member forbidden: {name}")
    if info.file_size > MAX_BUFFERED_MEMBER:
        raise ArchiveSafetyError(
            f"member requires streaming extract: {name} ({info.file_size})"
        )
    try:
        with zf.open(info, "r") as fh:
            data = fh.read(MAX_BUFFERED_MEMBER + 1)
    except (zipfile.BadZipFile, RuntimeError, OSError) as exc:
        raise ArchiveSafetyError(f"zip member read failed for {name}: {exc}") from exc
    if len(data) > MAX_BUFFERED_MEMBER:
        raise ArchiveSafetyError(f"expanded member too large: {name}")
    if info.file_size != len(data):
        raise ArchiveSafetyError(
            f"declared/actual size mismatch for {name}: "
            f"declared={info.file_size} actual={len(data)}"
        )
    return data
