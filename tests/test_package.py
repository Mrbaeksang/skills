import pathlib
import subprocess
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]

class PackagingTests(unittest.TestCase):
    def test_installed_skill_has_local_contract_and_does_not_overwrite(self):
        with tempfile.TemporaryDirectory() as temp:
            destination = pathlib.Path(temp) / 'skills'
            command = [sys.executable, str(ROOT / 'scripts/package.py'), 'install', '--dest', str(destination)]
            first = subprocess.run(command, capture_output=True, text=True)
            self.assertEqual(first.returncode, 0, first.stderr)
            skill = destination / 'spec'
            self.assertTrue((skill / 'SKILL.md').is_file())
            self.assertEqual((skill / 'references/execution-contract.md').read_bytes(), (ROOT / 'common/execution-contract.md').read_bytes())
            (skill / 'user-note.txt').write_text('preserve me')
            second = subprocess.run(command, capture_output=True, text=True)
            self.assertNotEqual(second.returncode, 0)
            self.assertEqual((skill / 'user-note.txt').read_text(), 'preserve me')

if __name__ == '__main__':
    unittest.main()

class ValidationTests(unittest.TestCase):
    def test_personal_path_is_rejected_before_any_installation(self):
        import shutil
        with tempfile.TemporaryDirectory() as temp:
            source = pathlib.Path(temp) / 'source'
            shutil.copytree(ROOT / 'skills', source / 'skills')
            (source / 'common').mkdir()
            (source / 'common/execution-contract.md').write_text('Read C:\\Users\\private-user\\secret.txt', encoding='utf-8')
            dest = pathlib.Path(temp) / 'installed'
            result = subprocess.run([sys.executable, str(ROOT / 'scripts/package.py'), 'install', '--source', str(source), '--dest', str(dest)], capture_output=True, text=True)
            self.assertNotEqual(result.returncode, 0)
            self.assertFalse(dest.exists())

    def test_invalid_metadata_and_broken_reference_fail_check(self):
        import shutil
        with tempfile.TemporaryDirectory() as temp:
            source = pathlib.Path(temp)
            shutil.copytree(ROOT / 'skills', source / 'skills')
            shutil.copytree(ROOT / 'common', source / 'common')
            entry = source / 'skills/spec/SKILL.md'
            original = entry.read_text(encoding='utf-8-sig')
            for bad in [original.replace('name: spec', 'name: Wrong_Name'), original + '\n[missing](references/absent.md)', original + '\n[escape](../../outside.md)']:
                with self.subTest(bad=bad[-50:]):
                    entry.write_text(bad, encoding='utf-8')
                    result = subprocess.run([sys.executable, str(ROOT / 'scripts/package.py'), 'check', '--source', str(source)], capture_output=True, text=True)
                    self.assertNotEqual(result.returncode, 0)

if __name__ == '__main__':
    unittest.main()
