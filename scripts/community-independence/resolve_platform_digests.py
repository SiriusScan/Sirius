#!/usr/bin/env python3
"""Resolve linux/amd64 and linux/arm64 child digests from an OCI/Docker index JSON."""

from __future__ import annotations

import argparse
import json
import sys
from typing import Dict, Optional


REQUIRED = ("linux/amd64", "linux/arm64")


def resolve_platforms(index: dict) -> Dict[str, str]:
    manifests = index.get("manifests")
    if not isinstance(manifests, list):
        raise ValueError("index missing manifests list")
    found: Dict[str, str] = {}
    for entry in manifests:
        if not isinstance(entry, dict):
            continue
        platform = entry.get("platform") or {}
        if not isinstance(platform, dict):
            continue
        os_name = platform.get("os")
        arch = platform.get("architecture")
        if not os_name or not arch:
            continue
        if os_name == "unknown" or arch == "unknown":
            continue
        key = f"{os_name}/{arch}"
        digest = entry.get("digest")
        if not isinstance(digest, str) or not digest.startswith("sha256:"):
            raise ValueError(f"invalid digest for platform {key}")
        if len(digest) != len("sha256:") + 64:
            raise ValueError(f"malformed digest for platform {key}")
        if key in found and found[key] != digest:
            raise ValueError(f"duplicate conflicting digests for {key}")
        found[key] = digest
    missing = [p for p in REQUIRED if p not in found]
    if missing:
        raise ValueError(f"missing required platforms: {', '.join(missing)}")
    return {p: found[p] for p in REQUIRED}


def main(argv: Optional[list] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--index-file",
        help="path to raw OCI index JSON (default: stdin)",
    )
    args = parser.parse_args(argv)
    try:
        if args.index_file:
            with open(args.index_file, encoding="utf-8") as fh:
                index = json.load(fh)
        else:
            index = json.load(sys.stdin)
        platforms = resolve_platforms(index)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1
    json.dump(platforms, sys.stdout, separators=(",", ":"))
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
