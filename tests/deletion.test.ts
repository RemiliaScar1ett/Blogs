import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, readFile, writeFile, symlink, stat } from 'node:fs/promises';
import path from 'node:path';
import { workspace, article } from './helpers.ts';
import { git } from '../src/publishing/git.ts';
import { removeWithin } from '../src/publishing/publish.ts';
import { loadArticles } from '../src/core/repository.ts';
import { assetManifest } from '../src/core/assets.ts';
import { withBasePath } from '../src/core/urls.ts';
import { run } from '../scripts/process.ts';
import { inspectSearch } from '../scripts/search-index.ts';

test('删除文章包后重新构建，清除页面、专属资源、分类和搜索记录', { timeout: 180000 }, async (t) => {
  const parent = await workspace(t), root = path.join(parent, 'site'), remote = path.join(parent, 'remote.git');
  await mkdir(root); await mkdir(remote);
  for (const name of ['src', 'scripts', 'public', 'templates', 'astro.config.mjs', 'tsconfig.json', 'package.json', 'package-lock.json']) {
    await cp(path.resolve(name), path.join(root, name), { recursive: true });
  }
  await symlink(path.resolve('node_modules'), path.join(root, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  await writeFile(path.join(root, '.gitignore'), 'node_modules\n.cache/\n.astro/\ndist/\n');
  await article(root, 'articles/keep', { tags: ['shared'], tree: ['保留分类'] }, 'SurvivingArticleToken $x^2$。');
  await article(root, 'articles/remove', { tags: ['shared', 'removed-tag'], tree: ['待删除分类'] },
    'DeletedArticleToken $y^2$。\n\n![图片](./image.svg)\n\n[附件](./data.csv)');
  await writeFile(path.join(root, 'articles/remove/image.svg'), '<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="5" cy="5" r="4"/></svg>');
  await writeFile(path.join(root, 'articles/remove/data.csv'), 'value\n1\n');
  await article(root, 'articles/empty', { hidden: true, tags: ['hidden-tag'] }, '');
  await git(remote, ['init', '--bare', '--initial-branch=main']);
  await git(root, ['init', '--initial-branch=main']);
  await git(root, ['config', 'user.name', 'Deletion Test']);
  await git(root, ['config', 'user.email', 'deletion@example.invalid']);
  await git(root, ['config', 'commit.gpgsign', 'false']);
  await git(root, ['add', '.']);
  assert.equal((await git(root, ['ls-files', '--', 'node_modules'])).trim(), '');
  await git(root, ['commit', '-m', 'before deletion']);
  await git(root, ['remote', 'add', 'origin', remote]);
  await git(root, ['push', '-u', 'origin', 'main']);
  const output = path.join(root, 'dist');
  const build = (base: string) => run(process.execPath, [path.join(root, 'scripts/build.ts')], root, { ...process.env, BASE_PATH: base });
  const absent = (file: string) => assert.rejects(stat(path.join(output, file)), { code: 'ENOENT' });
  const sharedAssets = (await assetManifest((await loadArticles(root)).filter((a) => a.id === 'keep'))).map(({ asset }) => asset.outputPath);
  assert.ok(sharedAssets.length > 0);
  await build('/delete-test');
  for (const file of ['blog/remove/index.html', 'blog/remove/image.svg', 'blog/remove/data.csv', 'tags/removed-tag/index.html']) {
    assert.ok((await stat(path.join(output, file))).isFile());
  }
  await absent('blog/empty');
  await inspectSearch(output, '/delete-test/', async (index) => {
    const result = await index.search('DeletedArticleToken');
    assert.equal(result.results.length, 1);
    assert.equal((await result.results[0].data()).url, '/delete-test/blog/remove/');
    assert.equal((await index.filters()).tag.shared, 2);
  });

  await writeFile(path.join(root, 'unrelated.txt'), 'Keep this local file outside the deletion commit.');
  for (const folder of ['remove', 'empty']) await removeWithin(path.join(root, 'articles'), path.join(root, 'articles', folder));
  // Reuse the existing output directory: stale pages, assets and index chunks must disappear.
  for (const base of ['/', '/delete-test']) {
    await build(base);
    for (const file of ['blog/remove', 'blog/empty', 'tags/removed-tag', 'tags/hidden-tag']) await absent(file);
    const records = JSON.parse(await readFile(path.join(output, 'articles.json'), 'utf8'));
    assert.deepEqual(records.map((a: any) => a.slug), ['keep']);
    for (const file of ['index.html', 'catalog/index.html', 'tags/index.html', 'tags/shared/index.html', 'archive/index.html']) {
      const html = await readFile(path.join(output, file), 'utf8');
      assert.doesNotMatch(html, /blog\/remove\/|待删除分类|removed-tag|hidden-tag/);
    }
    assert.match(await readFile(path.join(output, 'catalog/index.html'), 'utf8'), /1 篇文章/);
    assert.match(await readFile(path.join(output, 'tags/shared/index.html'), 'utf8'), /1 篇相关文章/);
    for (const asset of sharedAssets) assert.ok((await stat(path.join(output, asset))).isFile());
    await inspectSearch(output, withBasePath(base, '/'), async (index) => {
      assert.equal((await index.search('DeletedArticleToken')).results.length, 0);
      const result = await index.search('SurvivingArticleToken');
      assert.equal(result.results.length, 1);
      assert.equal((await result.results[0].data()).url, withBasePath(base, '/blog/keep/'));
      const filters = await index.filters();
      assert.deepEqual(filters.tag, { shared: 1 });
      assert.deepEqual(filters.tree, { 保留分类: 1 });
    });
  }
  await git(root, ['add', '-u', '--', 'articles/remove', 'articles/empty']);
  await git(root, ['commit', '-m', 'delete incomplete articles']);
  assert.deepEqual((await git(root, ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'])).trim().split('\n').sort(),
    ['articles/empty/blog.md', 'articles/remove/blog.md', 'articles/remove/data.csv', 'articles/remove/image.svg']);
  await git(root, ['push', 'origin', 'main']);
  assert.equal(await git(remote, ['rev-parse', 'main']), await git(root, ['rev-parse', 'HEAD']));
  assert.equal((await git(root, ['status', '--porcelain'])).trim(), '?? unrelated.txt');
});
