import { getCollection, type CollectionEntry } from 'astro:content';
import { tagSlug, withBase } from './paths';

export type ArticleEntry = CollectionEntry<'articles'>;

export async function getArticles() {
  return (await getCollection('articles', ({ data }) => !data.hidden)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
}

export function articleUrl(article: ArticleEntry) {
  return withBase(`/blog/${article.id}/`);
}

export function tagUrl(tag: string) {
  return withBase(`/tags/${tagSlug(tag)}/`);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function plainSummary(article: ArticleEntry, max = 170) {
  if (article.data.summary?.trim()) return article.data.summary.trim();

  const body = article.body ?? '';
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/~~~[\s\S]*?~~~/g, ' ')
    .replace(/\$\$[\s\S]*?\$\$/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_~`]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}……`;
}

export interface TagGroup {
  name: string;
  slug: string;
  articles: ArticleEntry[];
}

export function groupByTag(articles: ArticleEntry[]): TagGroup[] {
  const map = new Map<string, TagGroup>();
  for (const article of articles) {
    for (const tag of article.data.tags) {
      const slug = tagSlug(tag);
      const group = map.get(slug) ?? { name: tag, slug, articles: [] };
      group.articles.push(article);
      map.set(slug, group);
    }
  }
  return [...map.values()].sort(
    (a, b) => b.articles.length - a.articles.length || a.name.localeCompare(b.name, 'zh-CN'),
  );
}

export function relatedArticles(current: ArticleEntry, all: ArticleEntry[], limit = 3) {
  const tags = new Set(current.data.tags);
  return all
    .filter((item) => item.id !== current.id)
    .map((item) => ({
      item,
      score: item.data.tags.reduce((sum, tag) => sum + (tags.has(tag) ? 1 : 0), 0),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.item.data.date.valueOf() - a.item.data.date.valueOf())
    .slice(0, limit)
    .map(({ item }) => item);
}
