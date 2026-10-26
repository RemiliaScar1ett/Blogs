import { cp, mkdir, mkdtemp, readFile, writeFile, readdir, lstat, rm, symlink, open, unlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import { readArticles, isWithin } from '../core/storage.ts';
import { writeMetadata, splitFrontmatter } from '../core/metadata.ts';
import { compileArticle, validateIdentities } from '../core/repository.ts';
import { run } from '../../scripts/process.ts';
import { git, under, preflight, deploymentInfo } from './git.ts';

interface Options { dryRun?: boolean; prepareOnly?: boolean; retryPush?: boolean; now?: () => Date; build?: (directory: string) => Promise<void> }
interface Recovery { slug: string; target: string; before: string; commit?: string; draft?: string; draftDigest?: string; originalRaw?: string; newArticle: boolean }
const exists = (p: string) => lstat(p).then(() => true, () => false);
const slash = (p: string) => p.split(path.sep).join('/');

export async function removeWithin(parent: string, target: string) {
  const resolved = path.resolve(target), allowed = path.resolve(parent);
  if (!isWithin(allowed, resolved) || resolved === allowed) throw new Error(`拒绝清理范围外路径: ${resolved}`);
  await rm(resolved, { recursive: true, force: true });
}

export async function bundleDigest(directory: string): Promise<string> {
  const hash = createHash('sha256');
  const visit = async (folder: string) => {
    for (const name of (await readdir(folder)).sort()) {
      const full = path.join(folder, name), info = await lstat(full);
      if (info.isSymbolicLink()) throw new Error(`文章包不支持符号链接: ${full}`);
      if (info.isDirectory()) await visit(full);
      else {
        if (name === 'blog.md' && folder !== directory) throw new Error(`文章包内含嵌套文章: ${full}`);
        hash.update(slash(path.relative(directory, full))).update('\0').update(await readFile(full)).update('\0');
      }
    }
  };
  await visit(directory); return hash.digest('hex');
}

async function snapshot(root: string, destination: string, prepareOnly: boolean) {
  if (prepareOnly) {
    for (const name of ['src', 'scripts', 'public', 'templates', 'articles', 'astro.config.mjs', 'tsconfig.json', 'package.json', 'package-lock.json']) {
      if (await exists(path.join(root, name))) await cp(path.join(root, name), path.join(destination, name), { recursive: true });
    }
  } else {
    const files = (await git(root, ['ls-files', '-z'])).split('\0').filter(Boolean);
    for (const file of files) {
      const source = path.join(root, file);
      if (!await exists(source)) continue;
      if ((await lstat(source)).isSymbolicLink()) throw new Error(`站点快照不支持符号链接: ${file}`);
      const target = path.join(destination, file);
      await mkdir(path.dirname(target), { recursive: true }); await cp(source, target);
    }
  }
  if (await exists(path.join(root, 'node_modules'))) await symlink(path.join(root, 'node_modules'), path.join(destination, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
}

async function finish(root: string, journal: string, state: Recovery) {
  if (state.draft && isWithin(path.join(root, 'drafts'), state.draft) && await exists(state.draft)) {
    if (await bundleDigest(state.draft) === state.draftDigest) await removeWithin(path.join(root, 'drafts'), state.draft);
    else console.log('草稿在发布期间有新改动，已保留。');
  }
  await unlink(journal).catch(() => {});
}

async function retry(root: string, slug: string, journal: string) {
  if (!await exists(journal)) throw new Error('没有待重试的发布记录');
  const state: Recovery = JSON.parse(await readFile(journal, 'utf8'));
  if (state.slug !== slug) throw new Error(`待完成的文章为 ${state.slug}`);
  if (!state.commit) throw new Error('上次发布在提交前中断，请检查 .cache/publication/recovery.json 中的恢复信息和工作区');
  if ((await git(root, ['branch', '--show-current'])).trim() !== 'main' || (await git(root, ['rev-parse', 'HEAD'])).trim() !== state.commit) throw new Error('当前分支或提交已变化，请先恢复到待推送提交后重试');
  await git(root, ['fetch', '--quiet', 'origin', 'main']);
  if ((await git(root, ['rev-parse', 'FETCH_HEAD'])).trim() !== state.commit) await git(root, ['push', 'origin', 'HEAD:refs/heads/main']);
  await finish(root, journal, state);
  return { status: 'pushed', ...await deploymentInfo(root, state.commit, slug), slug };
}

export async function publishArticle(root: string, slug: string, options: Options = {}) {
  root = path.resolve(root);
  if (!/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/.test(slug)) throw new Error('请输入文章 slug');
  const cache = path.join(root, '.cache/publication');
  await mkdir(cache, { recursive: true });
  const lockPath = path.join(cache, 'lock');
  let lock;
  try { lock = await open(lockPath, 'wx'); }
  catch (error: any) {
    if (error.code !== 'EEXIST') throw error;
    const pid = Number(await readFile(lockPath, 'utf8'));
    if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error('发布锁无效，请检查 .cache/publication/lock');
    try { process.kill(pid, 0); throw new Error(`发布进程 ${pid} 仍在运行`); }
    catch (active: any) { if (active.code !== 'ESRCH') throw active; }
    await unlink(lockPath);
    lock = await open(lockPath, 'wx');
  }
  await lock.writeFile(String(process.pid));
  const journal = path.join(cache, 'recovery.json');
  let temporary: string | undefined;
  try {
    if (options.retryPush) return await retry(root, slug, journal);
    if (await exists(journal)) throw new Error('存在未完成发布，请先使用 --retry-push 恢复');
    const published = await readArticles(root), drafts = await readArticles(root, 'drafts');
    validateIdentities(published);
    const candidates = [...published, ...drafts].filter((s) => s.metadata.slug === slug);
    if (candidates.length !== 1) throw new Error(`需要唯一文章 ${slug}，找到 ${candidates.length} 篇`);
    const source = candidates[0];
    if (source.metadata.hidden) throw new Error('文章为隐藏状态，请确认正文完成并设置 hidden: false');
    const newArticle = isWithin(path.join(root, 'drafts'), source.document.bundleRoot);
    const target = newArticle ? `articles/${path.basename(source.document.bundleRoot)}` : slash(path.relative(root, source.document.bundleRoot));
    const destination = path.join(root, target);
    if (newArticle && await exists(destination)) throw new Error(`目标文章包已存在: ${target}`);
    if (options.prepareOnly && !newArticle) throw new Error('兼容发布入口只接受 drafts 中的草稿');
    const before = options.prepareOnly ? '' : await preflight(root, target);
    const digest = await bundleDigest(source.document.bundleRoot);
    if (!newArticle && !options.prepareOnly) {
      const changed = await git(root, ['diff', '--name-only', '-z', 'HEAD', '--', target]);
      const added = await git(root, ['ls-files', '--others', '--exclude-standard', '-z', '--', target]);
      if (!changed && !added) return { status: 'unchanged', slug };
    }
    const now = (options.now?.() ?? new Date()).toISOString();
    const updates: Record<string, unknown> = {};
    if (newArticle) {
      updates.uid = source.metadata.uid ?? randomUUID(); updates.publishedAt = now; updates.dateKind = 'published';
      updates.updatedAt = undefined; updates.updated = undefined;
    } else {
      const original = splitFrontmatter(await git(root, ['show', `HEAD:${target}/blog.md`]));
      updates.uid = original.metadata.uid ?? source.metadata.uid ?? randomUUID();
      updates.publishedAt = original.metadata.publishedAt;
      updates.updatedAt = now;
    }
    const preliminary = { ...source, metadata: { ...source.metadata, ...updates } } as typeof source;
    await compileArticle(preliminary, { draft: true });
    const raw = writeMetadata(source.raw, updates, source.document.sourcePath);
    temporary = await mkdtemp(path.join(cache, 'candidate-'));
    await snapshot(root, temporary, !!options.prepareOnly);
    const candidate = path.join(temporary, target);
    if (await exists(candidate)) await removeWithin(temporary, candidate);
    await cp(source.document.bundleRoot, candidate, { recursive: true });
    await writeFile(path.join(candidate, 'blog.md'), raw);
    await (options.build ?? (async (directory) => {
      const env = { ...process.env }; delete env.DRAFT_PREVIEW_SLUG;
      await run(process.execPath, [path.join(directory, 'scripts/build.ts')], directory, env);
    }))(temporary);
    if (options.dryRun) return { status: 'validated', slug, target, publishedAt: updates.publishedAt ?? null, updatedAt: updates.updatedAt ?? null };
    if (await bundleDigest(source.document.bundleRoot) !== digest) throw new Error('文章在构建期间被修改，请重新执行发布');
    if (!options.prepareOnly) {
      if ((await git(root, ['rev-parse', 'HEAD'])).trim() !== before || (await git(root, ['diff', '--cached', '--name-only', '-z']))) throw new Error('Git 状态在构建期间发生变化，请重新执行发布');
    }
    const state: Recovery = { slug, target, before, newArticle, originalRaw: source.raw, ...(newArticle ? { draft: source.document.bundleRoot, draftDigest: digest } : {}) };
    if (!options.prepareOnly) await writeFile(journal, JSON.stringify(state, null, 2));
    let applied = false;
    try {
      if (newArticle) {
        if (await exists(destination)) throw new Error('目标目录在构建期间被创建');
        applied = true;
        await cp(candidate, destination, { recursive: true });
      } else {
        applied = true;
        await writeFile(path.join(destination, 'blog.md'), raw);
      }
      if (options.prepareOnly) {
        await removeWithin(path.join(root, 'drafts'), source.document.bundleRoot);
        return { status: 'prepared', slug, target };
      }
      await git(root, ['add', '-A', '--', target]);
      const staged = (await git(root, ['diff', '--cached', '--name-only', '-z'])).split('\0').filter(Boolean);
      if (staged.some((file) => !under(file, target))) throw new Error('暂存区混入了本篇文章以外的文件');
      await git(root, ['commit', '-m', `${newArticle ? 'publish' : 'update'}: ${source.metadata.title}`]);
      state.commit = (await git(root, ['rev-parse', 'HEAD'])).trim();
      await writeFile(journal, JSON.stringify(state, null, 2));
    } catch (error) {
      if (!options.prepareOnly && (await git(root, ['rev-parse', 'HEAD'])).trim() !== before) {
        state.commit = (await git(root, ['rev-parse', 'HEAD'])).trim(); await writeFile(journal, JSON.stringify(state, null, 2));
      } else {
        if (!options.prepareOnly) await git(root, ['restore', '--staged', '--', target]).catch(() => {});
        if (applied) { if (newArticle) await removeWithin(path.join(root, 'articles'), destination); else await writeFile(path.join(destination, 'blog.md'), source.raw); }
        await unlink(journal).catch(() => {});
      }
      throw error;
    }
    try { await git(root, ['push', 'origin', 'HEAD:refs/heads/main']); }
    catch (error: any) { throw new Error(`本地提交已保留：${state.commit}\n推送失败，请执行 npm run publish -- ${slug} --retry-push\n${error.message}`); }
    await finish(root, journal, state);
    return { status: 'pushed', slug, ...await deploymentInfo(root, state.commit!, slug) };
  } finally {
    if (temporary) await removeWithin(cache, temporary);
    await lock.close(); await unlink(lockPath);
  }
}
