"""Public process tests for the Quote CLI: real exit code, stdout, and stderr."""

import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

CLI = Path(__file__).resolve().parent / "quote.py"
ERROR = {"error": "INVALID_WEIGHT", "retryable": False}


def run_cli(*args, cwd=None):
    return subprocess.run(
        [sys.executable, "-B", str(CLI), *args],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        cwd=cwd,
        timeout=30,
    )


class QuoteCliTest(unittest.TestCase):
    def assert_quote(self, result, total):
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.strip(), json.dumps({"total": total}, separators=(",", ":")))
        self.assertEqual(result.stderr, "")

    def assert_invalid(self, result):
        self.assertEqual(result.returncode, 2, result.stdout)
        self.assertEqual(result.stdout, "")
        self.assertEqual(json.loads(result.stderr), ERROR)
        self.assertNotIn("Traceback", result.stderr)
        self.assertNotIn(CLI.name, result.stderr)
        self.assertNotIn(str(CLI.parent), result.stderr)

    def test_r1_weight_one_returns_json_total(self):
        self.assert_quote(run_cli("1"), 5000)

    def test_r2_every_valid_weight_uses_its_price_band(self):
        expected = {1: 5000, 2: 5000, 3: 5000, 4: 5000, 5: 5000,
                    6: 8000, 7: 8000, 8: 8000, 9: 8000, 10: 8000}
        for weight, total in expected.items():
            with self.subTest(weight=weight):
                self.assert_quote(run_cli(str(weight)), total)

    def test_r3_invalid_weights_return_safe_json_error(self):
        huge = "9" * 5000  # Exceeds Python's default int-string conversion limit.
        for value in ("0", "11", "-1", "1.5", "5.0", "abc", "", " 5", "+5", "1_0", "١", huge):
            with self.subTest(value=value[:10]):
                self.assert_invalid(run_cli(value))

    def test_r3_missing_argument_returns_safe_json_error(self):
        self.assert_invalid(run_cli())

    def test_r3_extra_argument_returns_safe_json_error(self):
        self.assert_invalid(run_cli("1", "2"))

    def test_r4_success_follows_failure_without_writing_state(self):
        with tempfile.TemporaryDirectory() as workdir:
            self.assert_invalid(run_cli("11", cwd=workdir))
            self.assert_quote(run_cli("1", cwd=workdir), 5000)
            self.assertEqual(list(Path(workdir).iterdir()), [])


if __name__ == "__main__":
    unittest.main()
