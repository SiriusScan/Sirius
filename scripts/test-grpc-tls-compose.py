#!/usr/bin/env python3
"""Offline Compose TLS contract test. Never starts containers or reads secrets."""
import json
import os
from pathlib import Path
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
CERT_TARGET = "/run/sirius/tls/server-chain.pem"
KEY_TARGET = "/run/sirius/tls/server-key.pem"


def check(condition, message):
    if not condition:
        raise AssertionError(message)


with tempfile.TemporaryDirectory(prefix="sirius-compose-tls-") as scratch:
    # Allowlist environment: do not inherit .env, Docker contexts, credentials,
    # or production configuration. `config` only renders; it needs no daemon.
    env = {
        "PATH": os.environ.get("PATH", "/usr/bin:/bin"),
        "HOME": scratch,
        "COMPOSE_DISABLE_ENV_FILE": "1",
        "POSTGRES_PASSWORD": "synthetic-config-only",
        "NEXTAUTH_SECRET": "synthetic-config-only",
        "INITIAL_ADMIN_PASSWORD": "synthetic-config-only",
        "DATABASE_URL": "postgresql://synthetic:synthetic@localhost/synthetic",
        # Ambient runtime names must not bypass the secure Compose contract.
        "GRPC_TRANSPORT": "insecure-loopback",
        "GRPC_TLS_CERT_FILE": "/wrong/ambient.pem",
        "GRPC_TLS_KEY_FILE": "/wrong/ambient.key",
    }
    overlays = [None, "prod", "dev", "build"]
    for custom in (False, True):
        run_env = dict(env)
        cert = ROOT / "secrets/grpc/server-chain.pem"
        key = ROOT / "secrets/grpc/server-key.pem"
        if custom:
            # Paths only. No certificate, key or secret contents are created.
            cert = Path(scratch) / "custom cert.pem"
            key = Path(scratch) / "custom key.pem"
            run_env["SIRIUS_GRPC_TLS_CERT_FILE"] = str(cert)
            run_env["SIRIUS_GRPC_TLS_KEY_FILE"] = str(key)
        for overlay in overlays:
            command = ["docker", "compose", "--env-file", "/dev/null", "-p", "tls-config-test", "-f", str(ROOT / "docker-compose.yaml")]
            if overlay:
                command += ["-f", str(ROOT / f"docker-compose.{overlay}.yaml")]
            command += ["config", "--format", "json"]
            result = subprocess.run(command, cwd=scratch, env=run_env, capture_output=True, text=True, check=True)
            engine = json.loads(result.stdout)["services"]["sirius-engine"]
            runtime = engine["environment"]
            check(runtime["GRPC_TRANSPORT"] == "tls", "network gRPC transport was downgraded")
            check(runtime["GRPC_TLS_CERT_FILE"] == CERT_TARGET, "certificate container path drift")
            check(runtime["GRPC_TLS_KEY_FILE"] == KEY_TARGET, "key container path drift")
            mounts = {mount["target"]: mount for mount in engine["volumes"]}
            for target, source in [(CERT_TARGET, cert), (KEY_TARGET, key)]:
                mount = mounts[target]
                check(mount["type"] == "bind", "TLS file is not a bind mount")
                check(mount["source"] == str(source), "TLS source path drift")
                check(mount.get("read_only") is True, "TLS files must be read-only")
                # Some Compose versions omit the false value when normalizing.
                check(mount.get("bind", {}).get("create_host_path", False) is False, "missing TLS files must not be auto-created")
            check(any(secret["source"] == "sirius_api_key" for secret in engine["secrets"]), "existing API secret removed")
            if overlay == "dev":
                check("/app-agent" in mounts, "development source mount removed by TLS mounts")
            label = overlay or "base"
            mode = "custom" if custom else "default"
            print(f"PASS TLS Compose {label} ({mode} host paths)")
