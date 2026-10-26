import { unified } from 'unified';
import type { PluggableList } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeStringify from 'rehype-stringify';
import { rehypeShiki } from '@astrojs/markdown-remark';
import GithubSlugger from 'github-slugger';
import { readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Renderer, RenderAsset, Diagnostic } from '../core/types.ts';

const require = createRequire(import.meta.url);
let mathAssets: Promise<RenderAsset[]> | undefined;
function katexAssets() {
  return mathAssets ??= (async () => {
    const directory = path.dirname(require.resolve('katex/package.json'));
    const fonts = path.join(directory, 'dist', 'fonts');
    return [
      { kind: 'style' as const, sourcePath: path.join(directory, 'dist', 'katex.min.css'), outputPath: '_content/katex/katex.min.css', entrypoint: true },
      ...(await readdir(fonts)).map((name) => ({ kind: 'attachment' as const, sourcePath: path.join(fonts, name), outputPath: `_content/katex/fonts/${name}` })),
    ];
  })();
}

function textOf(node: any, summary = false): string {
  if (['math', 'inlineMath', 'html', 'image', 'imageReference', 'definition', ...(summary ? ['code', 'heading'] : [])].includes(node.type)) return '';
  if (typeof node.value === 'string') return node.value;
  const children = node.children ?? [];
  return children.map((child: any) => textOf(child, summary)).join(['paragraph', 'heading', 'link', 'emphasis', 'strong', 'delete'].includes(node.type) ? '' : ' ');
}
const clean = (value: string) => value.replace(/\s+/g, ' ').trim();
function walk(node: any, visit: (node: any) => void) { visit(node); for (const child of node.children ?? []) walk(child, visit); }

export function createMarkdownRenderer(extensions: { remark?: PluggableList; rehype?: PluggableList } = {}): Renderer {
return {
  format: 'markdown',
  async render(document, context) {
    let summaryText = '', searchText = '', hasMath = false;
    const headings: { depth: number; slug: string; text: string }[] = [];
    const diagnostics: Diagnostic[] = [];
    const slugger = new GithubSlugger();
    const processor = unified().use(remarkParse).use(remarkGfm).use(remarkMath)
      .use(extensions.remark ?? [])
      .use(() => (tree: any) => {
        summaryText = clean(textOf(tree, true));
        searchText = clean(textOf(tree));
        walk(tree, (node) => { if (node.type === 'math' || node.type === 'inlineMath') hasMath = true; });
      })
      .use(remarkRehype, { allowDangerousHtml: true }).use(rehypeRaw)
      .use(rehypeKatex, { strict: false })
      .use(rehypeShiki, { theme: 'github-dark' })
      .use(extensions.rehype ?? [])
      .use(() => async (tree: any) => {
        const tasks: Promise<void>[] = [];
        const resolve = (node: any, property: string, kind: RenderAsset['kind']) => {
          tasks.push(context.resolveAsset(String(node.properties[property]), kind).then((url) => { node.properties[property] = url; }).catch((error) => {
            diagnostics.push({ level: 'error', code: 'asset', message: error.message, file: document.sourcePath, line: (node.position?.start.line ?? 1) + document.lineOffset, column: node.position?.start.column });
          }));
        };
        walk(tree, (node) => {
          if (node.type !== 'element') return;
          if (/^h[1-6]$/.test(node.tagName)) {
            if (node.tagName === 'h1') node.tagName = 'h2';
            const text = clean(textOf(node));
            const id = slugger.slug(text);
            node.properties.id = id;
            headings.push({ depth: Number(node.tagName[1]), slug: id, text });
          }
          if (node.tagName === 'img' && node.properties.src) {
            resolve(node, 'src', 'image');
            node.properties.loading = 'lazy'; node.properties.decoding = 'async';
          }
          if (node.tagName === 'a' && node.properties.href) resolve(node, 'href', 'attachment');
        });
        await Promise.all(tasks);
      }).use(rehypeStringify);
    const file = await processor.process({ value: document.source, path: document.sourcePath });
    return {
      html: String(file), headings, summaryText, searchText,
      assets: hasMath ? await katexAssets() : [],
      diagnostics: [...diagnostics, ...file.messages.map((message: any) => ({
        level: message.source === 'rehype-katex' || message.fatal ? 'error' as const : 'warning' as const,
        code: message.ruleId || 'render', message: message.reason, file: document.sourcePath,
        line: (message.line ?? 1) + document.lineOffset, column: message.column,
      }))],
    };
  },
};
}
export const markdownRenderer = createMarkdownRenderer();
