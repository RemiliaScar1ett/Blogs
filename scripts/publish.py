#!/usr/bin/env python3
"""Move one local draft Article Bundle into articles/ after simple validation.

Usage:
    python scripts/publish.py my-post
    python scripts/publish.py drafts/my-post

This script intentionally avoids a YAML dependency. It validates the few required
frontmatter keys with simple text checks, fills date/summary when absent, checks
local Markdown image references, then moves the entire folder unchanged.
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DRAFTS = ROOT / "drafts"
ARTICLES = ROOT / "articles"
REQUIRED = ("title", "slug", "tree", "tags")


def split_frontmatter(text: str):
    if not text.startswith("---\n"):
        raise ValueError("blog.md 必须以 YAML frontmatter 开始。")
    end = text.find("\n---\n", 4)
    if end < 0:
        raise ValueError("没有找到 frontmatter 结束标记。")
    return text[4:end], text[end + 5 :]


def has_key(frontmatter: str, key: str) -> bool:
    return re.search(rf"(?m)^\s*{re.escape(key)}\s*:", frontmatter) is not None


def derive_summary(body: str, limit: int = 170) -> str:
    text = re.sub(r"```[\s\S]*?```", " ", body)
    text = re.sub(r"\$\$[\s\S]*?\$\$", " ", text)
    text = re.sub(r"!\[[^\]]*\]\([^)]*\)", " ", text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = re.sub(r"(?m)^#{1,6}\s+", "", text)
    text = re.sub(r"(?m)^>\s?", "", text)
    text = re.sub(r"[*_~`]", "", text)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) > limit:
        text = text[:limit].rstrip() + "……"
    return text or "（暂无摘要）"


def validate_local_images(bundle: Path, body: str):
    missing = []
    external = []
    for match in re.finditer(r"!\[[^\]]*\]\(([^)\s]+)(?:\s+[\"'][^\"']*[\"'])?\)", body):
        target = match.group(1)
        if re.match(r"https?://", target):
            external.append(target)
            continue
        if target.startswith("/") or target.startswith("data:"):
            continue
        path = (bundle / target).resolve()
        if not path.exists():
            missing.append(target)
    return missing, external


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("draft", help="draft 名称或 drafts/ 下的目录路径")
    args = parser.parse_args()

    source = Path(args.draft)
    if not source.is_absolute():
        source = source if source.parts and source.parts[0] == "drafts" else DRAFTS / source
        source = ROOT / source if not source.is_absolute() else source
    source = source.resolve()

    try:
        source.relative_to(DRAFTS.resolve())
    except ValueError as exc:
        raise SystemExit("只允许发布 drafts/ 中的目录。") from exc

    blog = source / "blog.md"
    if not blog.exists():
        raise SystemExit(f"缺少 {blog}")

    text = blog.read_text(encoding="utf-8")
    frontmatter, body = split_frontmatter(text)
    missing_keys = [key for key in REQUIRED if not has_key(frontmatter, key)]
    if missing_keys:
        raise SystemExit("frontmatter 缺少字段: " + ", ".join(missing_keys))

    additions = []
    if not has_key(frontmatter, "date"):
        additions.append(f"date: {dt.date.today().isoformat()}")
    if not has_key(frontmatter, "summary"):
        additions.append("summary: " + json.dumps(derive_summary(body), ensure_ascii=False))

    if additions:
        frontmatter = frontmatter.rstrip() + "\n" + "\n".join(additions) + "\n"
        blog.write_text("---\n" + frontmatter + "---\n" + body, encoding="utf-8")
        text = blog.read_text(encoding="utf-8")
        frontmatter, body = split_frontmatter(text)

    missing_images, external_images = validate_local_images(source, body)
    if missing_images:
        raise SystemExit("以下本地图片引用不存在:\n- " + "\n- ".join(missing_images))
    if external_images:
        print("警告：文章仍包含外链图片，建议发布前本地化：")
        for url in external_images:
            print(" -", url)

    target = ARTICLES / source.name
    if target.exists():
        raise SystemExit(f"目标已存在: {target}")

    ARTICLES.mkdir(parents=True, exist_ok=True)
    shutil.move(str(source), str(target))
    print(f"已发布到: {target.relative_to(ROOT)}")
    print("下一步: git add articles && git diff --cached")


if __name__ == "__main__":
    main()
