# 技术博客

使用独立文章包、本地 Git 和 GitHub Pages 的技术博客。正文目前支持 Markdown 与 LaTeX；内容读取、校验、渲染、页面展示和发布流程分别维护。

## 开始写作

需要 Node.js 24 和 Git。首次安装使用锁文件：

```bash
npm ci
npm run new -- my-post "文章标题"
npm run preview:draft -- my-post
```

编辑 `drafts/my-post/blog.md`，把图片和附件放在同一文章包内。新建草稿会生成稳定的 `uid`，正文可以先留空；空正文不能发布。草稿和预览缓存不进入 Git。

预览地址为 `http://127.0.0.1:4321/draft-preview/my-post/`，仅监听本机。正文和资源修改后自动刷新；使用 Ctrl+C 停止。预览使用正式渲染器，显示公式、图片、代码和目录。生产构建不输出草稿页面、草稿索引或草稿资源。

作者维护以下 frontmatter：

```yaml
---
title: "文章标题"
slug: my-post
uid: "由新建命令生成并保留"
tree:
  - 笔记
  - 数据结构
tags:
  - 线段树
summary: "可选的人工摘要；省略时自动从正文生成。"
---
```

`tree` 表示唯一主分类，`tags` 表示独立主题标签。文章包可以移动或改名；只要 `slug` 保持不变，公开地址 `/blog/my-post/` 及相对资源链接就保持不变。slug 使用小写字母、数字和连字符，并且全站唯一。

正文中的资源使用相对地址：

```markdown
![示意图](./images/figure.svg)

[下载数据](./data.csv)

行内公式 $a^2+b^2=c^2$。

$$
\sum_{i=1}^{n} i = \frac{n(n+1)}{2}
$$
```

公开资源清单只包含公开文章引用或渲染器声明的资源。未被引用的文章包文件不会直接复制到网站。文章包外的相对资源、缺失文件、重复输出路径及公式错误会阻止构建；如需引用另一篇文章，使用它的站内绝对地址，例如 `/blog/other-post/`。

## 发布与更新

```bash
npm run publish -- my-post --dry-run
npm run publish -- my-post
```

发布前要求处于 `main` 分支、暂存区为空、本地 HEAD 与远端 `origin/main` 一致；工作区已有跟踪文件的改动只能涉及目标文章包。未跟踪的其他文件不会被提交。站点代码变更需要先按正常开发流程提交并同步，再发布文章。

发布命令依次执行：

1. 获取远端状态并检查文章和 Git 状态。
2. 在 `.cache/publication/` 中创建候选站点，补齐系统元数据。
3. 校验全站内容，执行类型检查、生产构建、资源复制、搜索索引构建和本地链接检查。
4. 验证原稿未在构建期间变化，然后写入正式文章包。
5. 只暂存目标文章包，提交并推送至 `origin/main`。
6. 输出提交 SHA、文章地址和 GitHub Actions 入口。推送成功表示已触发部署，部署结果以工作流为准。

`--dry-run` 执行同样的候选构建，显示目标范围与候选时间戳，不写入正式文章或创建提交。实际发布会重新计算首次发布时间。

后续直接修改 `articles/<文章包>/blog.md` 或包内资源，再使用相同发布命令。没有实际文件变化时不创建新提交。

| 字段 | 维护方式 |
|---|---|
| `uid` | 新建时生成；更新保留原值 |
| `publishedAt` | 首次发布生成 UTC ISO 8601 时间戳；后续保留 |
| `updatedAt` | 已发布文章实际变化时生成 |
| `summary` | 人工填写优先；缺省时每次构建从正文派生，不将自动摘要固化为人工字段 |
| 目录、检索文本、资源清单 | 每次构建从统一渲染结果派生 |
| `date`、`updated` | 兼容历史日期字符串 |
| `dateKind: collected` | 历史收录日期，页面标注“收录” |
| `hidden: true` | 保留源文件，排除公开页面、JSON、搜索和资源 |

时间戳默认按 `America/Denver` 显示，可用 `SITE_TIME_ZONE` 设置 IANA 时区；历史 `YYYY-MM-DD` 字符串按原日期解释。迁移文章保留既有日期，没有补造原始精确发布时间。

## 删除文章

删除 `articles/` 中目标文章的整个文章包，包括正文和专属资源。运行 `npm run build` 与 `npm run test:output`，确认没有其他文章引用已删除的页面或附件，然后只提交这些文章包的删除并推送至 `origin/main`。

每次生产构建都会重新生成页面、公开资源、分类计数、标签、归档、JSON 和搜索索引；不再使用的标签页也会移除。部署成功后，原文章和专属资源地址返回 404。删除记录保留在 Git 历史中，可以恢复对应文章包后重新构建和部署。

## 失败处理

| 阶段 | 保留状态与下一步 |
|---|---|
| 内容校验或构建失败 | 原稿保持原样；按源文件和行号修正后重新发布 |
| 提交失败 | 恢复本次自动写入和暂存；作者原先的修改保留，修复 Git 配置或提交钩子后重新发布 |
| 推送失败 | 保留本地提交、时间戳和恢复记录；恢复连接后执行下方重试命令 |
| 重试时分支或 HEAD 已变化 | 停止推送；先核对恢复记录中的 SHA，再恢复对应状态 |
| 进程异常中断 | 保留 `.cache/publication/recovery.json`；已经记录提交的情况可重试推送；提交前中断需先核对记录中的原稿与目标文件 |

