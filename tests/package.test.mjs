import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { validateSkill } from '../scripts/package.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = (command, source, ...args) => spawnSync(process.execPath, [path.join(root, 'scripts/package.mjs'), command, '--source', source, ...args], { encoding: 'utf8' });
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-test-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  for (const name of ['skills', 'common', 'adapters', 'LICENSE']) fs.cpSync(path.join(root, name), path.join(dir, name), { recursive: true });
  return dir;
}
test('standalone source contains all shared references and check detects drift', t => {
  const source = fixture(t);
  assert.equal(cli('sync', source).status, 0);
  assert.equal(cli('check', source).status, 0);
  for (const name of fs.readdirSync(path.join(source, 'skills'))) {
    for (const shared of fs.readdirSync(path.join(source, 'common'))) {
      assert.deepEqual(fs.readFileSync(path.join(source, 'skills', name, 'references', shared)), fs.readFileSync(path.join(source, 'common', shared)));
    }
  }
  fs.appendFileSync(path.join(source, 'skills/spec/references/execution-contract.md'), 'drift');
  assert.notEqual(cli('check', source).status, 0);
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
