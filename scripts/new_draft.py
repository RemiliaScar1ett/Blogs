#!/usr/bin/env python3
"""Create one local-only Article Bundle under drafts/.

Usage:
    python scripts/new_draft.py my-post "文章标题"
"""
from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DRAFTS = ROOT / "drafts"
TEMPLATE = ROOT / "templates" / "article" / "blog.md"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("slug", help="公开 URL slug，小写英文/数字/连字符")
    parser.add_argument("title", nargs="?", help="文章标题；省略时暂用 slug")
    args = parser.parse_args()

    slug = args.slug.strip()
    if not re.fullmatch(r"[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?", slug):
        raise SystemExit("slug 只允许小写英文、数字和连字符。")

    target = DRAFTS / slug
    if target.exists():
        raise SystemExit(f"草稿目录已存在: {target}")

    title = (args.title or slug).replace('"', '\\"')
    text = TEMPLATE.read_text(encoding="utf-8")
    text = text.replace("{{ slug }}", slug).replace("{{ title }}", title)

    target.mkdir(parents=True)
    (target / "blog.md").write_text(text, encoding="utf-8")
    print(f"已创建: {target.relative_to(ROOT)}")
    print("图片、附件直接放进这个目录或它的子目录，并在 blog.md 中使用相对路径。")


if __name__ == "__main__":
    main()
