import type { APIRoute } from 'astro';
import { getArticles } from '../lib/articles';
import { articleJSON } from '../core/repository.ts';
export const GET: APIRoute = async () => new Response(JSON.stringify((await getArticles()).map((article) => ({
  ...articleJSON(article), ...(import.meta.env.DEV ? { searchText: article.rendered.searchText } : {}),
}))), {
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
});
