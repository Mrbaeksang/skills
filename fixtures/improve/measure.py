"""Bounded same-workload experiment; writes only to a temporary directory."""
import cProfile
import hashlib
import importlib
import io
import json
import platform
import pstats
from pathlib import Path
import shutil
import statistics
import subprocess
import sys
import tempfile
import time


def main():
    source = Path(__file__).resolve().parent
    with tempfile.TemporaryDirectory(prefix="improve-perf-") as temporary:
        root = Path(temporary)
        for name in ("app.py", "orders.py", "reports.py", "catalog.py", "pricing.py", "test_preview.py"):
            shutil.copyfile(source / name, root / name)
        sys.path.insert(0, str(root))
        sys.dont_write_bytecode = True
        app = importlib.import_module("app")
        workload = [(f"sku-{i}", 2) for i in range(2000)]
        expected_total = 4002000
        before = app.preview
        # Keep the baseline function object alive through its original modules.
        profiler = cProfile.Profile()
        profiler.runcall(before, workload)
        stream = io.StringIO()
        pstats.Stats(profiler, stream=stream).sort_stats("cumulative").print_stats(8)
        baseline_profile = stream.getvalue().replace(str(root), "<fixture>")
        regression_before = subprocess.run([sys.executable, "-B", "test_preview.py"], cwd=root, capture_output=True, text=True)
        shutil.copyfile(source / "pricing_after.py", root / "pricing.py")
        for name in ("app", "orders", "reports", "pricing"):
            del sys.modules[name]
        importlib.invalidate_caches()
        after = importlib.import_module("app").preview
        regression_after = subprocess.run([sys.executable, "-B", "test_preview.py"], cwd=root, capture_output=True, text=True)
        assert regression_before.returncode == regression_after.returncode == 0, regression_before.stderr + regression_after.stderr
        baseline = before(workload)
        assert baseline["total"] == expected_total and len(baseline["report"]) == 2000
        assert after(workload) == baseline
        samples = {"before": [], "after": []}
        errors = 0
        for _ in range(7):
            for name, function in (("before", before), ("after", after)):
                start = time.perf_counter()
                result = function(workload)
                elapsed = time.perf_counter() - start
                assert result == baseline
                samples[name].append(elapsed * 1000)
        profiler = cProfile.Profile()
        profiler.runcall(after, workload)
        stream = io.StringIO()
        pstats.Stats(profiler, stream=stream).sort_stats("cumulative").print_stats(8)
        print(json.dumps({
            "python": platform.python_version(), "platform": platform.platform(),
            "workload": "preview: 2000 unique SKUs, quantity 2; warm in-process catalog; 7 A/B pairs",
            "workload_sha256": hashlib.sha256(json.dumps(workload).encode()).hexdigest(),
            "samples_ms": samples,
            "summary_ms": {name: {"median": statistics.median(values), "min": min(values), "max": max(values)} for name, values in samples.items()},
            "errors": errors, "output_total": expected_total, "output_rows": 2000,
            "regression_before": regression_before.stderr, "regression_after": regression_after.stderr,
            "baseline_profile": baseline_profile,
            "after_profile": stream.getvalue().replace(str(root), "<fixture>"),
            "limits": "Synthetic in-process end-to-end preview only; excludes process startup/index construction; memory and concurrent machine load unmeasured; no service/production speedup claim."
        }, indent=2))


if __name__ == "__main__":
    main()
