# Article Bundle Blog

一个面向 Markdown Article Bundle 的 Astro 静态博客前端。核心目标是让**物理存储、逻辑分类、公开 URL 和前端表现彻底解耦**。

## 1. 技术栈

- Astro 7 Content Collections
- Markdown + KaTeX 数学公式
- Pagefind 静态全文搜索（npm 包含中文/日文扩展索引）
- 原生 CSS，无 React/Vue 运行时
- GitHub Actions + GitHub Pages

## 2. 内容结构

正式文章：

```text
articles/
└─ my-article/
   ├─ blog.md
   ├─ figure-1.png
   ├─ figure-2.svg
   └─ attachment.pdf
```

文章中直接使用相对路径：

```markdown
![结果图](./figure-1.png)
```

Astro 的 glob loader 只读取 `articles/**/blog.md`。其他文件都是该 Article Bundle 的依赖，不参与分类。Markdown 图片由 Astro 解析；构建完成后 `copy_bundle_assets.mjs` 还会把同一 Bundle 内的普通附件（PDF、CSV、ZIP 等）按原相对路径复制到 `/blog/<slug>/`，因此 `[附件](./attachment.pdf)` 也可以直接使用。

## 3. Frontmatter

```yaml
---
title: "Grokking 的潜空间表征"
slug: "grokking-latent-representation"
tree:
  - "人工智能"
  - "表征研究"
tags:
  - "Grokking"
  - "Transformer"
date: 2026-08-12
updated: 2026-08-20
summary: "可选；省略时前端从正文生成。"
---
```

字段说明：

- `title`：展示标题。
- `slug`：公开 URL 的稳定标识，只允许小写英文、数字和连字符。
- `tree`：唯一主要逻辑目录位置，与磁盘位置无关。
- `tags`：多值标签。
- `date`：发布日期。
- `updated`：可选更新时间。
- `summary`：可选；省略时列表和 JSON 索引自动从正文截取。
- `uid`：可选稳定内部 ID，当前前端不依赖它。
- `hidden`：可选，设为 `true` 后不参与公开页面生成。

文章 URL 始终为：

```text
/blog/<slug>/
```

即使 Article Bundle 在磁盘中改名或移动，只要 `slug` 不变，公开 URL 就不变。

## 4. 本地草稿区

新建草稿：

```bash
python scripts/new_draft.py my-post "文章标题"
```

它只在本地创建 `drafts/my-post/blog.md`；`drafts/` 整体被 `.gitignore` 忽略。

根目录 `.gitignore` 包含：

```gitignore
/drafts/
```

因此：

```text
drafts/
└─ new-post/
   ├─ blog.md
   └─ images...
```

完全不会进入 Git。注意：`.gitignore` 不能清除已经提交过的文件，所以不要曾经 commit `drafts/`。

发布：

```bash
python scripts/publish.py my-post
```

脚本会：

1. 检查 `blog.md`。
2. 检查 `title / slug / tree / tags` 字段是否存在。
3. 若缺少 `date`，写入当天日期。
4. 若缺少 `summary`，从正文生成约 170 字摘要。
5. 检查相对 Markdown 图片是否存在。
6. 对仍存在的外链图片给出警告。
7. 整个目录移动到 `articles/`。

它不会自动 push，保留人工检查：

```bash
git add articles
git diff --cached
git commit -m "publish: my-post"
git push
```

## 5. 本地运行

需要 Node 22.12+（部署 workflow 使用 Node 24）。

```bash
npm install
npm run dev
```

开发模式下 Astro 可以正常浏览文章，但 Pagefind 索引尚不存在，所以搜索控件会显示提示。

完整构建：

```bash
npm run build
npm run preview
```

`npm run build` 顺序执行：

```text
astro check
→ astro build
→ dist/
→ copy Article Bundle attachments
→ pagefind --site dist
→ dist/pagefind/
```

Pagefind 只将标记了 `data-pagefind-body` 的正文页纳入索引，同时从文章页读取标题、逻辑目录、标签元数据；标签也预先写入 Pagefind filter，便于以后扩展筛选式搜索。

## 6. 页面

- `/`：Hero + 逻辑目录摘要 + 最近文章。
- `/catalog/`：完整树形目录。
- `/tags/`：全部标签。
- `/tags/<tag>/`：标签文章列表。
- `/archive/`：按年份归档。
- `/search/`：全文搜索。
- `/blog/<slug>/`：文章正文 + TOC + 相关文章。
- `/articles.json`：构建时自动生成的 Article Record 短数据索引。

`articles.json` 不需要人工维护，可以作为未来其他前端或脚本的数据入口。

## 7. GitHub Pages

`.github/workflows/deploy.yml` 在 `main` push 后：

```text
npm install
→ npm run build
→ Astro + Pagefind
→ upload dist/
→ GitHub Pages
```

workflow 会自动判断：

- `username.github.io` 仓库：`BASE_PATH=/`
- 普通项目仓库：`BASE_PATH=/repo-name`

因此站内链接、Pagefind bundle 和搜索结果都可以适配 GitHub Pages 子路径。

在 GitHub 仓库中进入：

```text
Settings → Pages → Source → GitHub Actions
```

即可。

如果使用自定义域名，建议把 `astro.config.mjs` 中的 `site/base` 改为固定配置，或在 workflow 中覆盖 `SITE_URL` 和 `BASE_PATH`。

## 8. 样式结构

```text
src/styles/
├─ tokens.css       # 颜色、字体、尺寸、深浅主题变量
├─ global.css       # 基础布局
├─ components.css   # Header / Hero / 卡片 / 标签 / 目录 / 搜索 / Footer
└─ article.css      # Markdown 正文与 TOC
```

视觉上继承旧博客的主要特征，但没有保留博客园 DOM 选择器：

- `#5c8ec6` 主链接色
- `#6fa3ef` 标签蓝
- `#e8a258` 分类橙
- `#807dd4` 文本选择紫
- `#d83b64` 行内代码红
- 大幅渐变 Hero
- 约 820px 中文正文宽度
- 日夜切换
- 分层页脚

所有装饰均为本地 CSS，不依赖旧主题 CDN。

## 9. 历史文档迁移建议

历史 Markdown 可以一次性执行：

```text
每个 md → 建立独立 Article Bundle
外链图片 → 下载到该 Bundle
原 ![](https://...) → ![](./hash.ext)
旧物理目录 → 初始 tree 元数据
```

之后不再需要统一图片库，也不需要保持物理目录和逻辑目录一致。
