import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { unified } from '@astrojs/markdown-remark';
import localContent from './src/integrations/local-content.ts';

const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [localContent()],
  vite: { server: { watch: { ignored: ['**/.cache/**', '**/dist/**', '**/old_mdfiles/**', '**/migration_tools/**', '**/env/**'] } } },
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [[rehypeKatex, { strict: false }]] }),
  },
});
