#!/usr/bin/env python3
"""Compatibility entrypoint for the shared Node authoring CLI."""
import subprocess
import sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
raise SystemExit(subprocess.call(['node', str(root / 'scripts' / 'cli.ts'), 'new', *sys.argv[1:]], cwd=root))
