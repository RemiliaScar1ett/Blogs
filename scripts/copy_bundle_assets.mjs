import { loadArticles } from '../src/core/repository.ts';
import { writeAssets } from '../src/core/assets.ts';
const articles = await loadArticles(process.cwd(), { base: process.env.BASE_PATH || '/' });
await writeAssets(articles, 'dist', true);
