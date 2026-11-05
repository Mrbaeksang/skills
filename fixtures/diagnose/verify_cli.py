"""Independent process-level oracle; accepts buggy or corrected artifact directory."""
import json
from pathlib import Path
import subprocess
import sys


def verify(directory):
    script = Path(directory).resolve() / 'quote.py'
    cases = [(['0'], 0, 3000), (['49999'], 49999, 3000),
             (['50000'], 50000, 0), (['50001'], 50001, 0),
             (['100000'], 100000, 0)]
    for args, subtotal, fee in cases:
        result = subprocess.run([sys.executable, str(script), *args],
                                capture_output=True, text=True, timeout=10)
        assert result.returncode == 0 and result.stderr == '', result
        assert json.loads(result.stdout) == {
            'subtotal': subtotal, 'shipping': fee, 'total': subtotal + fee
        }, (args, result.stdout)
    for args in [[], ['-1'], ['bad'], ['1.5'], ['1', '2']]:
        result = subprocess.run([sys.executable, str(script), *args],
                                capture_output=True, text=True, timeout=10)
        assert result.returncode == 2 and result.stdout == '', result
        assert 'error' in json.loads(result.stderr), result
    print('PASS: 10 public CLI cases (normal, boundary, invalid input)')


if __name__ == '__main__':
    verify(sys.argv[1])
