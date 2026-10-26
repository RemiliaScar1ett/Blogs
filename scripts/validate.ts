import { loadArticles } from '../src/core/repository.ts';
import { assetManifest } from '../src/core/assets.ts';
try {
  const articles = await loadArticles(process.cwd(), { base: process.env.BASE_PATH || '/' });
  await assetManifest(articles);
  console.log(`内容校验通过：${articles.length} 篇公开文章`);
} catch (error: any) { console.error(error.message); process.exitCode = 1; }
