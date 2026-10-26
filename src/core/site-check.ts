import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'parse5';
import { withBasePath } from './urls.ts';
import { isWithin } from './storage.ts';

async function htmlFiles(directory: string): Promise<string[]> {
  const result: string[] = [];
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const full = path.join(directory, item.name);
    if (item.isDirectory()) result.push(...await htmlFiles(full));
    else if (item.name.endsWith('.html')) result.push(full);
  }
  return result;
}
export async function checkSite(directory: string, base = '/') {
  const pages = new Map<string, { ids: Set<string>; links: { tag: string; url: string }[] }>();
  const errors: string[] = [];
  for (const file of await htmlFiles(directory)) {
    const ids = new Set<string>(), links: { tag: string; url: string }[] = [];
    const walk = (node: any) => {
      const attrs = Object.fromEntries((node.attrs ?? []).map((a: any) => [a.name, a.value]));
      if (attrs.id) { if (ids.has(attrs.id)) errors.push(`${file}: 重复 ID ${attrs.id}`); ids.add(attrs.id); }
      if (attrs.class?.split(' ').includes('katex-error')) errors.push(`${file}: 公式渲染失败`);
      if (['a', 'link', 'script', 'img'].includes(node.tagName)) {
        const url = attrs.href ?? attrs.src; if (url) links.push({ tag: node.tagName, url });
      }
      for (const child of node.childNodes ?? []) walk(child);
    };
    walk(parse(await readFile(file, 'utf8')));
    pages.set(path.resolve(file), { ids, links });
  }
  const prefix = withBasePath(base, '/');
  for (const [file, info] of pages) {
    const relative = path.relative(directory, file).split(path.sep).join('/').replace(/index\.html$/, '');
    for (const link of info.links) {
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(link.url)) continue;
      const url = new URL(link.url, `https://site.invalid${withBasePath(base, relative)}`);
      if (!url.pathname.startsWith(prefix)) { errors.push(`${file}: 链接越出 base ${link.url}`); continue; }
      let target = path.resolve(directory, decodeURIComponent(url.pathname.slice(prefix.length)));
      if (!isWithin(directory, target)) { errors.push(`${file}: 链接越界 ${link.url}`); continue; }
      const item = await stat(target).catch(() => undefined);
      if (item?.isDirectory()) target = path.join(target, 'index.html');
      if (!await stat(target).catch(() => undefined)) errors.push(`${file}: 缺少目标 ${link.url}`);
      else if (link.tag === 'a' && url.hash && pages.has(target) && !pages.get(target)!.ids.has(decodeURIComponent(url.hash.slice(1)))) errors.push(`${file}: 缺少锚点 ${link.url}`);
    }
  }
  if (errors.length) throw new Error(errors.join('\n'));
  return { pages: pages.size };
}
