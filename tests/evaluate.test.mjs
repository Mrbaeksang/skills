import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { Script } from 'node:vm';
import { cases, prepare, assess, compare } from '../scripts/evaluate.mjs';
import '../evals/fixtures/product-ui/server.test.mjs';

function setup(t, id, arm = 'after') {
  const root = fs.mkdtempSync(path.join(fs.realpathSync.native(os.tmpdir()), 'skills-eval-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const out = path.join(root, 'run');
  prepare(id, { out, host: 'test', model: 'stub-no-model', arm });
  return out;
}
test('UI redesign cases prepare real mapping input without leaking judgment criteria', t => {
  const out = setup(t, 'ui-redesign-repeat');
  const file = path.join(out, 'workspace/mapping.html');
  const html = fs.readFileSync(file, 'utf8');
  assert.doesNotThrow(() => new Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]));
  assert.ok(html.includes('0012') && html.includes('주문일자'));
  const prompt = fs.readFileSync(path.join(out, 'prompt.txt'), 'utf8');
  assert.ok(!prompt.includes('redesign-scope') && !prompt.includes('ui-evidence-boundary'));
  assert.equal(assess(out).status, 'NOTRUN', 'prepared files alone never establish agent behavior');
  const heldOut = setup(t, 'ui-related-context');
  assert.deepEqual(fs.readdirSync(path.join(heldOut, 'workspace')).filter(name => name !== '.git'), []);
});
test('preparation preserves existing output and keeps oracle out of routing prompts', t => {
  const out = setup(t, 'copy-only');
  const prompt = fs.readFileSync(path.join(out, 'prompt.txt'), 'utf8');
  assert.ok(!prompt.includes('no-stateful-load'));
  for (const name of fs.readdirSync(path.join(out, 'skills'))) {
    assert.ok(prompt.includes(path.join(out, 'skills', name, 'SKILL.md')));
  }
  assert.ok(prompt.includes('build:'));
  assert.ok(prompt.includes('diagnose:'));
  assert.ok(prompt.includes('talk:'));
  const gitRoot = execFileSync('git', ['-C', path.join(out, 'workspace'), 'rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  // Windows TEMP can use an 8.3 alias while Git returns its long form.
  assert.equal(fs.realpathSync.native(gitRoot), fs.realpathSync.native(path.join(out, 'workspace')));
  assert.throws(() => prepare('copy-only', { out, host: 'test', model: 'stub-no-model' }), /Output exists/);
  assert.ok(cases().every(c => c.requirements.length && c.checks.includes('scope-preserved')));
});

test('audit fixture separates an existing guard from a real quantity defect', t => {
  const out = setup(t, 'audit-fix');
  const workspace = path.join(out, 'workspace');
  const childEnv = { ...process.env };
  delete childEnv.NODE_TEST_CONTEXT;
  const existing = execFileSync(process.execPath, ['--test'], { cwd: workspace, encoding: 'utf8', env: childEnv });
  assert.match(existing, /pass 1/);
  const observed = JSON.parse(execFileSync(process.execPath, ['summary.mjs'], { cwd: workspace, encoding: 'utf8' }));
  assert.deepEqual(observed.labels, ['Apple']);
  assert.equal(observed.total, 1);
  assert.notEqual(observed.total, 3, 'baseline must retain the defect the actor is asked to fix');
  const run = JSON.parse(fs.readFileSync(path.join(out, 'run.json'), 'utf8'));
  assert.ok(run.case.checks.includes('audit-fix'));
  assert.ok(!fs.readFileSync(path.join(out, 'prompt.txt'), 'utf8').includes('audit-fix'));
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

test('comparison reports check regressions and lost evidence even in already failing runs', t => {
  const dirs = ['before', 'after', 'none'].map(arm => setup(t, 'missing-service', arm));
  const writeVerdict = (dir, results) => {
    const verdict = assess(dir);
    verdict.status = 'FAIL';
    verdict.results = Object.entries(results).map(([id, status]) => ({ id, status }));
    fs.writeFileSync(path.join(dir, 'verdict.json'), JSON.stringify(verdict));
  };
  writeVerdict(dirs[0], { scope: 'PASS', visual: 'FAIL', observed: 'PASS' });
  writeVerdict(dirs[1], { scope: 'FAIL', visual: 'PASS', observed: 'NOTRUN' });
  writeVerdict(dirs[2], { scope: 'FAIL' });
  const comparison = compare(dirs);
  assert.equal(comparison.status, 'FAIL');
  assert.deepEqual(comparison.regressions, [{ trial: 1, id: 'scope' }]);
  assert.deepEqual(comparison.lostEvidence, [{ trial: 1, id: 'observed' }]);

  writeVerdict(dirs[1], { scope: 'PASS', visual: 'FAIL' });
  const incomplete = compare(dirs);
  assert.equal(incomplete.status, 'NOTRUN');
  assert.equal(incomplete.regression, false);
  assert.deepEqual(incomplete.lostEvidence, [{ trial: 1, id: 'observed' }]);
});
