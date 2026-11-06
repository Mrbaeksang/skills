import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { cases, prepare, assess, compare } from '../scripts/evaluate.mjs';

function setup(t, id, arm = 'after') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'skills-eval-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const out = path.join(root, 'run');
  prepare(id, { out, host: 'test', model: 'stub-no-model', arm });
  return out;
}
test('preparation preserves existing output and keeps oracle out of routing prompts', t => {
  const out = setup(t, 'copy-only');
  const prompt = fs.readFileSync(path.join(out, 'prompt.txt'), 'utf8');
  assert.ok(!prompt.includes('no-stateful-load'));
  assert.ok(!prompt.includes('build/SKILL.md'));
  const gitRoot = execFileSync('git', ['-C', path.join(out, 'workspace'), 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  // Windows TEMP can use an 8.3 alias while Git returns its long form.
  assert.equal(fs.realpathSync.native(gitRoot), fs.realpathSync.native(path.join(out, 'workspace')));
  assert.throws(() => prepare('copy-only', { out, host: 'test', model: 'stub-no-model' }), /Output exists/);
  assert.ok(cases().every(c => c.requirements.length && c.checks.includes('scope-preserved')));
});
test('no-skill arm contains no skill snapshot and missing evidence never passes', t => {
  const out = setup(t, 'missing-service', 'none');
  assert.ok(!fs.existsSync(path.join(out, 'skills')));
  const verdict = assess(out);
  assert.equal(verdict.status, 'NOTRUN');
  assert.ok(verdict.results.some(c => c.id === 'readonly' && c.status === 'PASS'));
});
test('placeholder checker rejects collateral edits and false completion claims', t => {
  const out = setup(t, 'copy-only');
  const file = path.join(out, 'workspace/community.html');
  const old = fs.readFileSync(file, 'utf8');
  fs.writeFileSync(file, old.replace('placeholder="검색어를 입력하세요"', 'placeholder="우리 동네에서 찾아보세요"'));
  assert.equal(assess(out).results.find(c => c.id === 'placeholder-only').status, 'PASS');
  fs.appendFileSync(file, '<p>Unrequested</p>');
  fs.writeFileSync(path.join(out, 'review.json'), JSON.stringify({ checks: { 'placeholder-only': { status: 'PASS', reason: 'Done' } } }));
  assert.equal(assess(out).status, 'FAIL');
});
test('native CLI checker fails baseline then observes a working alias', t => {
  const out = setup(t, 'reuse-handler');
  assert.equal(assess(out).results.find(c => c.id === 'show-cli').status, 'FAIL');
  const file = path.join(out, 'workspace/cli.mjs');
  fs.writeFileSync(file, fs.readFileSync(file, 'utf8').replace("action === 'get'", "['get', 'show'].includes(action)"));
  assert.equal(assess(out).results.find(c => c.id === 'show-cli').status, 'PASS');
  // Passing public outputs alone cannot establish shared-handler reuse or agent execution.
  assert.equal(assess(out).status, 'NOTRUN');
});
test('partial-failure fixture exposes duplicate effects and read-only checks catch mutations', t => {
  const out = setup(t, 'state-repair');
  const verdict = assess(out);
  assert.equal(verdict.results.find(c => c.id === 'webhook-effects').status, 'FAIL');
  const view = setup(t, 'state-recovery');
  fs.appendFileSync(path.join(view, 'workspace/worker.mjs'), '\n// changed');
  assert.equal(assess(view).status, 'FAIL');
});
test('reviewer checks need contained evidence and edited skills invalidate a run', t => {
  const out = setup(t, 'missing-service');
  fs.writeFileSync(path.join(out, 'review.json'), JSON.stringify({ checks: { 'notrun-boundary': { status: 'PASS', reason: 'Checked', evidence: '../outside.txt' } } }));
  assert.equal(assess(out).results.find(c => c.id === 'notrun-boundary').status, 'NOTRUN');
  fs.appendFileSync(path.join(out, 'skills/verify/SKILL.md'), '\nChanged while evaluating');
  assert.equal(assess(out).status, 'FAIL');
});
test('comparison rejects mixed cases and duplicates, missing arms remain unrun', t => {
  const out = setup(t, 'missing-service');
  assess(out);
  assert.equal(compare([out]).status, 'NOTRUN');
  assert.throws(() => compare([out, out]), /Duplicate/);
  const other = setup(t, 'justified-gate');
  assess(other);
  assert.throws(() => compare([out, other]), /same case/);
});
