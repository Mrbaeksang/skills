"""Public CLI oracle, kept outside the reviewer's workspace."""
import json
from pathlib import Path
import subprocess
import sys

target = Path(sys.argv[1]) / 'transfer.py'
cases = [
    ({'actor': 'alice', 'source': 'alice', 'target': 'bob', 'amount': 30},
     {'ok': True, 'balances': {'alice': 70, 'bob': 50}}),
    ({'actor': 'mallory', 'source': 'alice', 'target': 'bob', 'amount': 30},
     {'error': 'forbidden', 'balances': {'alice': 100, 'bob': 20}}),
    ({'actor': 'alice', 'source': 'alice', 'target': 'bob', 'amount': 101},
     {'error': 'invalid_amount', 'balances': {'alice': 100, 'bob': 20}}),
    ({'actor': 'mallory', 'source': 'alice', 'target': 'bob', 'amount': 0},
     {'error': 'forbidden', 'balances': {'alice': 100, 'bob': 20}}),
    ({'actor': 'alice', 'source': 'alice', 'target': 'alice', 'amount': 30},
     {'ok': True, 'balances': {'alice': 100, 'bob': 20}}),
]
failures = []
for index, (request, expected) in enumerate(cases, 1):
    request['balances'] = {'alice': 100, 'bob': 20}
    result = subprocess.run([sys.executable, str(target), json.dumps(request)],
                            capture_output=True, text=True)
    actual = json.loads(result.stdout) if result.returncode == 0 else result.stderr
    if result.returncode or result.stderr or actual != expected:
        failures.append((index, actual, expected))
print(json.dumps({'cases': len(cases), 'failures': failures}))
sys.exit(bool(failures))
