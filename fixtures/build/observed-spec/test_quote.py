"""Use case tests that drive quote.py only through its public CLI process."""

import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPT = Path(__file__).resolve().with_name("quote.py")
INVALID_WEIGHT = {"error": "INVALID_WEIGHT", "retryable": False}
INVALID_WEIGHT_TEXT = '{"error":"INVALID_WEIGHT","retryable":false}'


def run_cli(*args, cwd=None):
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
        cwd=cwd,
        timeout=30,
    )


class ValidWeightTests(unittest.TestCase):
    def test_price_bands_and_boundaries(self):
        for weight, total in (("1", 5000), ("5", 5000), ("6", 8000), ("10", 8000)):
            with self.subTest(weight=weight):
                result = run_cli(weight)
                self.assertEqual(result.returncode, 0)
                self.assertEqual(json.loads(result.stdout), {"total": total})
                self.assertEqual(result.stderr, "")

    def test_weight_one_writes_the_specified_json_text(self):
        result = run_cli("1")
        self.assertEqual(result.stdout.strip(), '{"total": 5000}')


class InvalidWeightTests(unittest.TestCase):
    def assert_invalid(self, result):
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, "")
        # Exact comparison also proves that no traceback or path is exposed.
        self.assertEqual(result.stderr.strip(), INVALID_WEIGHT_TEXT)
        self.assertEqual(json.loads(result.stderr), INVALID_WEIGHT)

    def test_out_of_range_and_noninteger_values(self):
        values = (
            "0",
            "11",
            "-1",
            "+1",
            "1.5",
            "5.0",
            "1e0",
            "abc",
            "",
            " 5",
            "5\n",
            "1_0",
            "٣",  # Arabic-Indic digit accepted by int() but not a CLI integer.
            "9" * 5000,  # Exceeds Python's default int conversion digit limit.
        )
        for value in values:
            with self.subTest(value=value[:12]):
                self.assert_invalid(run_cli(value))

    def test_missing_weight(self):
        self.assert_invalid(run_cli())

    def test_unexpected_extra_argument_is_not_a_single_weight(self):
        self.assert_invalid(run_cli("1", "2"))


class StatelessTests(unittest.TestCase):
    def test_failure_then_valid_invocation_succeeds_without_files(self):
        with tempfile.TemporaryDirectory() as workdir:
            failed = run_cli("11", cwd=workdir)
            succeeded = run_cli("1", cwd=workdir)
            self.assertEqual(failed.returncode, 2)
            self.assertEqual(succeeded.returncode, 0)
            self.assertEqual(json.loads(succeeded.stdout), {"total": 5000})
            self.assertEqual(os.listdir(workdir), [])


if __name__ == "__main__":
    unittest.main()
