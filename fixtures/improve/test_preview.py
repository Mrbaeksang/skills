import unittest
from app import preview

class PreviewContract(unittest.TestCase):
    def test_order_and_report(self):
        self.assertEqual(preview([("sku-0", 2), ("sku-1999", 1)]), {"total": 2002, "report": [{"sku": "sku-0", "value": 2}, {"sku": "sku-1999", "value": 2000}]})
    def test_empty(self):
        self.assertEqual(preview([]), {"total": 0, "report": []})
    def test_unknown_then_recovery(self):
        with self.assertRaises(ValueError):
            preview([("missing", 1)])
        self.assertEqual(preview([("sku-0", 1)])["total"], 1)
    def test_unhashable_unknown_sku(self):
        with self.assertRaises(ValueError):
            preview([([], 1)])

if __name__ == "__main__":
    unittest.main()
