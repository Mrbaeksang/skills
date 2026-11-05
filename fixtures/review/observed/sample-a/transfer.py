"""In-memory transfer CLI; input is trusted JSON, no external service."""
import json
import sys


def transfer(request):
    balances = dict(request['balances'])
    source = request['source']
    target = request['target']
    amount = request['amount']
    if amount <= 0 or balances[source] < amount:
        return {'error': 'invalid_amount', 'balances': balances}
    balances[source] -= amount
    balances[target] += amount
    return {'ok': True, 'balances': balances}


if __name__ == '__main__':
    print(json.dumps(transfer(json.loads(sys.argv[1]))))
