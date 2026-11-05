"""Independent acceptance probe: run the generated CLI, never import its internals."""
import argparse
import json
from pathlib import Path
import subprocess
import sys


def verify(workspace):
    cases = [(['1'], 0, {'total': 5000}), (['5'], 0, {'total': 5000}),
             (['6'], 0, {'total': 8000}), (['10'], 0, {'total': 8000}),
             (['0'], 2, {'error': 'INVALID_WEIGHT', 'retryable': False}),
             (['11'], 2, {'error': 'INVALID_WEIGHT', 'retryable': False}),
             (['1.5'], 2, {'error': 'INVALID_WEIGHT', 'retryable': False}),
             (['no'], 2, {'error': 'INVALID_WEIGHT', 'retryable': False}),
             ([], 2, {'error': 'INVALID_WEIGHT', 'retryable': False}),
             (['6'], 0, {'total': 8000})]
    for args, expected_exit, expected_json in cases:
        result = subprocess.run([sys.executable, '-B', 'quote.py', *args], cwd=workspace,
                                capture_output=True, text=True, timeout=15)
        assert result.returncode == expected_exit, (args, result.returncode, result.stderr)
        assert json.loads(result.stdout if expected_exit == 0 else result.stderr) == expected_json, args
        assert (result.stderr if expected_exit == 0 else result.stdout) == '', args
    print(f'PASS: {len(cases)} public CLI calls including failure then recovery')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('workspace', type=Path)
    verify(parser.parse_args().workspace.resolve())
