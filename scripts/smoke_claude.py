"""Exercise Claude lifecycle in fresh state; optional shared-auth read-only invocation."""
import argparse
import hashlib
import json
import os
import pathlib
import shutil
import subprocess
import tempfile

from package import bundle

ROOT = pathlib.Path(__file__).resolve().parents[1]


def inventory(home):
    paths = [home / 'settings.json', home / 'CLAUDE.md']
    paths += [p for p in (home / 'plugins').rglob('*')
              if not p.is_relative_to(home / 'plugins/store')]
    return {str(p.relative_to(home)): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in paths if p.is_file()}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--invoke', action='store_true', help='Use existing auth for a bounded spec request')
    args = parser.parse_args()
    original = pathlib.Path(os.environ.get('CLAUDE_CONFIG_DIR', pathlib.Path.home() / '.claude'))
    before = inventory(original)
    report = {}
    try:
        with tempfile.TemporaryDirectory(prefix='skills-claude-') as directory:
            root = pathlib.Path(directory)
            market = root / 'market'
            plugin = market / 'plugins/skills'
            bundle(ROOT, plugin)
            shutil.copytree(ROOT / '.claude-plugin', market / '.claude-plugin')
            sentinel = market / 'plugins/unrelated/.claude-plugin/plugin.json'
            sentinel.parent.mkdir(parents=True)
            sentinel.write_text(json.dumps({'name': 'unrelated', 'version': '1.0.0',
                                            'description': 'Unrelated installation preservation fixture',
                                            'author': {'name': 'Fixture'}}))
            catalog = market / '.claude-plugin/marketplace.json'
            data = json.loads(catalog.read_text())
            data['plugins'].append({'name': 'unrelated', 'source': './plugins/unrelated'})
            catalog.write_text(json.dumps(data))
            home = root / 'home'
            home.mkdir()
            (home / 'settings.json').write_text(json.dumps({'env': {'SKILLS_SMOKE_SENTINEL': 'preserve'}}))
            (home / 'CLAUDE.md').write_text('Preserve this unrelated instruction.\n')
            env = dict(os.environ, CLAUDE_CONFIG_DIR=str(home))
            env.pop('CLAUDE_CODE_PLUGIN_DIRS', None)
            work = root / 'work'
            work.mkdir()

            def run(*command, json_output=False):
                result = subprocess.run(['claude', 'plugin', *command], env=env, cwd=work,
                                        capture_output=True, text=True, encoding='utf-8', timeout=120)
                if result.returncode:
                    raise RuntimeError(result.stdout + result.stderr)
                return json.loads(result.stdout) if json_output else result.stdout

            for target in (plugin, market):
                result = run('validate', str(target), '--strict', '--json', json_output=True)
                assert result['success'], result
                assert not any(item.get('blocking') for item in (result.get('directory') or {}).get('findings', [])), result
            report['strict_validation'] = 'PASS (optional icon advisory remains)'
            run('marketplace', 'add', str(market))
            run('install', 'unrelated@baeksang-skills', '--scope', 'user', '--json', json_output=True)
            run('install', 'skills@baeksang-skills', '--scope', 'user', '--json', json_output=True)
            def installed():
                return {item['id']: item for item in run('list', '--json', json_output=True)}

            listed = installed()
            assert listed['skills@baeksang-skills']['enabled']
            cached = pathlib.Path(listed['skills@baeksang-skills']['installPath'])
            assert (cached / 'skills/spec/references/execution-contract.md').read_bytes() == (ROOT / 'common/execution-contract.md').read_bytes()
            unrelated = listed['unrelated@baeksang-skills']
            report.update(install='PASS', cache_contract='PASS', discovery='PASS')
            if args.invoke:
                output = ROOT / '.artifacts/claude-native'
                output.mkdir(parents=True, exist_ok=True)
                prompt = (ROOT / 'fixtures/spec/decided-input.txt').read_text(encoding='utf-8-sig').replace('$spec', '/skills:spec', 1)
                runtime_env = dict(os.environ)
                runtime_env.pop('CLAUDE_CODE_PLUGIN_DIRS', None)
                result = subprocess.run(['claude', '-p', '--plugin-dir', str(cached), '--setting-sources', 'project',
                                         '--strict-mcp-config', '--no-session-persistence', '--permission-mode', 'dontAsk',
                                         '--tools', 'Read,Skill', '--allowedTools', 'Read,Skill',
                                         '--output-format', 'stream-json', '--verbose'],
                                        input=prompt, cwd=work, env=runtime_env, capture_output=True,
                                        text=True, encoding='utf-8', timeout=300)
                (output / 'raw.jsonl').write_text(result.stdout, encoding='utf-8')
                (output / 'stderr.txt').write_text(result.stderr, encoding='utf-8')
                report['runtime_exit'] = result.returncode
                assert result.returncode == 0, 'Runtime failed; inspect local trace'
                events = [json.loads(line) for line in result.stdout.splitlines() if line.strip()]
                final = next(event for event in reversed(events) if event.get('type') == 'result')
                assert final.get('subtype') == 'success' and not final.get('is_error'), final.get('subtype')
                assert not final.get('permission_denials'), 'Runtime permissions denied; do not bypass'
                assert any('skills:spec' in event.get('skills', []) for event in events), 'Native namespace not discovered'
                report['runtime'] = 'REVIEW raw trace; session plugin with existing auth, not fresh-home auth'
            else:
                report['runtime'] = 'NOTRUN'
            manifest = plugin / '.claude-plugin/plugin.json'
            data = json.loads(manifest.read_text())
            data['version'] = '0.1.1'
            manifest.write_text(json.dumps(data))
            run('marketplace', 'update', 'baeksang-skills')
            run('update', 'skills@baeksang-skills', '--scope', 'user', '--json', json_output=True)
            updated = installed()['skills@baeksang-skills']
            assert updated['version'] == '0.1.1', updated
            assert json.loads((pathlib.Path(updated['installPath']) / '.claude-plugin/plugin.json').read_text())['version'] == '0.1.1'
            report['update'] = 'PASS'
            run('uninstall', 'skills@baeksang-skills', '--scope', 'user')
            assert 'skills@baeksang-skills' not in installed()
            run('install', 'skills@baeksang-skills', '--scope', 'user', '--json', json_output=True)
            assert installed()['skills@baeksang-skills']['version'] == '0.1.1'
            report['reinstall'] = 'PASS'
            run('uninstall', 'skills@baeksang-skills', '--scope', 'user')
            remaining = installed()
            assert 'skills@baeksang-skills' not in remaining
            assert remaining['unrelated@baeksang-skills'] == unrelated
            assert json.loads((home / 'settings.json').read_text())['env']['SKILLS_SMOKE_SENTINEL'] == 'preserve'
            assert (home / 'CLAUDE.md').read_text() == 'Preserve this unrelated instruction.\n'
            report.update(remove='PASS', unrelated_state='PASS')
            run('uninstall', 'unrelated@baeksang-skills', '--scope', 'user')
            run('marketplace', 'remove', 'baeksang-skills')
            print(json.dumps(report, ensure_ascii=False))
    finally:
        after = inventory(original)
        changed = [key for key in before.keys() | after.keys() if before.get(key) != after.get(key)]
        assert not changed, f'Original user settings or plugins changed: {changed}'
    print(json.dumps({'original_state_preserved': True, 'protected_files': len(before)}))


if __name__ == '__main__':
    main()
