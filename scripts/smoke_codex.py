"""Exercise native installation in a temporary CODEX_HOME, without copying authentication."""
import hashlib
import json
import os
import pathlib
import shutil
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]


def protected_inventory(home):
    paths = [home / 'config.toml', home / 'AGENTS.md']
    paths += list((home / 'plugins').rglob('*'))
    return {str(p.relative_to(home)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in paths if p.is_file()}


def main():
    original = pathlib.Path(os.environ.get('CODEX_HOME', pathlib.Path.home() / '.codex'))
    before = protected_inventory(original)
    with tempfile.TemporaryDirectory(prefix='skills-codex-') as directory:
        root = pathlib.Path(directory)
        market = root / 'market'
        shutil.copytree(ROOT / 'plugins', market / 'plugins')
        shutil.copytree(ROOT / '.agents', market / '.agents')
        env = dict(os.environ, CODEX_HOME=str(root / 'home'))
        (root / 'home').mkdir()
        def run(*args):
            result = subprocess.run(['codex', 'plugin', *args, '--json'], env=env,
                                    capture_output=True, text=True, encoding='utf-8')
            if result.returncode:
                raise RuntimeError(result.stderr)
            return json.loads(result.stdout)
        run('marketplace', 'add', str(market))
        installed = run('add', 'skills@baeksang-skills')
        cached = pathlib.Path(installed['installedPath'])
        assert (cached / 'skills/spec/references/execution-contract.md').read_bytes() == (ROOT / 'common/execution-contract.md').read_bytes()
        assert run('list', '--marketplace', 'baeksang-skills')['installed'][0]['enabled']
        manifest = market / 'plugins/skills/.codex-plugin/plugin.json'
        data = json.loads(manifest.read_text())
        data['version'] = '0.1.1'
        manifest.write_text(json.dumps(data), encoding='utf-8')
        updated = run('add', 'skills@baeksang-skills')
        assert updated['version'] == '0.1.1'
        assert json.loads((pathlib.Path(updated['installedPath']) / '.codex-plugin/plugin.json').read_text())['version'] == '0.1.1'
        run('remove', 'skills@baeksang-skills')
        assert not run('list', '--marketplace', 'baeksang-skills')['installed']
        reinstalled = run('add', 'skills@baeksang-skills')
        assert reinstalled['version'] == '0.1.1'
        run('remove', 'skills@baeksang-skills')
        assert not pathlib.Path(reinstalled['installedPath']).exists()
        assert not run('list', '--marketplace', 'baeksang-skills')['installed']
        run('marketplace', 'remove', 'baeksang-skills')
    assert before == protected_inventory(original), 'Original user state changed'
    print(json.dumps({'install': 'PASS', 'cache_contract': 'PASS', 'update': 'PASS',
                      'reinstall': 'PASS', 'remove': 'PASS', 'protected_files': len(before),
                      'original_state_preserved': True, 'runtime': 'NOTRUN'}))


if __name__ == '__main__':
    main()
