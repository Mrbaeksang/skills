"""Build portable skill folders; never mutate an existing installation."""
import argparse
import pathlib
import re
import shutil
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]


def check_portability(file):
    text = file.read_text(encoding='utf-8-sig')
    if re.search(r'(?i)(?:[A-Z]:[\\/](?:Users|Baeksang)[\\/]|/(?:Users|home)/[^/\s]+/)', text):
        raise ValueError(f'{file.name}: personal absolute path in package')
    if re.search(r'(?i)(?:sk-proj-[a-z0-9]{12,}|gh[pousr]_[a-z0-9]{20,}|(?:api_key|access_token)\s*[=:]\s*[\"\']?[a-z0-9_-]{16,})', text):
        raise ValueError(f'{file.name}: possible credential in package')


def collect(source):
    skills = sorted((source / 'skills').glob('*/SKILL.md'))
    if not skills:
        raise ValueError('No skills found')
    contract = source / 'common/execution-contract.md'
    if not contract.is_file():
        raise ValueError('Missing common execution contract')
    check_portability(contract)
    names = set()
    for entry in skills:
        text = entry.read_text(encoding='utf-8-sig')
        front = re.match(r'\A---\r?\n(.*?)\r?\n---(?:\r?\n|$)', text, re.S)
        if not front:
            raise ValueError(f'{entry.name}: missing frontmatter')
        metadata = {}
        for line in front[1].splitlines():
            match = re.fullmatch(r'([a-z-]+): (.+)', line)
            if not match or match[1] in metadata:
                raise ValueError(f'{entry.parent.name}: use unique flat scalar metadata fields')
            metadata[match[1]] = match[2].strip().strip('\"\'')
        name = metadata.get('name', '')
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name) or len(name) > 64 or name != entry.parent.name:
            raise ValueError(f'Invalid skill name: {name}')
        if name.casefold() in names:
            raise ValueError(f'Duplicate skill: {name}')
        names.add(name.casefold())
        if not 1 <= len(metadata.get('description', '')) <= 1024:
            raise ValueError(f'{name}: missing or oversized description')
        unknown = metadata.keys() - {'name', 'description', 'license', 'compatibility'}
        if unknown:
            raise ValueError(f'{name}: unsupported metadata: {sorted(unknown)}')
        if 'compatibility' in metadata and not 1 <= len(metadata['compatibility']) <= 500:
            raise ValueError(f'{name}: invalid compatibility')
        for file in entry.parent.rglob('*'):
            if file.is_symlink():
                raise ValueError(f'{name}: symbolic links are not portable')
            if file.is_file() and file.suffix == '.md':
                check_portability(file)
                for target in re.findall(r'\[[^\]]*\]\(([^)]+)\)', file.read_text(encoding='utf-8-sig')):
                    if re.match(r'https?://|#', target):
                        continue
                    path = (file.parent / target.split('#')[0]).resolve()
                    if not path.is_relative_to(entry.parent.resolve()):
                        raise ValueError(f'{name}: reference escapes skill: {target}')
                    shared = entry.parent / 'references/execution-contract.md'
                    if path != shared.resolve() and not path.is_file():
                        raise ValueError(f'{name}: missing reference: {target}')
        shared = entry.parent / 'references/execution-contract.md'
        if shared.exists():
            raise ValueError(f'{name}: shared contract must only exist in common/')
    return skills


def install(source, destination):
    entries = collect(source)
    for entry in entries:
        if (destination / entry.parent.name).exists():
            raise ValueError(f'Name collision: {entry.parent.name}; existing installation preserved')
    destination.mkdir(parents=True, exist_ok=True)
    for entry in entries:
        target = destination / entry.parent.name
        shutil.copytree(entry.parent, target)
        (target / 'references').mkdir(exist_ok=True)
        shutil.copyfile(source / 'common/execution-contract.md', target / 'references/execution-contract.md')
    return len(entries)


def bundle(source, destination):
    if destination.exists():
        raise ValueError('Bundle destination exists; build into a new directory and review the diff')
    manifests = [(source / 'adapters' / host / 'plugin.json', f'.{host}-plugin/plugin.json')
                 for host in ('codex', 'claude')]
    manifests = [(path, target) for path, target in manifests if path.is_file()]
    if not manifests:
        raise ValueError('No native plugin adapters found')
    for path, _ in manifests:
        check_portability(path)
    count = install(source, destination / 'skills')
    if (source / 'LICENSE').is_file():
        shutil.copyfile(source / 'LICENSE', destination / 'LICENSE')
    if (source / 'adapters/README.md').is_file():
        shutil.copyfile(source / 'adapters/README.md', destination / 'README.md')
    for path, relative in manifests:
        target = destination / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(path, target)
    return count


def check_bundle(source, destination):
    with tempfile.TemporaryDirectory() as temp:
        expected = pathlib.Path(temp) / 'plugin'
        count = bundle(source, expected)
        def files(root):
            result = {}
            for file in root.rglob('*'):
                if file.is_symlink():
                    raise ValueError('Bundle must not contain symbolic links')
                if file.is_file():
                    result[file.relative_to(root).as_posix()] = file.read_bytes()
            return result
        if files(expected) != files(destination):
            raise ValueError('Shipping bundle is stale or contains unexpected files; rebuild and review')
    return count


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['check', 'install', 'bundle', 'check-bundle'])
    parser.add_argument('--source', type=pathlib.Path, default=ROOT)
    parser.add_argument('--dest', type=pathlib.Path)
    args = parser.parse_args()
    try:
        if args.command == 'check':
            count = len(collect(args.source))
        else:
            if args.dest is None:
                parser.error(f'{args.command} requires --dest')
            operation = {'install': install, 'bundle': bundle, 'check-bundle': check_bundle}[args.command]
            count = operation(args.source.resolve(), args.dest.resolve())
        print(f'{args.command}: {count} skill(s) passed')
    except (ValueError, OSError) as error:
        print(str(error), file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
