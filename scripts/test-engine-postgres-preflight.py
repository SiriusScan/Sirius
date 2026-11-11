#!/usr/bin/env python3
"""Test the engine PostgreSQL preflight with fake clients and no live services.

Run: python3 scripts/test-engine-postgres-preflight.py
"""
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "sirius-engine/start-enhanced.sh").read_text()
# Extract only the function under test. Sourcing the entrypoint would read
# secrets and start services; this harness must never execute its top level.
START = SOURCE.index("validate_postgres_connection() {\n")
END = SOURCE.index("\n}\n", START) + len("\n}\n")
PREFLIGHT = SOURCE[START:END] + "\nvalidate_postgres_connection\n"

FAKE_PSQL = """#!/bin/sh
printf '%s\\n' "$@" >> "$TEST_ARGS"
printf '%s\\n' "$PGPASSWORD" >> "$TEST_PASSWORDS"
count=0
if [ -f "$TEST_CALLS" ]; then read -r count < "$TEST_CALLS"; fi
count=$((count + 1))
printf '%s\\n' "$count" > "$TEST_CALLS"
[ "$count" -gt "$FAKE_FAILURES" ]
"""
FAKE_SLEEP = """#!/bin/sh
printf '%s\\n' "$@" >> "$TEST_SLEEPS"
"""


class PostgresPreflightTests(unittest.TestCase):
    def run_preflight(self, port=None, failures=0):
        with tempfile.TemporaryDirectory(prefix="engine-postgres-preflight-") as scratch:
            temp = Path(scratch)
            for name, source in (("psql", FAKE_PSQL), ("sleep", FAKE_SLEEP)):
                target = temp / name
                target.write_text(source)
                target.chmod(0o700)
            paths = {name: temp / name.lower() for name in (
                "TEST_ARGS", "TEST_PASSWORDS", "TEST_CALLS", "TEST_SLEEPS"
            )}
            # No inherited credentials, PG service files, startup files, or
            # executable PATH. Only our fake psql and sleep can be invoked.
            env = {
                "PATH": scratch,
                "HOME": scratch,
                "POSTGRES_HOST": "synthetic.invalid",
                "POSTGRES_USER": "synthetic-user",
                "POSTGRES_PASSWORD": "synthetic-password",
                "POSTGRES_DB": "synthetic-database",
                "PGPORT": "6432",
                "FAKE_FAILURES": str(failures),
                **{name: str(path) for name, path in paths.items()},
            }
            if port is not None:
                env["POSTGRES_PORT"] = port
            result = subprocess.run(
                ["/bin/bash", "--noprofile", "--norc", "-c", PREFLIGHT],
                cwd=scratch, env=env, text=True, capture_output=True, timeout=5,
            )
            logs = {name: path.read_text().splitlines() if path.exists() else []
                    for name, path in paths.items()}
            return result, logs

    def assert_connection(self, port, expected, failures=0):
        result, logs = self.run_preflight(port, failures)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        args = ["-h", "synthetic.invalid", "-p", expected,
                "-U", "synthetic-user", "-d", "synthetic-database", "-c", "SELECT 1"]
        self.assertEqual(logs["TEST_ARGS"], args * (failures + 1))
        self.assertEqual(logs["TEST_PASSWORDS"], ["synthetic-password"] * (failures + 1))
        self.assertEqual(logs["TEST_SLEEPS"], ["2"] * failures)
        self.assertIn("PostgreSQL connectivity validated.", result.stdout)

    def test_default_port_overrides_ambient_pgport(self):
        for port in (None, ""):
            with self.subTest(port=port):
                self.assert_connection(port, "5432")

    def test_configured_port_and_boundaries_override_ambient_pgport(self):
        for port in ("5432", "55432", "1", "65535", "05432"):
            with self.subTest(port=port):
                self.assert_connection(port, port)

    def test_invalid_ports_fail_before_client_or_retry(self):
        for port in ("0", "00000", "65536", "99999", "999999999999999999999",
                     "-1", "+5432", "54.32", "postgres", "5432,5433", " 5432", "5432 "):
            with self.subTest(port=port):
                result, logs = self.run_preflight(port)
                self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
                self.assertIn("POSTGRES_PORT", result.stdout)
                self.assertIn("1 and 65535", result.stdout)
                self.assertTrue(all(not value for value in logs.values()), logs)

    def test_transient_failure_retries_same_port(self):
        self.assert_connection("55432", "55432", failures=2)

    def test_exhausted_retries_fail_closed(self):
        result, logs = self.run_preflight("55432", failures=30)
        self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
        self.assertEqual(logs["TEST_CALLS"], ["30"])
        self.assertEqual(logs["TEST_SLEEPS"], ["2"] * 30)
        self.assertEqual(logs["TEST_ARGS"].count("55432"), 30)
        self.assertIn("unable to connect to PostgreSQL", result.stdout)


if __name__ == "__main__":
    unittest.main(verbosity=2)
