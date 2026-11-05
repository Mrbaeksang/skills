"""Stateless shipping quote CLI: python quote.py WEIGHT"""

import json
import re
import sys


# Shipment domain: owns the weight rules, prices, and error meaning.
class InvalidWeight(Exception):
    code = "INVALID_WEIGHT"
    retryable = False


def quote_shipment(raw_weight):
    """Return the total for a weight given as ASCII digits."""
    # Limiting the length also keeps int() away from its huge-string ValueError.
    if not re.fullmatch(r"[0-9]{1,9}", raw_weight):
        raise InvalidWeight()
    weight = int(raw_weight)
    if 1 <= weight <= 5:
        return 5000
    if 6 <= weight <= 10:
        return 8000
    raise InvalidWeight()


# CLI adapter: maps argv and domain results to the process contract.
def main(argv):
    try:
        if len(argv) != 1:
            raise InvalidWeight()
        total = quote_shipment(argv[0])
    except InvalidWeight as error:
        body = {"error": error.code, "retryable": error.retryable}
        print(json.dumps(body, separators=(",", ":")), file=sys.stderr)
        return 2
    print(json.dumps({"total": total}, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
