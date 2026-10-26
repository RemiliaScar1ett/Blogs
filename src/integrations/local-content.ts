import type { AstroIntegration } from 'astro';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadArticles, loadDraft } from '../core/repository.ts';
import type { ArticleRecord, RenderAsset } from '../core/types.ts';
import { withBasePath } from '../core/urls.ts';

export default function localContent(): AstroIntegration {
  return {
    name: 'local-article-content',
    hooks: {
      'astro:config:setup': ({ command, config, updateConfig }) => {
        if (command !== 'dev') return;
        const root = fileURLToPath(config.root);
        let manifest: Promise<Map<string, RenderAsset>> | undefined;
        const resolve = () => manifest ??= (async () => {
          const articles: ArticleRecord[] = await loadArticles(root, { base: config.base });
          if (process.env.DRAFT_PREVIEW_SLUG) articles.push(await loadDraft(root, process.env.DRAFT_PREVIEW_SLUG, config.base));
          return new Map(articles.flatMap((a) => a.rendered.assets.map((asset) => [withBasePath(config.base, asset.outputPath), asset] as const)));
        })();
        updateConfig({ vite: { plugins: [{
          name: 'article-resource-server',
          configureServer(server) {
            server.watcher.add([path.join(root, 'articles'), path.join(root, 'drafts')]);
            server.watcher.on('all', (_event, file) => {
              if ([path.join(root, 'articles') + path.sep, path.join(root, 'drafts') + path.sep].some((prefix) => path.resolve(file).startsWith(prefix))) {
                manifest = undefined; server.ws.send({ type: 'full-reload' });
              }
            });
            server.middlewares.use(async (req, res, next) => {
              let pathname: string;
              try { pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname); } catch { next(); return; }
              if (!pathname.startsWith(withBasePath(config.base, 'blog/')) && !pathname.startsWith(withBasePath(config.base, '_content/'))) { next(); return; }
              try {
                const asset = (await resolve()).get(pathname);
                if (!asset) { next(); return; }
                const types: Record<string, string> = { '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.woff': 'font/woff', '.pdf': 'application/pdf' };
                res.setHeader('Content-Type', types[path.extname(asset.outputPath)] || 'application/octet-stream');
                res.end(asset.contents !== undefined ? asset.contents : await readFile(asset.sourcePath!));
              } catch (error) { manifest = undefined; next(error); }
            });
          },
        }] } });
      },
    },
  };
}
