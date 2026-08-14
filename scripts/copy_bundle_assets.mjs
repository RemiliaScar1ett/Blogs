import { cp, mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const ARTICLES = path.join(ROOT, 'articles');
const DIST = path.join(ROOT, 'dist', 'blog');

async function findBlogFiles(dir) {
  const found = [];
  let entries = [];
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return found;
    throw error;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...await findBlogFiles(full));
    else if (entry.isFile() && entry.name === 'blog.md') found.push(full);
  }
  return found;
}

function readSlug(markdown) {
  const frontmatter = markdown.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n/);
  if (!frontmatter) throw new Error('blog.md 缺少 frontmatter');
  const slug = frontmatter[1].match(/^\s*slug\s*:\s*["']?([^"'\r\n]+?)["']?\s*$/m)?.[1]?.trim();
  if (!slug) throw new Error('blog.md 缺少 slug');
  return slug;
}

async function copyDependencies(bundle, destination) {
  const entries = await readdir(bundle, { withFileTypes: true });
  await mkdir(destination, { recursive: true });
  for (const entry of entries) {
    if (entry.name === 'blog.md') continue;
    const source = path.join(bundle, entry.name);
    const target = path.join(destination, entry.name);
    await cp(source, target, { recursive: true, force: true });
  }
}

const blogs = await findBlogFiles(ARTICLES);
for (const blog of blogs) {
  const markdown = await readFile(blog, 'utf8');
  const slug = readSlug(markdown);
  await copyDependencies(path.dirname(blog), path.join(DIST, slug));
}
console.log(`Article Bundle dependencies copied: ${blogs.length} bundles`);
