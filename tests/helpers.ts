import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { stringify } from 'yaml';
import type { TestContext } from 'node:test';
import { removeWithin } from '../src/publishing/publish.ts';

export async function workspace(t: TestContext) {
  const parent = path.resolve('.cache/tests');
  await mkdir(parent, { recursive: true });
  const root = await mkdtemp(path.join(parent, 'case-'));
  t.after(() => removeWithin(parent, root));
  return root;
}
export async function article(root: string, directory: string, fields: Record<string, unknown> = {}, body = '这篇文章介绍算法与数据结构。') {
  const bundle = path.join(root, directory);
  await mkdir(bundle, { recursive: true });
  const file = path.join(bundle, 'blog.md');
  await writeFile(file, `---\n${stringify({ title: '测试文章', slug: path.basename(directory), tree: ['笔记', '算法'], tags: ['算法'], date: '2026-08-15', ...fields })}---\n\n${body}\n`);
  return file;
}
