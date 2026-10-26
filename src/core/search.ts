import * as pagefind from 'pagefind';
import path from 'node:path';
import type { ArticleRecord } from './types.ts';
import { withBasePath } from './urls.ts';

export async function buildSearch(records: ArticleRecord[], outputDirectory: string, base = '/') {
  const response = await pagefind.createIndex({});
  if (!response.index || response.errors.length) throw new Error(response.errors.join('\n'));
  const index = response.index;
  try {
    for (const article of records) {
      const prefix = withBasePath(base, '/');
      if (!article.url.startsWith(prefix)) throw new Error(`检索记录不属于站点路径: ${article.url}`);
      const result = await index.addCustomRecord({
        // Pagefind adds the deployed bundle's base URL when returning a result.
        url: article.url.slice(prefix.length - 1), language: 'zh-cn',
        content: [article.data.title, article.data.tree.join(' '), article.data.tags.join(' '), article.rendered.searchText].join('\n'),
        meta: { title: article.data.title, summary: article.summary, tree: article.data.tree.join(' / '), tags: article.data.tags.join(' · ') },
        filters: { tag: article.data.tags, tree: [article.data.tree.join(' / ')] },
      });
      if (result.errors.length) throw new Error(result.errors.join('\n'));
    }
    const result = await index.writeFiles({ outputPath: path.join(outputDirectory, 'pagefind') });
    if (result.errors.length) throw new Error(result.errors.join('\n'));
  } finally { await index.deleteIndex(); }
}
