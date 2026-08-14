import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const articles = defineCollection({
  loader: glob({
    pattern: '**/blog.md',
    base: './articles',
    generateId: ({ data, entry }) => {
      if (typeof data.slug === 'string' && data.slug.trim()) return data.slug.trim();
      return entry.replace(/\/blog\.md$/i, '').replace(/\\/g, '/');
    },
  }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/),
    uid: z.string().min(1).optional(),
    tree: z.array(z.string().min(1)).min(1),
    tags: z.array(z.string().min(1)).default([]),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    summary: z.string().max(400).optional(),
    hidden: z.boolean().default(false),
  }),
});

export const collections = { articles };
