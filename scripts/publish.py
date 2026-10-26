#!/usr/bin/env python3
"""Prepare a draft locally using the shared validator; leaves Git to the author."""
import subprocess
import sys
from pathlib import Path
root = Path(__file__).resolve().parents[1]
if len(sys.argv) != 2:
    raise SystemExit('Usage: python scripts/publish.py <draft-name-or-path>')
source = Path(sys.argv[1])
if not source.is_absolute():
    source = root / source if source.parts[0] == 'drafts' else root / 'drafts' / source
source = source.resolve()
if not source.is_relative_to((root / 'drafts').resolve()):
    raise SystemExit('Only drafts/ bundles can be prepared.')
# YAML parsing and all content rules remain in the shared Node implementation.
script = "import {readArticle} from './src/core/storage.ts'; console.log((await readArticle(process.argv[1])).metadata.slug)"
result = subprocess.run(['node', '--input-type=module', '-e', script, str(source / 'blog.md')], cwd=root, capture_output=True, text=True, encoding='utf-8')
if result.returncode:
    raise SystemExit(result.stderr)
raise SystemExit(subprocess.call(['node', str(root / 'scripts' / 'cli.ts'), 'publish', result.stdout.strip(), '--prepare-only'], cwd=root))
