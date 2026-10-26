import { realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { isWithin } from './storage.ts';
import { withBasePath } from './urls.ts';
import type { ArticleDocument, Renderer, RenderAsset, RenderResult } from './types.ts';

export class RendererRegistry {
  private renderers = new Map<string, Renderer>();
  register(renderer: Renderer) {
    if (this.renderers.has(renderer.format)) throw new Error(`重复的渲染器: ${renderer.format}`);
    this.renderers.set(renderer.format, renderer);
    return this;
  }
  async render(document: ArticleDocument, options: { slug: string; base: string }): Promise<RenderResult> {
    const renderer = this.renderers.get(document.format);
    if (!renderer) throw new Error(`${document.sourcePath}: 不支持的正文格式 ${document.format}`);
    const assets: RenderAsset[] = [];
    const resolveAsset = async (reference: string, kind: RenderAsset['kind']) => {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(reference)) return reference;
      if (reference.startsWith('/')) return withBasePath(options.base, reference);
      const boundary = reference.search(/[?#]/);
      const pathname = boundary < 0 ? reference : reference.slice(0, boundary);
      const suffix = boundary < 0 ? '' : reference.slice(boundary);
      const decoded = decodeURIComponent(pathname);
      const candidate = path.resolve(document.bundleRoot, decoded);
      if (!isWithin(document.bundleRoot, candidate)) throw new Error(`资源越出文章包: ${reference}`);
      let sourcePath: string;
      try { sourcePath = await realpath(candidate); } catch { throw new Error(`缺少本地资源: ${reference}`); }
      if (!isWithin(document.bundleRoot, sourcePath) || !(await stat(sourcePath)).isFile()) throw new Error(`无效资源: ${reference}`);
      const relative = path.relative(document.bundleRoot, candidate).split(path.sep).join('/');
      if (relative === 'index.html' || /(^|\/)(?:blog\.md|\.[^/]+)(?:\/|$)/i.test(relative)) throw new Error(`资源与页面或源文件冲突: ${reference}`);
      const outputPath = `blog/${options.slug}/${relative}`;
      assets.push({ kind, sourcePath, outputPath });
      return withBasePath(options.base, outputPath.split('/').map(encodeURIComponent).join('/')) + suffix;
    };
    try {
      const result = await renderer.render(document, { ...options, resolveAsset });
      result.assets = [...assets, ...result.assets];
      const errors = result.diagnostics.filter((d) => d.level === 'error');
      if (errors.length) throw new Error(errors.map((d) => `${d.file}:${d.line ?? 1}:${d.column ?? 1}: ${d.message}`).join('\n'));
      return result;
    } catch (e: any) { throw new Error(`${document.sourcePath}: ${e.message}`, { cause: e }); }
  }
}
