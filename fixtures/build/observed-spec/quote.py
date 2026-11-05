"""Stateless delivery quote CLI."""

import json
import re
import sys


# Shipment domain: owns weight validation and price.
class InvalidWeight(ValueError):
    """The shipment weight is not an integer from 1 to 10."""


def shipment_total(raw_weight):
    if not re.fullmatch(r"[0-9]+", raw_weight):
        raise InvalidWeight
    try:
        weight = int(raw_weight)
    except ValueError as error:  # Python's integer digit limit was exceeded.
        raise InvalidWeight from error
    if 1 <= weight <= 5:
        return 5000
    if 6 <= weight <= 10:
        return 8000
    raise InvalidWeight


# CLI adapter: owns JSON and exit mapping.
def main(args):
    try:
        if len(args) != 1:
            raise InvalidWeight
        total = shipment_total(args[0])
    except InvalidWeight:
        print('{"error":"INVALID_WEIGHT","retryable":false}', file=sys.stderr)
        return 2
    print(json.dumps({"total": total}))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
