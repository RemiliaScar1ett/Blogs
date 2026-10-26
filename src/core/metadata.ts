import { z } from 'zod';
import { parseDocument } from 'yaml';
import type { ArticleMetadata } from './types.ts';

export const SITE_TIME_ZONE = process.env.SITE_TIME_ZONE || 'America/Denver';
const day = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((s) => {
  const value = new Date(`${s}T00:00:00Z`);
  return Number.isFinite(value.valueOf()) && value.toISOString().slice(0, 10) === s;
}, '日期不存在');
const instant = z.iso.datetime({ offset: true });
export const metadataSchema = z.object({
  title: z.string().trim().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/),
  uid: z.string().trim().min(1).optional(),
  tree: z.array(z.string().trim().min(1)).min(1),
  tags: z.array(z.string().trim().min(1)).default([]),
  date: day.optional(), updated: day.optional(),
  dateKind: z.enum(['published', 'collected']).default('published'),
  publishedAt: instant.optional(), updatedAt: instant.optional(),
  summary: z.string().max(400).optional(),
  hidden: z.boolean().default(false),
  format: z.string().trim().min(1).default('markdown'),
});

export function splitFrontmatter(raw: string, file = 'blog.md') {
  const match = raw.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`${file}:1: 缺少完整 YAML frontmatter`);
  const doc = parseDocument(match[1]);
  if (doc.errors.length) throw new Error(`${file}: ${doc.errors.map((e) => e.message).join('\n')}`);
  const parsed = metadataSchema.safeParse(doc.toJS());
  if (!parsed.success) throw new Error(`${file}: 元数据无效\n${parsed.error.issues.map((i) => {
    const node = doc.getIn(i.path, true) as { range?: number[] } | undefined;
    const line = 1 + match[1].slice(0, node?.range?.[0] ?? 0).split('\n').length;
    return `  ${file}:${line}: ${i.path.join('.')}: ${i.message}`;
  }).join('\n')}`);
  return { metadata: parsed.data as ArticleMetadata, source: raw.replace(/^\uFEFF/, '').slice(match[0].length), lineOffset: match[0].split('\n').length - 1, yaml: doc };
}

export function calendarDate(value: string, timeZone = SITE_TIME_ZONE) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  const part = (key: string) => parts.find((p) => p.type === key)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function displayDate(metadata: ArticleMetadata) {
  return metadata.publishedAt ? calendarDate(metadata.publishedAt) : metadata.date;
}

export function writeMetadata(raw: string, updates: Record<string, unknown>, file?: string) {
  const { yaml, source } = splitFrontmatter(raw, file);
  for (const [key, value] of Object.entries(updates)) {
    if (value === undefined) yaml.delete(key);
    else yaml.set(key, value);
  }
  return `---\n${yaml.toString({ lineWidth: 0 })}---\n${source}`;
}
