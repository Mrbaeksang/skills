import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { files, validateSkill } from '../scripts/package.mjs';
import { checkRelease } from '../scripts/check-release.mjs';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = (command, source, ...args) => spawnSync(process.execPath, [path.join(root, 'scripts/package.mjs'), command, '--source', source, ...args], { encoding: 'utf8' });
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const name of ['skills', 'common', 'adapters', 'LICENSE']) fs.cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
  return dir;
}
test('release check permits docs, requires a version increase for shipped changes, and rejects mismatched adapters', t => {
  const source = fixture(t);
  const git = (...args) => execFileSync('git', args, { cwd: source, encoding: 'utf8' }).trim();
  assert.equal(cli('sync', source).status, 0);
  git('init');
  git('config', 'core.autocrlf', 'false');
  git('add', '.');
  git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'baseline');
  const base = git('rev-parse', 'HEAD');
  fs.writeFileSync(path.join(source, 'README.md'), 'Documentation only');
  assert.equal(checkRelease(base, source), 'No shipped content changes');
  fs.appendFileSync(path.join(source, 'common/execution-contract.md'), '\nChanged contract.\n');
  assert.equal(cli('sync', source).status, 0);
  assert.throws(() => checkRelease(base, source), /bump both adapter versions/);
  const setVersion = (host, version) => {
    const file = path.join(source, 'adapters', host, 'plugin.json');
    const manifest = JSON.parse(fs.readFileSync(file));
    manifest.version = version;
    fs.writeFileSync(file, JSON.stringify(manifest));
  };
  setVersion('claude', '1.0.0');
  assert.match(cli('sync', source).stderr, /versions must match/);
  setVersion('codex', '1.0.0');
  assert.equal(cli('sync', source).status, 0);
  assert.match(checkRelease(base, source), /-> 1.0.0/);
  for (const host of ['claude', 'codex']) setVersion(host, '0.0.1');
  assert.equal(cli('sync', source).status, 0);
  assert.throws(() => checkRelease(base, source), /bump both adapter versions/);
});
test('standalone source contains all shared references and check detects drift', t => {
  const source = fixture(t);
  assert.equal(cli('sync', source).status, 0);
  assert.equal(cli('check', source).status, 0);
  for (const name of fs.readdirSync(path.join(source, 'skills'))) {
    for (const [shared, data] of files(path.join(source, 'common'))) {
      const target = path.join(source, 'skills', name, 'references', shared);
      if (fs.existsSync(target)) assert.deepEqual(fs.readFileSync(target), data);
    }
  }
  fs.appendFileSync(path.join(source, 'skills/spec/references/execution-contract.md'), 'drift');
  assert.notEqual(cli('check', source).status, 0);
});
test('talk and build install alone with complete nested references and no unrelated workflows', t => {
  const source = fixture(t);
  assert.equal(cli('sync', source).status, 0);
  for (const name of ['talk', 'build']) {
    const isolated = path.join(source, `isolated-${name}`);
    fs.cpSync(path.join(source, 'skills', name), isolated, { recursive: true });
    validateSkill(isolated);
    assert.equal(fs.existsSync(path.join(isolated, 'references/workflows/domain.md')), true);
  }
  assert.equal(fs.existsSync(path.join(source, 'isolated-talk/references/workflows/upgrade.md')), false);
  assert.equal(fs.existsSync(path.join(source, 'isolated-talk/references/workflows/verify/ui.md')), false);
  assert.equal(fs.existsSync(path.join(source, 'isolated-build/references/workflows/verify/ui.md')), true);
});
test('nested shared drift, missing leaves, and reference cycles fail without partial sync writes', t => {
  const source = fixture(t);
  assert.equal(cli('sync', source).status, 0);
  const leaf = path.join(source, 'common/workflows/domain.md');
  const original = fs.readFileSync(leaf);
  for (const change of [() => fs.unlinkSync(leaf), () => fs.appendFileSync(leaf, '\n[cycle](domain.md)')]) {
    change();
    const before = files(source);
    assert.notEqual(cli('sync', source).status, 0);
    assert.deepEqual(files(source), before);
    fs.writeFileSync(leaf, original);
  }
  fs.appendFileSync(path.join(source, 'skills/talk/references/workflows/domain.md'), '\ndrift');
  assert.notEqual(cli('check', source).status, 0);
});
test('sync prunes an unused known mirror but preserves a modified unused mirror', t => {
  const source = fixture(t);
  assert.equal(cli('sync', source).status, 0);
  const mirror = path.join(source, 'skills/talk/references/tracker-state.md');
  fs.copyFileSync(path.join(source, 'common/tracker-state.md'), mirror);
  assert.notEqual(cli('check', source).status, 0);
  assert.equal(cli('sync', source).status, 0);
  assert.equal(fs.existsSync(mirror), false);
  fs.writeFileSync(mirror, 'User modification');
  const before = files(source);
  assert.notEqual(cli('sync', source).status, 0);
  assert.deepEqual(files(source), before);
});
test('bundle includes manifests and license and refuses existing destinations', t => {
  const source = fixture(t);
  assert.equal(cli('sync', source).status, 0);
  const dest = path.join(source, 'output');
  const first = cli('bundle', source, '--dest', dest);
  assert.equal(first.status, 0, first.stderr);
  for (const host of ['codex', 'claude']) assert.equal(JSON.parse(fs.readFileSync(path.join(dest, `.${host}-plugin/plugin.json`))).skills, './skills/');
  assert.deepEqual(fs.readFileSync(path.join(dest, 'LICENSE')), fs.readFileSync(path.join(source, 'LICENSE')));
  fs.writeFileSync(path.join(dest, 'user-note'), 'preserve');
  assert.notEqual(cli('bundle', source, '--dest', dest).status, 0);
  assert.equal(fs.readFileSync(path.join(dest, 'user-note'), 'utf8'), 'preserve');
  for (const name of fs.readdirSync(path.join(dest, 'skills'))) {
    const standalone = path.join(source, `standalone-${name}`);
    fs.cpSync(path.join(dest, 'skills', name), standalone, { recursive: true });
    validateSkill(standalone);
  }
});
test('invalid metadata, missing references and escaped references fail before bundle writes', t => {
  const source = fixture(t);
  assert.equal(cli('sync', source).status, 0);
  const entry = path.join(source, 'skills/spec/SKILL.md');
  const original = fs.readFileSync(entry, 'utf8');
  for (const bad of [original.replace('name: spec', 'name: Wrong_Name'), original.replace('name: spec', 'name: spec\nname: spec'), original + '\n[missing](references/absent.md)', original + '\n[escape](../../outside.md)']) {
    fs.writeFileSync(entry, bad);
    const dest = path.join(source, 'output');
    assert.notEqual(cli('bundle', source, '--dest', dest).status, 0);
    assert.equal(fs.existsSync(dest), false);
  }
});
test('personal paths and credentials in common fail sync before any mirrors change', t => {
  const source = fixture(t);
  assert.equal(cli('sync', source).status, 0);
  const mirror = path.join(source, 'skills/spec/references/execution-contract.md');
  const original = fs.readFileSync(mirror);
  for (const bad of ['Read C:\\Users\\private-user\\secret.txt', 'api_key = abcdefghijklmnopqrstuv']) {
    fs.writeFileSync(path.join(source, 'common/execution-contract.md'), bad);
    assert.notEqual(cli('sync', source).status, 0);
    assert.deepEqual(fs.readFileSync(mirror), original);
  }
});
test('missing mirrors and unexpected bundle files fail check; sync preserves unknown files', t => {
  const source = fixture(t);
  assert.equal(cli('sync', source).status, 0);
  fs.unlinkSync(path.join(source, 'skills/spec/references/execution-contract.md'));
  assert.notEqual(cli('check', source).status, 0);
  assert.equal(cli('sync', source).status, 0);
  fs.appendFileSync(path.join(source, 'plugins/skills/skills/spec/SKILL.md'), 'drift');
  assert.notEqual(cli('check', source).status, 0);
  assert.equal(cli('sync', source).status, 0);
  const note = path.join(source, 'plugins/skills/user-note');
  fs.writeFileSync(note, 'preserve');
  assert.notEqual(cli('check', source).status, 0);
  assert.notEqual(cli('sync', source).status, 0);
  assert.equal(fs.readFileSync(note, 'utf8'), 'preserve');
});
test('directory links cannot redirect sync writes outside source', t => {
  const source = fixture(t);
  const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-outside-'));
  t.after(() => fs.rmSync(outside, { recursive: true, force: true }));
  fs.mkdirSync(path.join(source, 'plugins'));
  fs.symlinkSync(outside, path.join(source, 'plugins/skills'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.notEqual(cli('sync', source).status, 0);
  assert.deepEqual(fs.readdirSync(outside), []);
});

for (const contract of ['execution-contract.md', 'tracker-state.md', 'workspace-lifecycle.md']) {
  test(`missing canonical ${contract} fails despite existing mirrors, before writes`, t => {
    const source = fixture(t);
    assert.equal(cli('sync', source).status, 0);
    fs.unlinkSync(path.join(source, 'common', contract));
    const before = files(source);
    for (const command of ['check', 'sync', 'bundle']) {
      const result = cli(command, source, '--dest', path.join(source, 'output'));
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Missing required common contract/);
      assert.deepEqual(files(source), before);
      assert.equal(fs.existsSync(path.join(source, 'output')), false);
    }
  });
}

for (const conflict of ['skills/build/references/workspace-lifecycle.md', 'plugins/skills/README.md']) {
  test(`sync rejects directory at ${conflict} before changing any bytes`, t => {
    const source = fixture(t);
    assert.equal(cli('sync', source).status, 0);
    const target = path.join(source, conflict);
    fs.unlinkSync(target);
    fs.mkdirSync(target);
    fs.appendFileSync(path.join(source, 'common/execution-contract.md'), '\nUpdated contract.\n');
    fs.writeFileSync(path.join(source, 'user-note'), 'preserve');
    const before = files(source);
    const result = cli('sync', source);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Generated file target is not a regular file/);
    assert.deepEqual(files(source), before);
    assert.equal(fs.lstatSync(target).isDirectory(), true);
    assert.deepEqual(fs.readdirSync(target), []);
  });
}
