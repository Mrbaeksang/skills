/** Run the existing skills CLI in a disposable project; never invoke a model. */
import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { ROOT, files, validateSkill } from './package.mjs';

const source = process.argv[2] || ROOT;
if (process.argv.length > 3) throw new Error('Usage: npm run smoke:install -- [repository-or-local-path]');
const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-install-'));
try {
  const work = path.join(temp, 'project');
  const home = path.join(temp, 'home');
  fs.mkdirSync(work);
  fs.mkdirSync(home);
  // An unrelated project skill must survive the real installer.
  const sentinel = path.join(work, '.agents/skills/unrelated/SKILL.md');
  fs.mkdirSync(path.dirname(sentinel), { recursive: true });
  const sentinelText = '---\nname: unrelated\ndescription: Installation preservation fixture.\n---\nPreserve this file.\n';
  fs.writeFileSync(sentinel, sentinelText);
  const env = { ...process.env, HOME: home, USERPROFILE: home, CODEX_HOME: path.join(home, '.codex'), CLAUDE_CONFIG_DIR: path.join(home, '.claude'), SKILLS_SMOKE_SOURCE: source, DISABLE_TELEMETRY: '1' };
  const args = ['--yes', 'skills@latest', 'add', source, '--agent', 'codex', 'claude-code', '--skill', '*', '--copy', '--yes'];
  // Pass source through an environment value, not executable shell interpolation.
  const result = process.platform === 'win32'
    ? spawnSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-Command', '& npx.cmd --yes skills@latest add $env:SKILLS_SMOKE_SOURCE --agent codex claude-code --skill "*" --copy --yes; exit $LASTEXITCODE'], { cwd: work, env, encoding: 'utf8', timeout: 180000 })
    : spawnSync('npx', args, { cwd: work, env, encoding: 'utf8', timeout: 180000 });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
  const expected = fs.readdirSync(path.join(ROOT, 'skills')).sort();
  const reports = [];
  for (const scope of ['.agents/skills', '.claude/skills']) {
    const installed = path.join(work, scope);
    const names = fs.readdirSync(installed).filter(name => name !== 'unrelated').sort();
    if (JSON.stringify(names) !== JSON.stringify(expected)) throw new Error(`Unexpected installed skills: ${scope}: ${names}`);
    for (const name of names) {
      const dir = path.join(installed, name);
      validateSkill(dir);
      const expectedFiles = files(path.join(ROOT, 'skills', name));
      const installedFiles = files(dir);
      if (installedFiles.size !== expectedFiles.size || [...expectedFiles].some(([file, data]) => !installedFiles.get(file)?.equals(data))) throw new Error(`${scope}/${name}: installed files differ from this checkout`);
      for (const [file, data] of files(path.join(ROOT, 'common'))) {
        if (!fs.readFileSync(path.join(dir, 'references', file)).equals(data)) throw new Error(`${scope}/${name}: shared contract mismatch: ${file}`);
      }
      const digest = createHash('sha256');
      for (const [file, data] of [...files(dir)].sort(([a], [b]) => a.localeCompare(b))) digest.update(file).update('\0').update(data);
      reports.push({ scope, skill: name, sha256: digest.digest('hex') });
    }
  }
  if (fs.readFileSync(sentinel, 'utf8') !== sentinelText) throw new Error('Unrelated project skill changed');
  console.log(JSON.stringify({ source, node: process.version, platform: process.platform, installation: 'PASS', sourceFiles: 'PASS', localReferences: 'PASS', sharedReferences: 'PASS', unrelatedSkillPreserved: true, modelRuntime: 'NOTRUN', installed: reports }, null, 2));
} finally {
  fs.rmSync(temp, { recursive: true, force: true });
}
