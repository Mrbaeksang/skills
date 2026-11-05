/** Dependency-free maintainer validation and generated-file synchronization. */
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exists = file => { try { fs.lstatSync(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } };
const bytes = file => fs.readFileSync(file);
const text = file => bytes(file).toString('utf8').replace(/^\uFEFF/, '');
function contained(root, target) {
  const relative = path.relative(root, target);
  return relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}
function noLinks(file) {
  let current = path.resolve(file);
  while (true) {
    if (exists(current) && fs.lstatSync(current).isSymbolicLink()) throw new Error(`Symbolic links are not portable: ${current}`);
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
}
export function files(root) {
  noLinks(root);
  const result = new Map();
  if (!exists(root)) return result;
  function visit(dir) {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isSymbolicLink()) throw new Error(`Symbolic links are not portable: ${file}`);
      if (item.isDirectory()) visit(file);
      else if (item.isFile()) result.set(path.relative(root, file).split(path.sep).join('/'), bytes(file));
      else throw new Error(`Unsupported file: ${file}`);
    }
  }
  visit(root);
  return result;
}
function portable(file, content) {
  if (/(?:[A-Z]:[\\/](?:Users|Baeksang)[\\/]|\/(?:Users|home)\/[^/\s]+\/)/i.test(content)) throw new Error(`${file}: personal absolute path`);
  if (/(?:sk-proj-[a-z0-9]{12,}|gh[pousr]_[a-z0-9]{20,}|(?:api_key|access_token)\s*[=:]\s*["']?[a-z0-9_-]{16,})/i.test(content)) throw new Error(`${file}: possible credential`);
}
export function validateSkill(dir) {
  const inventory = files(dir);
  for (const [file, data] of inventory) {
    if (!file.endsWith('.md')) continue;
    const content = data.toString('utf8');
    portable(file, content);
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^https?:\/\/|^#/.test(target)) continue;
      const resolved = path.resolve(dir, path.dirname(file), target.split('#')[0]);
      if (!contained(dir, resolved)) throw new Error(`${file}: reference escapes skill: ${target}`);
      noLinks(resolved);
      if (!exists(resolved) || !fs.statSync(resolved).isFile()) throw new Error(`${file}: missing reference: ${target}`);
    }
  }
  return inventory;
}
function plan(source) {
  noLinks(source);
  const shared = files(path.join(source, 'common'));
  for (const name of ['execution-contract.md', 'tracker-state.md', 'workspace-lifecycle.md']) {
    if (!shared.has(name)) throw new Error(`Missing required common contract: ${name}`);
  }
  for (const [name, data] of shared) {
    if (!/^[^/]+\.md$/.test(name)) throw new Error(`Unsupported common file: ${name}`);
    portable(name, data.toString('utf8'));
  }
  const entries = fs.readdirSync(path.join(source, 'skills')).sort();
  if (!entries.length) throw new Error('No skills found');
  const mirrors = new Map();
  const plugin = new Map();
  for (const name of entries) {
    const dir = path.join(source, 'skills', name);
    const inventory = files(dir);
    const front = text(path.join(dir, 'SKILL.md')).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!front) throw new Error(`${name}: missing frontmatter`);
    const metadata = {};
    for (const line of front[1].split(/\r?\n/)) {
      const field = line.match(/^([a-z-]+): (.+)$/);
      if (!field || Object.hasOwn(metadata, field[1])) throw new Error(`${name}: use unique flat scalar metadata fields`);
      metadata[field[1]] = field[2].trim().replace(/^["']|["']$/g, '');
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || name.length > 64 || metadata.name !== name) throw new Error(`Invalid skill name: ${name}`);
    if (!metadata.description || metadata.description.length > 1024) throw new Error(`${name}: missing or oversized description`);
    if (Object.keys(metadata).some(key => !['name', 'description', 'license', 'compatibility'].includes(key))) throw new Error(`${name}: unsupported metadata`);
    if ('compatibility' in metadata && (!metadata.compatibility.length || metadata.compatibility.length > 500)) throw new Error(`${name}: invalid compatibility`);
    for (const [file, data] of shared) {
      const relative = `references/${file}`;
      mirrors.set(`skills/${name}/${relative}`, data);
      inventory.set(relative, data);
    }
    // Validate the proposed contents before any writes, including first-time mirrors.
    for (const [file, data] of inventory) {
      if (!file.endsWith('.md')) continue;
      const content = data.toString('utf8');
      portable(file, content);
      for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
        if (/^https?:\/\/|^#/.test(match[1])) continue;
        const target = path.resolve(dir, path.dirname(file), match[1].split('#')[0]);
        if (!contained(dir, target)) throw new Error(`${name}: reference escapes skill: ${match[1]}`);
        if (!inventory.has(path.relative(dir, target).split(path.sep).join('/'))) throw new Error(`${name}: missing reference: ${match[1]}`);
      }
    }
    for (const [file, data] of inventory) plugin.set(`skills/${name}/${file}`, data);
  }
  let releaseVersion;
  for (const host of ['codex', 'claude']) {
    const file = path.join(source, 'adapters', host, 'plugin.json');
    noLinks(file);
    const content = text(file);
    portable(file, content);
    const manifest = JSON.parse(content);
    if (manifest.skills !== './skills/') throw new Error(`${host}: plugin must consume assembled skills`);
    if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(manifest.version)) throw new Error(`${host}: expected stable major.minor.patch version`);
    if (releaseVersion && manifest.version !== releaseVersion) throw new Error('Plugin adapter versions must match');
    releaseVersion = manifest.version;
    plugin.set(`.${host}-plugin/plugin.json`, bytes(file));
  }
  for (const [sourceFile, target] of [['LICENSE', 'LICENSE'], ['adapters/README.md', 'README.md']]) {
    noLinks(path.join(source, sourceFile));
    plugin.set(target, bytes(path.join(source, sourceFile)));
  }
  return { entries, mirrors, plugin };
}
function compare(root, expected, exact = false) {
  const actual = exact ? files(root) : null;
  for (const [file, data] of expected) {
    const target = path.join(root, file);
    noLinks(target);
    if (!exists(target) || !bytes(target).equals(data)) throw new Error(`Generated file missing or stale: ${target}; run npm run sync`);
  }
  if (actual && [...actual.keys()].some(file => !expected.has(file))) throw new Error(`Unexpected generated bundle file in ${root}; review manually`);
}
function write(root, expected) {
  for (const [file, data] of expected) {
    const target = path.join(root, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, data);
  }
}
function preflight(root, expected) {
  for (const file of expected.keys()) {
    const target = path.join(root, file);
    noLinks(target);
    if (exists(target) && !fs.lstatSync(target).isFile()) throw new Error(`Generated file target is not a regular file: ${target}`);
    let parent = path.dirname(target);
    while (true) {
      if (exists(parent) && !fs.lstatSync(parent).isDirectory()) throw new Error(`Generated parent is not a directory: ${parent}`);
      const next = path.dirname(parent);
      if (next === parent) break;
      parent = next;
    }
  }
}
export function run(command, source = ROOT, destination) {
  source = path.resolve(source);
  const { entries, mirrors, plugin } = plan(source);
  const shipping = path.join(source, 'plugins/skills');
  if (command === 'sync') {
    // Only known generated paths may change; preserve unexpected user files.
    for (const file of files(shipping).keys()) if (!plugin.has(file)) throw new Error(`Unexpected generated bundle file: ${file}; review manually`);
    preflight(source, mirrors);
    preflight(shipping, plugin);
    write(source, mirrors);
    write(shipping, plugin);
  } else if (command === 'check') {
    compare(source, mirrors);
    for (const name of entries) validateSkill(path.join(source, 'skills', name));
    compare(shipping, plugin, true);
  } else if (command === 'bundle') {
    if (!destination) throw new Error('bundle requires --dest');
    destination = path.resolve(destination);
    noLinks(destination);
    if (exists(destination)) throw new Error('Bundle destination exists; existing files preserved');
    compare(source, mirrors);
    write(destination, plugin);
  } else throw new Error(`Unknown command: ${command}. Use check, sync, or bundle.`);
  return entries.length;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, ...args] = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i += 2) {
      if (!['--source', '--dest'].includes(args[i]) || !args[i + 1] || Object.hasOwn(options, args[i])) throw new Error('Use [--source directory] [--dest directory]');
      options[args[i]] = args[i + 1];
    }
    console.log(`${command}: ${run(command, options['--source'], options['--dest'])} skill(s) passed`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
