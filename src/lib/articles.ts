import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadArticles } from '../core/repository.ts';
import { tagKey } from '../core/urls.ts';
import type { ArticleRecord } from '../core/types.ts';
import { tagSlug, withBase } from './paths';
export type ArticleEntry = ArticleRecord;
let production: Promise<ArticleRecord[]> | undefined;
export async function getArticles(): Promise<ArticleRecord[]> {
  if (import.meta.env.DEV) return loadArticles(process.cwd(), { base: import.meta.env.BASE_URL });
  return production ??= readFile(path.join(process.cwd(), '.cache/content-manifest.json'), 'utf8').then(JSON.parse);
}
export const articleUrl = (a: ArticleRecord) => withBase(`/blog/${a.id}/`);
export const tagUrl = (tag: string) => withBase(`/tags/${tagSlug(tag)}/`);
export const formatDate = (date: string) => date.replaceAll('-', '/');
export const plainSummary = (a: ArticleRecord) => a.summary;
export const dateLabel = (a: ArticleRecord) => a.data.dateKind === 'collected' ? '收录' : '发布';
export interface TagGroup { name: string; slug: string; articles: ArticleRecord[] }
export function groupByTag(articles: ArticleRecord[]): TagGroup[] {
  const map = new Map<string, TagGroup>();
  for (const article of articles) for (const tag of article.data.tags) {
    const key = tagKey(tag), slug = tagSlug(tag);
    const group = map.get(key) ?? { name: tag, slug, articles: [] };
    if (!group.articles.some((a) => a.id === article.id)) group.articles.push(article);
    map.set(key, group);
  }
  return [...map.values()].sort((a, b) => b.articles.length - a.articles.length || a.name.localeCompare(b.name, 'zh-CN'));
}
export function relatedArticles(current: ArticleRecord, all: ArticleRecord[], limit = 3) {
  const tags = new Set(current.data.tags.filter((t) => t !== '旧文迁移').map(tagKey));
  return all.filter((a) => a.id !== current.id)
    .map((item) => ({ item, score: item.data.tags.reduce((sum, t) => sum + Number(tags.has(tagKey(t))), 0) }))
    .filter((a) => a.score > 0)
    .sort((a, b) => b.score - a.score || b.item.data.date.localeCompare(a.item.data.date) || a.item.id.localeCompare(b.item.id))
    .slice(0, limit).map((a) => a.item);
}
