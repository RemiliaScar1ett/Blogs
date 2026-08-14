import type { APIRoute } from 'astro';
import { articleUrl, getArticles, plainSummary } from '../lib/articles';

export const GET: APIRoute = async () => {
  const articles = await getArticles();
  const payload = articles.map((article) => ({
    title: article.data.title,
    slug: article.id,
    tree: article.data.tree,
    tags: article.data.tags,
    date: article.data.date.toISOString().slice(0, 10),
    updated: article.data.updated?.toISOString().slice(0, 10) ?? null,
    summary: plainSummary(article),
    url: articleUrl(article),
  }));

  return new Response(JSON.stringify(payload, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
