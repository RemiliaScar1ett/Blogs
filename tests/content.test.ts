import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, writeFile, rename, readFile } from 'node:fs/promises';
import path from 'node:path';
import { workspace, article } from './helpers.ts';
import { loadArticles, articleJSON } from '../src/core/repository.ts';
import { calendarDate, splitFrontmatter } from '../src/core/metadata.ts';
import { tagSlug, treeAnchor } from '../src/core/urls.ts';
import { assetManifest, writeAssets } from '../src/core/assets.ts';
import { RendererRegistry } from '../src/core/renderer.ts';
import { createMarkdownRenderer } from '../src/renderers/markdown.ts';
import { buildArticleTree } from '../src/lib/tree.ts';

test('隐藏文章在渲染、资源和公开索引之前排除；移动文章包保留 URL', async (t) => {
  const root = await workspace(t);
  await article(root, 'articles/original', { slug: 'stable' }, '正文。\n\n![图片](./figure.svg?raw=1#shape)\n\n[附件](./data.csv)');
  await writeFile(path.join(root, 'articles/original/figure.svg'), '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  await writeFile(path.join(root, 'articles/original/data.csv'), 'a,b\n1,2');
  await article(root, 'articles/secret', { hidden: true, format: 'unregistered' }, '![私有资源](./missing.png)');
  await article(root, 'drafts/draft', {}, '草稿不应出现在输出。');
  const before = await loadArticles(root, { base: '/repo/' });
  assert.equal(before.length, 1);
  assert.equal(before[0].url, '/repo/blog/stable/');
  assert.match(before[0].rendered.html, /\/repo\/blog\/stable\/figure.svg\?raw=1#shape/);
  assert.equal((await assetManifest(before)).length, 2);
  assert.equal(articleJSON(before[0]).slug, 'stable');
  await mkdir(path.join(root, 'articles/moved'));
  await rename(path.join(root, 'articles/original'), path.join(root, 'articles/moved/new-name'));
  const after = await loadArticles(root, { base: '/repo' });
  assert.equal(after[0].url, before[0].url);
  assert.equal(after[0].rendered.html, before[0].rendered.html);
  assert.equal(after[0].uid, before[0].uid);
  assert.equal(buildArticleTree(after).reduce((sum, node) => sum + node.count, 0), 1);
});

test('重复 slug 和 UID、无效元数据、空公开正文阻止构建', async (t) => {
  const root = await workspace(t);
  const a = await article(root, 'articles/a', { slug: 'same', uid: 'uid-a' });
  const b = await article(root, 'articles/b', { slug: 'same', uid: 'uid-b' });
  await assert.rejects(loadArticles(root), /重复 slug/);
  await article(root, 'articles/b', { uid: 'uid-a' });
  await assert.rejects(loadArticles(root), /重复 uid/);
  await article(root, 'articles/b', { date: '2026-02-30' });
  await assert.rejects(loadArticles(root), /日期不存在/);
  await article(root, 'articles/b', {}, '');
  await assert.rejects(loadArticles(root), /正文为空/);
  assert.throws(() => splitFrontmatter('---\ntitle: [broken\n---\n正文', a), /YAML|flow sequence|end with/i);
  assert.throws(() => splitFrontmatter('---\ntitle: 示例\nslug: bad/path\ntree: []\n---\n正文', b), /元数据无效/);
});

test('公式错误和资源错误带源位置，代码不触发公式解析', async (t) => {
  const root = await workspace(t);
  const file = await article(root, 'articles/a', {}, '介绍。\n\n$\\notARealCommand{x}$');
  await assert.rejects(loadArticles(root), (error: any) => error.message.includes(file) && /:\d+:\d+:/.test(error.message));
  await article(root, 'articles/a', {}, '![图](./missing.svg)');
  await assert.rejects(loadArticles(root), /缺少本地资源/);
  await article(root, 'articles/a', {}, '[逃逸](../../private.txt)');
  await assert.rejects(loadArticles(root), /资源越出文章包/);
  await article(root, 'articles/a', {}, '正文说明。\n\n## 标题\n\n$x^2$\n\n```cpp\nint searchableCode = 1; // $\\notARealCommand$\n```');
  const [record] = await loadArticles(root);
  assert.equal(record.rendered.summaryText, '正文说明。');
  assert.match(record.rendered.searchText, /searchableCode/);
  assert.doesNotMatch(record.rendered.searchText, /katex|MathML/);
  assert.doesNotMatch(record.rendered.html, /katex-error/);
  assert.deepEqual(record.rendered.headings, [{ depth: 2, slug: '标题', text: '标题' }]);
});

test('日期按时区显示，历史日期和标签身份保持稳定', () => {
  assert.equal(calendarDate('2026-08-15'), '2026-08-15');
  assert.equal(calendarDate('2026-08-15T02:00:00Z', 'America/Denver'), '2026-08-14');
  assert.equal(calendarDate('2026-01-15T06:59:00Z', 'America/Denver'), '2026-01-14');
  assert.equal(new Set(['C', 'C++', 'C#', 'a b', 'a-b', '---'].map(tagSlug)).size, 6);
  assert.notEqual(treeAnchor(['a', 'b']), treeAnchor(['a--b']));
});

test('新增渲染器复用文章模型、摘要、目录、分类和资源输出', async (t) => {
  const root = await workspace(t);
  await article(root, 'articles/custom', { format: 'test-format' }, '原始自定义输入');
  const registry = new RendererRegistry().register({ format: 'test-format', async render(document) {
    assert.equal(document.source.trim(), '原始自定义输入');
    return { html: '<h2 id="custom">自定义表达</h2>', headings: [{ depth: 2, slug: 'custom', text: '自定义表达' }], summaryText: '自定义摘要', searchText: 'customExpressionSearch', diagnostics: [], assets: [{ kind: 'style', outputPath: '_content/custom.css', contents: 'h2{color:blue}', entrypoint: true }] };
  } });
  const records = await loadArticles(root, { registry });
  assert.equal(records[0].summary, '自定义摘要');
  assert.equal(records[0].rendered.headings[0].slug, 'custom');
  assert.equal(buildArticleTree(records)[0].count, 1);
  await writeAssets(records, path.join(root, 'output'));
  assert.equal(await readFile(path.join(root, 'output/_content/custom.css'), 'utf8'), 'h2{color:blue}');
  records[0].rendered.assets.push({ kind: 'style', outputPath: '_content/custom.css', contents: 'different' });
  await assert.rejects(assetManifest(records), /资源输出冲突/);
  records[0].rendered.assets = [{ kind: 'attachment', outputPath: 'blog/custom/index.html', contents: 'collision' }];
  await assert.rejects(assetManifest(records), /保留路径/);
});

test('Markdown 块处理器通过注册插件进入同一管线', async (t) => {
  const root = await workspace(t);
  await article(root, 'articles/block', {}, '原文');
  const extension = () => (tree: any) => { tree.children.push({ type: 'paragraph', children: [{ type: 'text', value: '新增表达块' }] }); };
  const registry = new RendererRegistry().register(createMarkdownRenderer({ remark: [extension] }));
  const [record] = await loadArticles(root, { registry });
  assert.match(record.rendered.html, /新增表达块/);
  assert.match(record.rendered.searchText, /新增表达块/);
});
