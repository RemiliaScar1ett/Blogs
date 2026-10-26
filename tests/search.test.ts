import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { workspace, article } from './helpers.ts';
import { RendererRegistry } from '../src/core/renderer.ts';
import { loadArticles } from '../src/core/repository.ts';
import { buildSearch } from '../src/core/search.ts';
import { inspectSearch } from '../scripts/search-index.ts';

test('搜索使用渲染器检索记录，不依赖页面 HTML；子路径结果不重复前缀', async (t) => {
  const root = await workspace(t), output = path.join(root, 'dist');
  await article(root, 'articles/custom', { format: 'custom', tags: ['C++'], title: '自定义表达工具' });
  await article(root, 'articles/secret', { hidden: true }, 'hiddenSearchToken');
  const registry = new RendererRegistry().register({ format: 'custom', async render() {
    return { html: '<p>仅供阅读</p>', headings: [], summaryText: '标准摘要', searchText: 'uniqueSearchToken', diagnostics: [], assets: [] };
  } });
  const records = await loadArticles(root, { registry, base: '/repo' });
  await buildSearch(records, output, '/repo');
  await inspectSearch(output, '/repo/', async (index) => {
    const result = await index.search('uniqueSearchToken');
    assert.equal(result.results.length, 1);
    const data = await result.results[0].data();
    assert.equal(data.url, '/repo/blog/custom/');
    assert.equal(data.meta.title, '自定义表达工具');
    assert.equal(data.meta.summary, '标准摘要');
    assert.equal((await index.search('hiddenSearchToken')).results.length, 0);
  });
});
