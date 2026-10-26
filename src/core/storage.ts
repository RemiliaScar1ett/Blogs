import { readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { splitFrontmatter } from './metadata.ts';
import type { ArticleSource } from './types.ts';

export function isWithin(parent: string, child: string) {
  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

export async function blogFiles(directory: string): Promise<string[]> {
  let entries;
  try { entries = await readdir(directory, { withFileTypes: true }); }
  catch (e: any) { if (e.code === 'ENOENT') return []; throw e; }
  const files: string[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const full = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`${full}: 文章区不支持符号链接`);
    if (entry.isDirectory()) files.push(...await blogFiles(full));
    else if (entry.name === 'blog.md') files.push(full);
  }
  return files;
}

export async function readArticle(file: string): Promise<ArticleSource> {
  const sourcePath = await realpath(file);
  const raw = await readFile(sourcePath, 'utf8');
  const { metadata, source, lineOffset } = splitFrontmatter(raw, sourcePath);
  return { metadata, raw, document: { format: metadata.format, source, sourcePath, bundleRoot: path.dirname(sourcePath), lineOffset } };
}

export async function readArticles(root: string, area = 'articles') {
  return Promise.all((await blogFiles(path.join(root, area))).map(readArticle));
}
