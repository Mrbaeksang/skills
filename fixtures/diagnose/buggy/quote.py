"""Shipping quote CLI: subtotal is a nonnegative integer in won."""
import json
import sys


def main():
    if len(sys.argv) != 2:
        print(json.dumps({"error": "usage"}), file=sys.stderr)
        return 2
    try:
        subtotal = int(sys.argv[1])
        if subtotal < 0:
            raise ValueError
    except ValueError:
        print(json.dumps({"error": "invalid subtotal"}), file=sys.stderr)
        return 2
    fee = 0 if subtotal > 50000 else 3000
    print(json.dumps({"subtotal": subtotal, "shipping": fee, "total": subtotal + fee}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
