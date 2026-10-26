import { createHash } from 'node:crypto';
import { readArticles } from './storage.ts';
import { displayDate, calendarDate } from './metadata.ts';
import { RendererRegistry } from './renderer.ts';
import { markdownRenderer } from '../renderers/markdown.ts';
import { tagKey, tagSlug, withBasePath } from './urls.ts';
import type { ArticleRecord, ArticleSource } from './types.ts';

export const renderers = new RendererRegistry().register(markdownRenderer);
export function summarize(text: string, length = 170) {
  const chars = Array.from(text.trim());
  return chars.length > length ? `${chars.slice(0, length).join('').trimEnd()}……` : text.trim();
}

export function validateIdentities(sources: ArticleSource[]) {
  for (const field of ['slug', 'uid'] as const) {
    const found = new Map<string, string>();
    for (const source of sources) {
      const id = source.metadata[field]; if (!id) continue;
      if (found.has(id)) throw new Error(`重复 ${field} "${id}":\n${found.get(id)}\n${source.document.sourcePath}`);
      found.set(id, source.document.sourcePath);
    }
  }
  const tags = new Map<string, string>();
  for (const source of sources) for (const tag of source.metadata.tags) {
    const slug = tagSlug(tag), key = tagKey(tag);
    if (tags.has(slug) && tags.get(slug) !== key) throw new Error(`标签 URL 冲突: ${tag}`);
    tags.set(slug, key);
  }
}

export async function compileArticle(source: ArticleSource, options: { base?: string; draft?: boolean; registry?: RendererRegistry } = {}): Promise<ArticleRecord> {
  if (!source.document.source.trim() && !options.draft) throw new Error(`${source.document.sourcePath}: 公开文章正文为空`);
  const date = displayDate(source.metadata) ?? (options.draft ? calendarDate(new Date().toISOString()) : undefined);
  if (!date) throw new Error(`${source.document.sourcePath}: 缺少发布日期，请通过发布命令填写`);
  const base = options.base ?? '/';
  const result = await (options.registry ?? renderers).render(source.document, { slug: source.metadata.slug, base });
  return {
    id: source.metadata.slug,
    uid: source.metadata.uid ?? `legacy-${createHash('sha256').update(source.metadata.slug).digest('hex').slice(0, 24)}`,
    data: { ...source.metadata, date, updated: source.metadata.updatedAt ? calendarDate(source.metadata.updatedAt) : source.metadata.updated, tags: [...new Map(source.metadata.tags.map((tag) => [tagKey(tag), tag])).values()] },
    document: source.document, rendered: result,
    summary: source.metadata.summary?.trim() || summarize(result.summaryText) || source.metadata.title,
    url: withBasePath(base, `/blog/${source.metadata.slug}/`),
  };
}

export async function loadArticles(root: string, options: { base?: string; registry?: RendererRegistry } = {}) {
  const sources = await readArticles(root);
  validateIdentities(sources);
  const records: ArticleRecord[] = [];
  // Hidden content is excluded before rendering and resource resolution.
  for (const source of sources) if (!source.metadata.hidden) records.push(await compileArticle(source, options));
  return records.sort((a, b) => b.data.date.localeCompare(a.data.date) || a.id.localeCompare(b.id));
}

export async function loadDraft(root: string, slug: string, base = '/') {
  const sources = await readArticles(root, 'drafts');
  const matches = sources.filter((s) => s.metadata.slug === slug);
  if (matches.length !== 1) throw new Error(`需要唯一草稿 ${slug}，找到 ${matches.length} 篇`);
  const record = await compileArticle(matches[0], { base, draft: true });
  record.url = withBasePath(base, `/draft-preview/${slug}/`);
  return record;
}

export function articleJSON(record: ArticleRecord) {
  return { title: record.data.title, slug: record.id, uid: record.uid, tree: record.data.tree, tags: record.data.tags, date: record.data.date, updated: record.data.updated ?? null, publishedAt: record.data.publishedAt ?? null, updatedAt: record.data.updatedAt ?? null, dateKind: record.data.dateKind, summary: record.summary, url: record.url };
}
