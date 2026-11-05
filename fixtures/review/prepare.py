"""Prepare fresh pinned review inputs without exposing the evaluation oracle."""
from pathlib import Path
import hashlib
import shutil
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[2]
destination = Path(sys.argv[1]).resolve()
if destination.exists():
    raise SystemExit('Destination exists; use a fresh directory')
destination.mkdir(parents=True)
base_source = (ROOT / 'fixtures/review/base/transfer.py').read_text(encoding='utf-8')
variants = {
    'sample-a': base_source.replace("    if request['actor'] != source:\n"
                                   "        return {'error': 'forbidden', 'balances': balances}\n", ''),
    'sample-b': base_source.replace("return {'ok': True, 'balances': balances}",
                                   'return dict(ok=True, balances=balances)'),
}
for name, source in variants.items():
    workspace = destination / name
    workspace.mkdir()
    def git(*args):
        return subprocess.check_output(['git', '-C', str(workspace), *args], text=True).strip()
    git('init', '-b', 'fixture')
    shutil.copyfile(ROOT / 'fixtures/review/spec.md', workspace / 'spec.md')
    (workspace / 'transfer.py').write_text(base_source, encoding='utf-8')
    git('add', '.')
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
        'commit', '-m', 'Base contract')
    base = git('rev-parse', 'HEAD')
    (workspace / 'transfer.py').write_text(source, encoding='utf-8')
    git('add', 'transfer.py')
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
        'commit', '-m', 'Change transfer implementation')
    head = git('rev-parse', 'HEAD')
    patch = git('diff', '--no-ext-diff', base, head, '--', 'transfer.py') + '\n'
    (workspace / 'change.diff').write_text(patch, encoding='utf-8')
    (workspace / 'base.py.txt').write_text(base_source, encoding='utf-8')
    spec_hash = hashlib.sha256((workspace / 'spec.md').read_bytes()).hexdigest()
    (workspace / 'scope.md').write_text(
        f'# Review scope\n\nTwo-tree diff: base `{base}` → head `{head}`.\n'
        f'Only changed file: transfer.py. spec.md SHA-256: `{spec_hash}`.\n'
        'base.py.txt is the base source; transfer.py is the head source.\n'
        'change.diff is the complete diff. Host verified these snapshots.\n'
        'Review source only: no execution, mutation, network or tracker access.\n', encoding='utf-8')
    subprocess.run([sys.executable, str(ROOT / 'scripts/package.py'), 'install',
                    '--dest', str(workspace / '.claude/skills')], check=True)
    print(f'{name}: {base}..{head}')
