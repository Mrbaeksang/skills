"""Regression tests for the public quote.py CLI, run as a real process."""
import json
import subprocess
import sys
import unittest
from pathlib import Path

SCRIPT = Path(__file__).resolve().with_name("quote.py")


def run_cli(*args):
    return subprocess.run(
        [sys.executable, str(SCRIPT), *args],
        capture_output=True,
        text=True,
        timeout=30,
    )


class QuoteCliTest(unittest.TestCase):
    def assert_quote(self, arg, subtotal, shipping):
        result = run_cli(arg)
        self.assertEqual(result.returncode, 0)
        self.assertEqual(result.stderr, "")
        self.assertEqual(
            json.loads(result.stdout),
            {"subtotal": subtotal, "shipping": shipping, "total": subtotal + shipping},
        )

    def assert_error(self, args, error):
        result = run_cli(*args)
        self.assertEqual(result.returncode, 2)
        self.assertEqual(result.stdout, "")
        self.assertEqual(json.loads(result.stderr), {"error": error})

    def test_threshold_subtotal_ships_free(self):
        self.assert_quote("50000", 50000, 0)

    def test_equivalent_threshold_notations_ship_free(self):
        for arg in ("+50000", " 50000", "050000"):
            with self.subTest(arg=arg):
                self.assert_quote(arg, 50000, 0)

    def test_below_threshold_charges_shipping(self):
        for subtotal in (0, 1, 49999):
            with self.subTest(subtotal=subtotal):
                self.assert_quote(str(subtotal), subtotal, 3000)

    def test_above_threshold_ships_free(self):
        for subtotal in (50001, 1000000):
            with self.subTest(subtotal=subtotal):
                self.assert_quote(str(subtotal), subtotal, 0)

    def test_invalid_subtotal_is_rejected(self):
        for arg in ("-1", "abc", "1.5", "50000.0", ""):
            with self.subTest(arg=arg):
                self.assert_error([arg], "invalid subtotal")

    def test_wrong_argument_count_is_rejected(self):
        for args in ([], ["1", "2"]):
            with self.subTest(args=args):
                self.assert_error(args, "usage")


if __name__ == "__main__":
    unittest.main()
