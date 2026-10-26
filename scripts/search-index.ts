import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

// Runs the shipped Pagefind index in Node, with file transport replacing HTTP.
// No page DOM is involved; the index and result URLs are the production files.
export async function inspectSearch(directory: string, base: string, inspect: (index: any) => Promise<void>) {
  const previous = globalThis.fetch;
  globalThis.fetch = async (input: any) => {
    const url = new URL(String(input));
    if (url.protocol !== 'file:') return previous(input);
    url.search = ''; url.hash = '';
    try { return new Response(await readFile(fileURLToPath(url))); }
    catch { return new Response('not found', { status: 404 }); }
  };
  try {
    const index = await import(pathToFileURL(path.resolve(directory, 'pagefind/pagefind.js')).href);
    await index.options({ baseUrl: base });
    await inspect(index);
  } finally { globalThis.fetch = previous; }
}
