import json
import pathlib
import subprocess
import sys
import tempfile
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]


class BundleTests(unittest.TestCase):
    def run_cli(self, command, dest):
        return subprocess.run([sys.executable, str(ROOT / 'scripts/package.py'), command,
                               '--dest', str(dest)], capture_output=True, text=True)

    def test_shipping_bundle_is_self_contained_and_preserves_existing_destination(self):
        with tempfile.TemporaryDirectory() as temp:
            dest = pathlib.Path(temp) / 'plugin'
            result = self.run_cli('bundle', dest)
            self.assertEqual(result.returncode, 0, result.stderr)
            manifest = json.loads((dest / '.codex-plugin/plugin.json').read_text())
            self.assertEqual(manifest['skills'], './skills/')
            claude = json.loads((dest / '.claude-plugin/plugin.json').read_text())
            self.assertEqual(claude['skills'], './skills/')
            self.assertEqual(claude['license'], 'MIT')
            self.assertEqual((dest / 'LICENSE').read_bytes(), (ROOT / 'LICENSE').read_bytes())
            self.assertEqual((dest / 'README.md').read_bytes(), (ROOT / 'adapters/README.md').read_bytes())
            self.assertEqual((dest / 'skills/spec/references/execution-contract.md').read_bytes(),
                             (ROOT / 'common/execution-contract.md').read_bytes())
            self.assertEqual(self.run_cli('check-bundle', dest).returncode, 0)
            (dest / 'user-note').write_text('preserve')
            self.assertNotEqual(self.run_cli('bundle', dest).returncode, 0)
            self.assertEqual((dest / 'user-note').read_text(), 'preserve')
            self.assertNotEqual(self.run_cli('check-bundle', dest).returncode, 0)