```bash
npm run publish -- my-post --retry-push
```

重试只推送原提交，不重新构建或生成时间戳。若远端已接收该提交，会直接完成清理。成功后删除未发生后续编辑的源草稿；发布期间又被修改的草稿会保留。发布锁会阻止同时发布，进程退出后的失效锁可在下一次启动时清理。

旧 Python 入口仍可用：

```bash
python scripts/new_draft.py my-post "文章标题"
python scripts/publish.py my-post
```

Python 新建入口代理到 Node CLI。Python 发布入口保留“准备文章”的用途：执行共享校验和候选构建后移入 `articles/`，由作者自行检查、提交和推送。

## 运行与验收

可复现的测试脚本保存在 `tests/` 并参与版本管理。测试创建的临时 Git 仓库、候选站点和日志统一写入 `.cache/`，临时仓库由测试结束钩子清理；草稿、构建产物、覆盖率和测试报告目录由 `.gitignore` 排除。提交前可用 `git status --short --untracked-files=all` 核对范围。

```bash
npm run dev
npm run check
npm test
npm run build
npm run test:output
npm run preview
```

开发服务器搜索使用标准正文检索文本；生产搜索使用 Pagefind。页面提供搜索框、Ctrl/Cmd+K 弹窗、目录、标签及时间归档。搜索页用 URL 的 `q` 参数保存查询词。

`npm test` 覆盖重复标识、无效日期、空正文、缺失资源、公式诊断、隐藏文章、移动文章包、标签碰撞、渲染器扩展，以及临时 Git 远端中的发布、更新、无变化、构建失败、提交失败和推送重试。另有真实历史文章的完整候选生产构建测试，以及删除文章后在同一输出目录重新构建的测试，验证页面、专属资源、分类和搜索记录同步移除，共用资源仍可使用。

`npm run build` 读取一次公开文章清单，执行 Astro 检查和构建，再输出声明资源和 Pagefind 索引，最后检查页面链接、锚点、重复 HTML ID 和公式错误。`npm run test:output` 验证公开文章数量、草稿与隐藏内容排除，并通过实际生成的搜索索引查询中文标题、题号和正文词。

根路径与子路径分别构建验收。PowerShell 示例：

```powershell
$env:BASE_PATH = "/"
npm run build
npm run test:output
$env:BASE_PATH = "/Blogs"
npm run build
npm run test:output
Remove-Item Env:BASE_PATH
```

浏览器验收需另外执行：在 375、768、1440 像素宽度与明暗主题下检查首页及代表性长文，确认正文无整页横向滚动、长公式和表格局部滚动、目录跳转、代码复制及搜索键盘操作。自动化内容检查不代替这一步。

## 模块边界

| 模块 | 文件入口 | 职责 |
|---|---|---|
| 存储适配器 | `src/core/storage.ts` | 读取文章包、frontmatter 和正文输入 |
| 内容模型与规则 | `src/core/types.ts`、`metadata.ts`、`repository.ts` | 身份、日期、公开范围与校验 |
| 渲染器 | `src/core/renderer.ts`、`src/renderers/markdown.ts` | 标准 HTML、目录、摘要、检索文本、资源和诊断 |
| 展示与查询 | `src/components/ArticleView.astro`、`src/core/search.ts`、`src/client/search.ts` | 页面、分类、主题和搜索交互 |
| 发布流程 | `src/publishing/`、`scripts/cli.ts` | 候选构建、Git 提交、推送与恢复 |

`ArticleRecord` 不依赖 Astro 的 `CollectionEntry`，也不携带 Markdown 语法树。`ArticleDocument` 保存正文格式、源内容、源路径和文章包位置。

新正文格式实现 `Renderer` 并注册到 `RendererRegistry`，返回 `html`、`headings`、`summaryText`、`searchText`、`assets` 和 `diagnostics`。Markdown 块级扩展通过 `createMarkdownRenderer({ remark, rehype })` 注册插件。表达工具的语法处理留在渲染器内，页面和发布流程消费同一结果。

资源可声明图片、附件、样式或脚本，既可引用文件，也可提供生成内容；入口样式和脚本由文章页面挂载。摘要与检索文本分别从解析后的正文生成：摘要跳过公式与代码块，检索保留正文和代码文本。Pagefind 使用 Node API 添加标准记录，不从页面 DOM 提取正文。

`/articles.json` 保留 title、slug、tree、tags、date、updated、summary、url，并增补 uid、publishedAt、updatedAt、dateKind。

## GitHub Pages

工作流位于 `.github/workflows/deploy.yml`。PR 和 main 推送均运行锁文件安装、测试及根路径/子路径验收；main 推送随后构建正式路径并部署。

工作流按仓库名称生成 `BASE_PATH`：用户主页仓库使用根路径，普通项目使用仓库子路径；`SITE_URL` 指向 GitHub Pages 主机。自定义域名可在工作流中覆盖这两个变量。仓库 Pages 设置的 Source 应为 GitHub Actions。

样式集中在 `src/styles/`，颜色、字体及间距由 `tokens.css` 维护。主色与日夜主题沿用现有设计，文章页支持桌面目录、移动端折叠目录、代码复制和长内容局部滚动。
