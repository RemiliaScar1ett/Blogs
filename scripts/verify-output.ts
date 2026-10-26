import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { inspectSearch } from './search-index.ts';
import { readArticles } from '../src/core/storage.ts';
import { withBasePath } from '../src/core/urls.ts';

const root = process.cwd(), directory = path.join(root, 'dist'), base = process.env.BASE_PATH || '/';
const records = JSON.parse(await readFile(path.join(directory, 'articles.json'), 'utf8'));
const sources = await readArticles(root), visible = sources.filter((s) => !s.metadata.hidden);
assert.equal(records.length, visible.length);
assert.equal(new Set(records.map((a: any) => a.uid)).size, records.length);
for (const source of sources.filter((s) => s.metadata.hidden)) {
  await assert.rejects(access(path.join(directory, 'blog', source.metadata.slug)));
  assert.ok(!records.some((r: any) => r.slug === source.metadata.slug));
}
await assert.rejects(access(path.join(directory, 'draft-preview')));
await inspectSearch(directory, withBasePath(base, '/'), async (index) => {
  for (const [query, title] of [['莫比乌斯函数', '莫比乌斯函数'], ['P2572', 'P2572'], ['dfn', 'Tarjan']]) {
    const expected = records.find((r: any) => r.title.includes(title));
    assert.ok(expected, `缺少固定查询样例 ${title}`);
    const results = await index.search(query);
    const found = await Promise.all(results.results.map((r: any) => r.data()));
    assert.ok(found.some((r: any) => r.url === expected.url), `${query}: 未找到预期文章 ${expected.url}; ${found.map((r: any) => r.url).join(', ')}`);
    for (const item of found) assert.ok(records.some((r: any) => r.url === item.url), `搜索结果指向非公开文章: ${item.url}`);
    console.log(`搜索通过：${query} → ${expected.title}`);
  }
  assert.equal((await index.search('"zzzxqv987654321"')).results.length, 0);
});
console.log(`产物验收通过：${records.length} 篇公开文章，base=${base}`);
