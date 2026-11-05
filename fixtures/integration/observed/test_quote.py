"""Public process tests for the delivery quote CLI (see SPEC.md)."""

import json
import subprocess
import sys
import unittest
from pathlib import Path

QUOTE = Path(__file__).with_name("quote.py")
INVALID_WEIGHT = {"error": "INVALID_WEIGHT", "retryable": False}


def run_quote(*args):
    return subprocess.run(
        [sys.executable, str(QUOTE), *args],
        capture_output=True,
        encoding="utf-8",
        timeout=30,
    )


class ValidWeightTests(unittest.TestCase):
    """T-1: R-1, R-2."""

    def assert_total(self, weight, total):
        result = run_quote(weight)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout), {"total": total})
        self.assertEqual(result.stderr, "")

    def test_ac_1_weight_one_returns_5000(self):
        self.assert_total("1", 5000)

    def test_ac_2a_weight_five_is_last_lower_tier(self):
        self.assert_total("5", 5000)

    def test_ac_2b_weight_six_is_first_upper_tier(self):
        self.assert_total("6", 8000)

    def test_ac_2c_weight_ten_is_last_upper_tier(self):
        self.assert_total("10", 8000)


class InvalidWeightTests(unittest.TestCase):
    """T-2: R-3, R-4, R-5, R-6. AC-5a is asserted for every failure."""

    def assert_rejected(self, *args):
        result = run_quote(*args)
        self.assertEqual(result.returncode, 2, result.stderr)
        self.assertEqual(result.stdout, "")
        self.assertEqual(json.loads(result.stderr), INVALID_WEIGHT)
        self.assertNotIn("Traceback", result.stderr)

    def assert_each_rejected(self, weights):
        for weight in weights:
            with self.subTest(weight=weight[:20]):
                self.assert_rejected(weight)

    def test_ac_3_out_of_range(self):
        self.assert_each_rejected(["0", "11", "-1"])

    def test_ac_3_huge_digit_string_has_no_traceback(self):
        # int() raises ValueError above 4300 digits in Python 3.12.
        self.assert_each_rejected(["9" * 5000])

    def test_ac_4a_non_integer(self):
        self.assert_each_rejected(["abc", "1.5", ""])

    def test_ac_4b_missing_argument(self):
        self.assert_rejected()

    def test_ac_4c_non_canonical_integer_a1(self):
        self.assert_each_rejected([" 1", "+1", "01", "1_0", "1\n", "٣"])

    def test_ac_4d_extra_argument_a2(self):
        self.assert_rejected("1", "2")

    def test_ac_6_valid_run_succeeds_after_failure(self):
        self.assert_rejected("0")
        result = run_quote("1")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(json.loads(result.stdout), {"total": 5000})


if __name__ == "__main__":
    unittest.main()
