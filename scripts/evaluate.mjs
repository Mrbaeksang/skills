/** Offline evaluation preparation and evidence checks. Never invokes a model. */
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ROOT, files } from './package.mjs';

const digest = data => createHash('sha256').update(data).digest('hex');
const read = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const write = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n');
export function cases() {
  return ['routing', 'behavior'].flatMap(kind => read(path.join(ROOT, 'evals', kind, 'cases.json')).map(c => ({ ...c, checks: [...c.checks, 'scope-preserved'], kind })));
}
function inventory(root) { return Object.fromEntries([...files(root)].filter(([p]) => !p.startsWith('.git/')).map(([p, data]) => [p, digest(data)])); }
function copy(source, dest) {
  for (const [p, data] of files(source)) {
    fs.mkdirSync(path.dirname(path.join(dest, p)), { recursive: true });
    fs.writeFileSync(path.join(dest, p), data);
  }
}
function safeOutput(out) {
  for (let p = path.resolve(out); ; p = path.dirname(p)) {
    if (fs.existsSync(p) && fs.lstatSync(p).isSymbolicLink()) throw new Error('Output must not traverse links');
    if (path.dirname(p) === p) break;
  }
  if (fs.existsSync(out)) throw new Error('Output exists; preserve prior runs');
}
export function prepare(id, { source = ROOT, arm = 'after', host, model, trial = 1, out } = {}) {
  const c = cases().find(c => c.id === id);
  if (!c || !['before', 'after', 'none'].includes(arm) || !host || !model || !out || !Number.isInteger(trial) || trial < 1) throw new Error('Need known case, arm, host, model, positive trial and new output path');
  source = path.resolve(source); out = path.resolve(out);
  safeOutput(out);
  const snapshot = arm === 'none' ? {} : inventory(path.join(source, 'skills'));
  if (arm !== 'none' && !Object.keys(snapshot).length) throw new Error('Source contains no skills');
  const workspace = path.join(out, 'workspace');
  fs.mkdirSync(workspace, { recursive: true });
  const init = spawnSync('git', ['-C', workspace, 'init', '--quiet'], { encoding: 'utf8' });
  if (init.status !== 0) throw new Error(`Cannot isolate Git workspace: ${init.stderr || init.error?.message}`);
  if (['community', 'brand'].includes(c.fixture)) {
    fs.copyFileSync(path.join(ROOT, 'fixtures/visual-quality', c.fixture + '.html'), path.join(workspace, c.fixture + '.html'));
  } else if (c.fixture !== 'none') copy(path.join(ROOT, 'evals/fixtures', c.fixture), workspace);
  if (arm !== 'none') copy(path.join(source, 'skills'), path.join(out, 'skills'));
  const baseline = inventory(workspace);
  // The evaluator's oracle is outside the task workspace and absent from prompt.txt.
  const prompt = [
    `Work only in ${workspace}. External services, credentials, installs and publication are out of scope.`,
    arm === 'none' ? 'Use no skills or installed plugins; this is the no-skill control.' :
      c.kind === 'behavior' ? `Use the skill at ${path.join(out, 'skills', c.skill, 'SKILL.md')}.` :
      `Available skill name/description metadata is in ${path.join(out, 'catalog.txt')}. Choose only if needed; skill folders are under ${path.join(out, 'skills')}.`,
    c.request,
    'Report actual actions, observations and unrun boundaries. Do not read run.json or evaluation files outside the supplied task inputs.'
  ].join('\n\n');
  if (arm !== 'none') {
    const catalog = fs.readdirSync(path.join(out, 'skills')).sort().map(name => {
      const text = fs.readFileSync(path.join(out, 'skills', name, 'SKILL.md'), 'utf8');
      return `${name}: ${text.match(/^description: (.+)$/m)?.[1] || ''}`;
    }).join('\n');
    fs.writeFileSync(path.join(out, 'catalog.txt'), catalog);
  }
  fs.writeFileSync(path.join(out, 'prompt.txt'), prompt);
  const revision = spawnSync('git', ['-C', source, 'rev-parse', 'HEAD'], { encoding: 'utf8' });
  const run = { schema: 1, case: c, caseHash: digest(JSON.stringify({ case: c, baseline,
    criteria: digest(fs.readFileSync(path.join(ROOT, 'evals/criteria.md'))) })), arm, host, model, trial,
    sourceRevision: revision.status === 0 ? revision.stdout.trim() : null,
    sourceHash: digest(JSON.stringify(snapshot)), skillSnapshot: snapshot, baseline, createdAt: new Date().toISOString() };
  write(path.join(out, 'run.json'), run);
  return { id, arm, host, model, trial, out, status: 'NOTRUN' };
}
function native(workspace, args) {
  const result = spawnSync(process.execPath, args, { cwd: workspace, encoding: 'utf8', timeout: 10000 });
  return { args, exit: result.status, stdout: result.stdout, stderr: result.stderr, error: result.error?.message };
}
function checks(run, workspace) {
  const result = {};
  const actual = inventory(workspace);
  if (run.case.checks.includes('readonly')) result.readonly = { pass: JSON.stringify(actual) === JSON.stringify(run.baseline) };
  if (run.case.checks.includes('placeholder-only')) {
    const original = fs.readFileSync(path.join(ROOT, 'fixtures/visual-quality/community.html'), 'utf8');
    result['placeholder-only'] = { pass: Object.keys(actual).length === 1 &&
      fs.readFileSync(path.join(workspace, 'community.html'), 'utf8') === original.replace('placeholder="검색어를 입력하세요"', 'placeholder="우리 동네에서 찾아보세요"') };
  }
  if (run.case.checks.includes('show-cli')) {
    const outputs = [['show', 'a'], ['show', 'missing'], ['list'], ['get', 'a']].map(args => native(workspace, ['cli.mjs', ...args]));
    let pass = false;
    try { pass = outputs[0].exit === 0 && JSON.parse(outputs[0].stdout).id === 'a' && outputs[0].stderr === '' &&
      outputs[1].exit === 2 && outputs[1].stdout === '' && JSON.parse(outputs[1].stderr).error.code === 'NOT_FOUND' &&
      outputs[2].exit === 0 && JSON.parse(outputs[2].stdout).length === 2 && outputs[3].exit === 0 && JSON.parse(outputs[3].stdout).id === 'a'; } catch {}
    result['show-cli'] = { pass, outputs };
  }
  if (run.case.checks.includes('webhook-effects')) {
    const modes = ['happy', 'duplicate', 'partial', 'cancel', 'dependency'];
    const outputs = modes.map(mode => native(workspace, ['probe.mjs', mode]));
    let pass = false;
    try { pass = outputs.every((o, i) => o.exit === 0 && JSON.parse(o.stdout).state.credits === (i < 3 ? 10 : 0)); } catch {}
    result['webhook-effects'] = { pass, outputs };
  }
  return result;
}
export function assess(out) {
  out = path.resolve(out);
  const run = read(path.join(out, 'run.json'));
  const automatic = checks(run, path.join(out, 'workspace'));
  // Reviewer-supplied judgments must cite a real trace, diff or observation file.
  const reportFile = path.join(out, 'review.json');
  const report = fs.existsSync(reportFile) ? read(reportFile) : { checks: {} };
  const results = run.case.checks.map(id => {
    if (automatic[id]) return { id, status: automatic[id].pass ? 'PASS' : 'FAIL', provenance: 'local-observation', ...automatic[id] };
    const judgment = report.checks?.[id];
    if (!judgment || !['PASS', 'FAIL', 'NOTRUN'].includes(judgment.status) || !judgment.reason) return { id, status: 'NOTRUN', reason: 'Missing reviewer judgment' };
    const evidence = judgment.evidence;
    const p = typeof evidence === 'string' ? path.resolve(out, evidence) : '';
    const relative = path.relative(out, p);
    let linked = false;
    for (let parent = p; parent && parent !== out && path.relative(out, parent) && !path.relative(out, parent).startsWith('..'); parent = path.dirname(parent)) {
      if (fs.existsSync(parent) && fs.lstatSync(parent).isSymbolicLink()) linked = true;
    }
    if (!evidence || !relative || relative.startsWith('..') || path.isAbsolute(relative) || !fs.existsSync(p) || linked || !fs.statSync(p).isFile()) return { id, status: 'NOTRUN', reason: 'Missing contained evidence file' };
    return { id, ...judgment, provenance: 'reviewer-judgment', evidenceHash: digest(fs.readFileSync(p)) };
  });
  if (run.arm !== 'none' && JSON.stringify(inventory(path.join(out, 'skills'))) !== JSON.stringify(run.skillSnapshot)) results.push({ id: 'skill-snapshot', status: 'FAIL', reason: 'Skill under test changed during run' });
  const status = results.some(c => c.status === 'FAIL') ? 'FAIL' : results.every(c => c.status === 'PASS') ? 'PASS' : 'NOTRUN';
  const verdict = { caseId: run.case.id, caseHash: run.caseHash, sourceHash: run.sourceHash, sourceRevision: run.sourceRevision,
    host: run.host, model: run.model, arm: run.arm, trial: run.trial, status, results };
  write(path.join(out, 'verdict.json'), verdict);
  return verdict;
}
export function compare(dirs) {
  const rows = dirs.map(dir => read(path.join(dir, 'verdict.json')));
  if (!rows.length) throw new Error('No runs');
  const first = rows[0];
  if (rows.some(r => r.caseHash !== first.caseHash || r.host !== first.host || r.model !== first.model)) throw new Error('Compare the same case, host and model');
  const seen = new Set();
  for (const r of rows) {
    const key = `${r.arm}/${r.trial}`;
    if (seen.has(key)) throw new Error('Duplicate arm/trial');
    seen.add(key);
  }
  for (const arm of ['before', 'after', 'none']) {
    if (new Set(rows.filter(r => r.arm === arm).map(r => r.sourceHash)).size > 1) throw new Error('An arm must use one source snapshot');
  }
  const trials = [...new Set(rows.map(r => r.trial))];
  const complete = trials.every(t => ['before', 'after', 'none'].every(a => rows.some(r => r.trial === t && r.arm === a && r.status !== 'NOTRUN')));
  const regression = trials.some(t => rows.some(r => r.arm === 'before' && r.trial === t && r.status === 'PASS') && rows.some(r => r.arm === 'after' && r.trial === t && r.status === 'FAIL'));
  return { caseId: first.caseId, status: regression ? 'FAIL' : complete ? 'COMPARED' : 'NOTRUN', regression, rows,
    limitation: 'Per-case observations; no statistical improvement claim. Reviewer judgments are not automatic proof.' };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, id, ...args] = process.argv.slice(2);
    let result;
    if (command === 'list') result = cases().map(({ id, kind, requirements }) => ({ id, kind, requirements }));
    else if (command === 'prepare') {
      const options = {};
      for (let i = 0; i < args.length; i += 2) {
        const key = args[i].slice(2);
        if (!['source', 'arm', 'host', 'model', 'trial', 'out'].includes(key) || !args[i + 1] || Object.hasOwn(options, key)) throw new Error('Invalid or duplicate option');
        options[key] = key === 'trial' ? Number(args[i + 1]) : args[i + 1];
      }
      result = prepare(id, options);
    } else if (command === 'assess') result = assess(id);
    else if (command === 'compare') result = compare([id, ...args]);
    else throw new Error('Use list | prepare <case> --host H --model M --out NEW_DIR [--arm before|after|none --source DIR --trial N] | assess DIR | compare DIR...');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
