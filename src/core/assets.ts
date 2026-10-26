import { readFile, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { isWithin } from './storage.ts';
import type { ArticleRecord, RenderAsset } from './types.ts';

export async function assetManifest(records: ArticleRecord[]) {
  const manifest = new Map<string, { asset: RenderAsset; bytes: Buffer; digest: string }>();
  for (const article of records) for (const asset of article.rendered.assets) {
    const output = asset.outputPath.replaceAll('\\', '/');
    if (path.isAbsolute(output) || output.split('/').some((part) => !part || part === '..' || part === '.') || /^[a-z]:/i.test(output)) throw new Error(`无效资源输出路径: ${output}`);
    if (output.endsWith('/index.html') || output === 'articles.json' || output.startsWith('pagefind/')) throw new Error(`资源覆盖保留路径: ${output}`);
    const bytes = asset.contents !== undefined ? Buffer.from(asset.contents) : await readFile(asset.sourcePath!);
    const digest = createHash('sha256').update(bytes).digest('hex');
    const previous = manifest.get(output.toLowerCase());
    if (previous && (previous.digest !== digest || previous.asset.outputPath !== output)) throw new Error(`资源输出冲突: ${output}`);
    for (const existing of manifest.keys()) {
      const key = output.toLowerCase();
      if (existing.startsWith(key + '/') || key.startsWith(existing + '/')) throw new Error(`资源文件与目录冲突: ${output}`);
    }
    manifest.set(output.toLowerCase(), { asset: { ...asset, outputPath: output }, bytes, digest });
  }
  return [...manifest.values()];
}

export async function writeAssets(records: ArticleRecord[], directory: string, overwrite = false) {
  const manifest = await assetManifest(records);
  for (const { asset, bytes } of manifest) {
    const target = path.resolve(directory, asset.outputPath);
    if (!isWithin(directory, target)) throw new Error(`资源输出越界: ${asset.outputPath}`);
    if (!overwrite && await stat(target).then(() => true, () => false)) throw new Error(`资源将覆盖已有构建文件: ${asset.outputPath}`);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, bytes);
  }
  return manifest.map(({ asset, digest }) => ({ path: asset.outputPath, digest }));
}
