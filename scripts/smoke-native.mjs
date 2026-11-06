/** Native local-source install/update in an isolated profile. No model invocation. */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ROOT, files, validateSkill } from './package.mjs';

const [host, output, before] = process.argv.slice(2);
if (!['codex', 'claude'].includes(host) || !output || process.argv.length > 5) throw new Error('Use node scripts/smoke-native.mjs codex|claude NEW_OUTPUT [PREVIOUS_CHECKOUT]');
const out = path.resolve(output);
for (let p = out; ; p = path.dirname(p)) {
  if (fs.existsSync(p) && fs.lstatSync(p).isSymbolicLink()) throw new Error('Output must not traverse links');
  if (p === path.dirname(p)) break;
}
if (fs.existsSync(out)) throw new Error('Output exists; preserving prior profile');
const home = path.join(out, 'home');
const source = path.join(out, 'source');
fs.mkdirSync(home, { recursive: true });
const env = { ...process.env, CODEX_HOME: path.join(home, '.codex'), CLAUDE_CONFIG_DIR: path.join(home, '.claude'),
  SKILLS_NATIVE_SOURCE: source, DISABLE_TELEMETRY: '1' };
fs.mkdirSync(env.CODEX_HOME, { recursive: true });
fs.mkdirSync(env.CLAUDE_CONFIG_DIR, { recursive: true });
fs.writeFileSync(path.join(env.CODEX_HOME, 'config.toml'), '[profiles.preservation_fixture]\nmodel = "fixture-no-run"\n');
fs.writeFileSync(path.join(env.CLAUDE_CONFIG_DIR, 'settings.json'), JSON.stringify({ env: { SKILLS_PRESERVATION_FIXTURE: 'unchanged' } }));
// No global auth/settings are copied. Keep a separate sentinel through refreshes.
const sentinel = path.join(home, 'unrelated-settings.txt');
fs.writeFileSync(sentinel, 'preserve');
const reports = [];
function command(args, windowsCommand) {
  const r = process.platform === 'win32'
    ? spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', windowsCommand + '; exit $LASTEXITCODE'], { cwd: home, env, encoding: 'utf8', timeout: 120000 })
    : spawnSync(host, args, { cwd: home, env, encoding: 'utf8', timeout: 120000 });
  if (r.status !== 0) throw new Error(`${host} ${args.join(' ')}: ${r.error?.message || ''}\n${r.stderr}\n${r.stdout}`);
  return r.stdout;
}
function stage(root) {
  // Overwrite only the task-owned source files; no user installation is a destination.
  for (const folder of ['.agents/plugins', '.claude-plugin', 'plugins/skills']) {
    for (const [file, bytes] of files(path.join(root, folder))) {
      const target = path.join(source, folder, file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, bytes);
    }
  }
}
function install(root, first) {
  stage(root);
  if (first) command(['plugin', 'marketplace', 'add', source], `${host} plugin marketplace add $env:SKILLS_NATIVE_SOURCE`);
  const action = host === 'codex' ? 'add' : first ? 'install' : 'update';
  command(['plugin', action, 'skills@baeksang-skills', ...(host === 'claude' ? ['--scope', 'user'] : [])],
    `${host} plugin ${action} skills@baeksang-skills${host === 'claude' ? ' --scope user' : ''}`);
  const listed = JSON.parse(command(['plugin', 'list', '--json'], `${host} plugin list --json`));
  const plugin = (host === 'codex' ? listed.installed : listed).find(p => (p.pluginId || p.id) === 'skills@baeksang-skills');
  const expected = JSON.parse(fs.readFileSync(path.join(root, 'adapters', host, 'plugin.json'), 'utf8')).version;
  if (!plugin?.enabled || plugin.version !== expected) throw new Error(`Wrong active version: ${JSON.stringify(plugin)}`);
  const cache = host === 'claude' ? plugin.installPath : path.join(env.CODEX_HOME, 'plugins/cache/baeksang-skills/skills', expected);
  for (const name of fs.readdirSync(path.join(root, 'skills'))) {
    const actual = validateSkill(path.join(cache, 'skills', name));
    const wanted = files(path.join(root, 'skills', name));
    if (actual.size !== wanted.size || [...wanted].some(([p, data]) => !data.equals(actual.get(p)))) throw new Error(`Cache mismatch: ${name}`);
  }
  if (fs.readFileSync(sentinel, 'utf8') !== 'preserve') throw new Error('Unrelated sentinel changed');
  const preserved = host === 'codex'
    ? /\[profiles\.preservation_fixture\]\s*model\s*=\s*"fixture-no-run"/.test(fs.readFileSync(path.join(env.CODEX_HOME, 'config.toml'), 'utf8'))
    : JSON.parse(fs.readFileSync(path.join(env.CLAUDE_CONFIG_DIR, 'settings.json'), 'utf8')).env?.SKILLS_PRESERVATION_FIXTURE === 'unchanged';
  if (!preserved) throw new Error('Unrelated host setting changed');
  reports.push({ phase: first ? 'install' : 'local-source-update', version: expected, status: 'PASS', skills: fs.readdirSync(path.join(root, 'skills')).length, unrelatedSettingsPreserved: true });
}
try {
  if (before) install(path.resolve(before), true);
  install(ROOT, !before);
  const report = { host, platform: process.platform, reports, isolation: home, modelDiscovery: 'NOTRUN',
    remotePinnedTransition: 'NOTRUN', note: 'Local-source install/update only; no user settings or remote marketplace changed.' };
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  fs.writeFileSync(path.join(out, 'result.json'), JSON.stringify({ host, reports, status: 'FAIL', error: error.message }, null, 2));
  console.error(error.message); process.exitCode = 1;
}
