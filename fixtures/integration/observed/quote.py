"""Stateless delivery quote CLI: python quote.py <weight>."""

import json
import re
import sys

# --- shipment: owns weight validation and pricing ---

_VALID_WEIGHT = re.compile(r"[1-9]|10")
_LOWER_TIER_MAX_WEIGHT = 5
_LOWER_TIER_TOTAL = 5000
_UPPER_TIER_TOTAL = 8000


class InvalidWeight(ValueError):
    """The weight is not an integer in the range 1..10."""


def shipment_total(raw_weight):
    """Return the total for a weight string; None means no single weight was given."""
    if raw_weight is None or not _VALID_WEIGHT.fullmatch(raw_weight):
        raise InvalidWeight
    if int(raw_weight) <= _LOWER_TIER_MAX_WEIGHT:
        return _LOWER_TIER_TOTAL
    return _UPPER_TIER_TOTAL


# --- CLI adapter: owns JSON and exit code translation ---


def _to_json(payload):
    return json.dumps(payload, separators=(",", ":"))


def main(args):
    raw_weight = args[0] if len(args) == 1 else None
    try:
        total = shipment_total(raw_weight)
    except InvalidWeight:
        print(_to_json({"error": "INVALID_WEIGHT", "retryable": False}), file=sys.stderr)
        return 2
    print(_to_json({"total": total}))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
