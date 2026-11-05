/** Reject shipped content changes without a new native plugin version. */
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROOT, run } from './package.mjs';

export function checkRelease(base, root = ROOT) {
  run('check', root);
  if (!base) throw new Error('Provide a base revision argument or RELEASE_BASE');
  if (/^0+$/.test(base)) return 'Initial push: package validated';
  const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim();
  const revision = git('rev-parse', '--verify', `${base}^{commit}`);
  const changed = git('diff', '--name-only', revision, '--', 'skills', 'common', 'adapters', 'plugins/skills', '.claude-plugin', '.agents/plugins');
  if (!changed) return 'No shipped content changes';
  const manifestPath = 'adapters/claude/plugin.json';
  const before = JSON.parse(git('show', `${revision}:${manifestPath}`)).version;
  const after = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8')).version;
  const previous = before.split('.').map(Number);
  const current = after.split('.').map(Number);
  const firstDifference = current.findIndex((part, i) => part !== previous[i]);
  if (firstDifference === -1 || current[firstDifference] < previous[firstDifference]) {
    throw new Error(`Shipped content changed: bump both adapter versions above ${before}, then npm run sync`);
  }
  return `Release version: ${before} -> ${after}`;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(checkRelease(process.argv[2] || process.env.RELEASE_BASE)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
