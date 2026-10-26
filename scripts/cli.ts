import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { stringify } from 'yaml';
import { readArticles } from '../src/core/storage.ts';
import { metadataSchema } from '../src/core/metadata.ts';
import { publishArticle } from '../src/publishing/publish.ts';

const [command, slug, ...args] = process.argv.slice(2), root = process.cwd();
try {
  if (!slug || !/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) throw new Error('用法：npm run new -- <slug> "标题"；npm run preview:draft -- <slug>；npm run publish -- <slug> [--dry-run|--retry-push]');
  if (command === 'new') {
    const metadata = metadataSchema.parse({ title: args.join(' ') || slug, slug, uid: randomUUID(), tree: ['未分类'], tags: [] });
    if ([...await readArticles(root), ...await readArticles(root, 'drafts')].some((a) => a.metadata.slug === slug)) throw new Error(`slug 已存在: ${slug}`);
    await mkdir(path.join(root, 'drafts'), { recursive: true });
    const directory = path.join(root, 'drafts', slug); await mkdir(directory, { recursive: false });
    const { hidden, format, dateKind, ...fields } = metadata;
    await writeFile(path.join(directory, 'blog.md'), `---\n${stringify(fields)}---\n\n`);
    console.log(`已创建 drafts/${slug}/blog.md\n预览：npm run preview:draft -- ${slug}`);
  } else if (command === 'preview') {
    if (args.length) throw new Error('预览命令只接受文章 slug');
    const drafts = (await readArticles(root, 'drafts')).filter((a) => a.metadata.slug === slug);
    if (drafts.length !== 1) throw new Error(`未找到唯一草稿: ${slug}`);
    process.env.DRAFT_PREVIEW_SLUG = slug;
    const { dev } = await import('astro');
    const server = await dev({ root, server: { host: '127.0.0.1', port: 4321 }, vite: { server: { strictPort: true } } });
    console.log(`草稿预览：http://127.0.0.1:${server.address.port}${(process.env.BASE_PATH || '').replace(/\/$/, '')}/draft-preview/${slug}/`);
    const stop = async () => { await server.stop(); process.exit(0); };
    process.once('SIGINT', stop); process.once('SIGTERM', stop);
  } else if (command === 'publish') {
    if (args.some((a) => !['--dry-run', '--retry-push', '--prepare-only'].includes(a)) || args.length > 1) throw new Error('发布只接受一个可选参数：--dry-run、--retry-push、--prepare-only');
    const result = await publishArticle(root, slug, { dryRun: args.includes('--dry-run'), retryPush: args.includes('--retry-push'), prepareOnly: args.includes('--prepare-only') });
    console.log(({ pushed: '已推送并触发部署', prepared: '文章已准备，尚未提交推送', validated: '候选构建与校验通过', unchanged: '文章没有变化' } as Record<string, string>)[result.status]);
    console.log(JSON.stringify(result, null, 2));
  } else throw new Error(`未知命令: ${command}`);
} catch (error: any) { console.error(error.message); process.exitCode = 1; }
