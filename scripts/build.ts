import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { loadArticles } from '../src/core/repository.ts';
import { writeAssets, assetManifest } from '../src/core/assets.ts';
import { buildSearch } from '../src/core/search.ts';
import { checkSite } from '../src/core/site-check.ts';
import { run, astroBin } from './process.ts';

const root = process.cwd(), base = process.env.BASE_PATH || '/';
try {
  const articles = await loadArticles(root, { base });
  await assetManifest(articles);
  await mkdir(path.join(root, '.cache'), { recursive: true });
  await writeFile(path.join(root, '.cache/content-manifest.json'), JSON.stringify(articles));
  await run(process.execPath, [astroBin, 'check'], root);
  await run(process.execPath, [astroBin, 'build'], root);
  const output = path.join(root, 'dist');
  const assets = await writeAssets(articles, output);
  await buildSearch(articles, output, base);
  const result = await checkSite(output, base);
  console.log(`构建验收通过：${articles.length} 篇文章，${result.pages} 个页面，${assets.length} 个资源。`);
} catch (error: any) { console.error(error.message); process.exitCode = 1; }
