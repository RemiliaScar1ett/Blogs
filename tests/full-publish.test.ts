import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, readFile, writeFile, symlink } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { workspace, article } from './helpers.ts';
import { git } from '../src/publishing/git.ts';
import { readArticles } from '../src/core/storage.ts';
import { splitFrontmatter } from '../src/core/metadata.ts';
import { run } from '../scripts/process.ts';
import { inspectSearch } from '../scripts/search-index.ts';
import { withBasePath } from '../src/core/urls.ts';

test('真实文章通过生产构建完成首次发布和更新（本地 Git 远端）', { timeout: 180000 }, async (t) => {
  const parent = await workspace(t), root = path.join(parent, 'site'), remote = path.join(parent, 'remote.git');
  await mkdir(root); await mkdir(remote);
  for (const name of ['src', 'scripts', 'public', 'templates', 'astro.config.mjs', 'tsconfig.json', 'package.json', 'package-lock.json']) {
    await cp(path.resolve(name), path.join(root, name), { recursive: true });
  }
  await symlink(path.resolve('node_modules'), path.join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  const registryFile = path.join(root, 'src/core/repository.ts');
  await writeFile(registryFile, (await readFile(registryFile, 'utf8')).replace('.register(markdownRenderer);', `.register(markdownRenderer).register({ format: 'test-expression', async render() {
    return { html: '<h2 id="custom-format">自定义正文</h2>', headings: [{ depth: 2, slug: 'custom-format', text: '自定义正文' }], summaryText: '独立格式摘要', searchText: 'CustomFormatUniqueToken', diagnostics: [], assets: [{ kind: 'style', outputPath: '_content/custom-format.css', contents: 'h2{color:blue}', entrypoint: true }] };
  } });`));
  const { publishArticle } = await import(pathToFileURL(path.join(root, 'src/publishing/publish.ts')).href);
  await writeFile(path.join(root, '.gitignore'), 'node_modules/\ndrafts/\n.cache/\n.astro/\ndist/\n');
  await git(remote, ['init', '--bare', '--initial-branch=main']);
  await git(root, ['init', '--initial-branch=main']);
  await git(root, ['config', 'user.name', 'Production Test']);
  await git(root, ['config', 'user.email', 'production@example.invalid']);
  await git(root, ['config', 'commit.gpgsign', 'false']);
  await git(root, ['add', '.']); await git(root, ['commit', '-m', 'site']);
  await git(root, ['remote', 'add', 'origin', remote]); await git(root, ['push', '-u', 'origin', 'main']);
  const source = (await readArticles(process.cwd())).find((a) => a.metadata.title === '莫比乌斯函数')!;
  const slug = source.metadata.slug;
  await cp(source.document.bundleRoot, path.join(root, 'drafts/sample'), { recursive: true });
  const first = await publishArticle(root, slug, { now: () => new Date('2026-10-26T16:00:00Z') });
  assert.equal(first.status, 'pushed');
  const file = path.join(root, 'articles/sample/blog.md');
  const initial = splitFrontmatter(await readFile(file, 'utf8')).metadata;
  await writeFile(file, (await readFile(file, 'utf8')) + '\n\n发布流程验收附注。\n');
  const update = await publishArticle(root, slug, { now: () => new Date('2026-10-27T16:00:00Z') });
  assert.equal(update.status, 'pushed');
  const final = splitFrontmatter(await readFile(file, 'utf8')).metadata;
  assert.equal(final.publishedAt, initial.publishedAt);
  assert.equal(final.updatedAt, '2026-10-27T16:00:00.000Z');
  assert.equal(await git(remote, ['rev-parse', 'main']), await git(root, ['rev-parse', 'HEAD']));
  await article(root, 'drafts/custom', { slug: 'custom-expression', format: 'test-expression', tree: ['表达工具'], tags: ['表达式'], date: undefined }, '自定义格式源内容');
  await publishArticle(root, 'custom-expression', { build: async (candidate: string) => {
    await run(process.execPath, [path.join(candidate, 'scripts/build.ts')], candidate);
    const output = path.join(candidate, 'dist'), base = process.env.BASE_PATH || '/';
    const html = await readFile(path.join(output, 'blog/custom-expression/index.html'), 'utf8');
    assert.match(html, /自定义正文/); assert.match(html, /独立格式摘要/);
    assert.match(html, /custom-format\.css/); assert.match(html, /href="#custom-format"/);
    assert.match(await readFile(path.join(output, 'catalog/index.html'), 'utf8'), /表达工具/);
    assert.equal(await readFile(path.join(output, '_content/custom-format.css'), 'utf8'), 'h2{color:blue}');
    await inspectSearch(output, withBasePath(base, '/'), async (index) => {
      const results = await index.search('CustomFormatUniqueToken');
      const found = await Promise.all(results.results.map((r: any) => r.data()));
      assert.ok(found.some((r: any) => r.url === withBasePath(base, '/blog/custom-expression/')));
    });
  } });
});
