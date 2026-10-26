import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile, access, chmod, unlink } from 'node:fs/promises';
import path from 'node:path';
import { workspace, article } from './helpers.ts';
import { publishArticle } from '../src/publishing/publish.ts';
import { git } from '../src/publishing/git.ts';
import { splitFrontmatter } from '../src/core/metadata.ts';
import { loadArticles } from '../src/core/repository.ts';
import { assetManifest } from '../src/core/assets.ts';

const first = '2026-10-26T16:00:00.000Z', second = '2026-10-27T16:00:00.000Z';
const build = async (root: string) => { await assetManifest(await loadArticles(root)); };
const now = () => new Date(first);
async function fixture(t: Parameters<typeof workspace>[0]) {
  const parent = await workspace(t), root = path.join(parent, 'work'), remote = path.join(parent, 'remote.git');
  await mkdir(root); await mkdir(remote);
  await git(remote, ['init', '--bare', '--initial-branch=main']);
  await git(root, ['init', '--initial-branch=main']);
  await git(root, ['config', 'user.name', 'Publication Test']);
  await git(root, ['config', 'user.email', 'test@example.invalid']);
  await git(root, ['config', 'commit.gpgsign', 'false']);
  await writeFile(path.join(root, '.gitignore'), '.cache/\ndrafts/\nnode_modules\n');
  await writeFile(path.join(root, 'unrelated.txt'), 'unchanged');
  await git(root, ['add', '.']); await git(root, ['commit', '-m', 'initial']);
  await git(root, ['remote', 'add', 'origin', remote]); await git(root, ['push', '-u', 'origin', 'main']);
  const draft = await article(root, 'drafts/post', { date: undefined, uid: 'stable-uid' }, '正文介绍。\n\n[附件](./data.csv)');
  await writeFile(path.join(root, 'drafts/post/data.csv'), 'a,b\n1,2');
  return { root, remote, draft, published: path.join(root, 'articles/post/blog.md') };
}
async function hook(file: string) { await writeFile(file, '#!/bin/sh\nexit 1\n'); await chmod(file, 0o755); }

test('首次发布、更新和无变化发布保留身份与首次时间，只提交目标文章', async (t) => {
  const { root, remote, published, draft } = await fixture(t);
  await writeFile(path.join(root, 'untracked-secret.txt'), 'must not commit');
  const result = await publishArticle(root, 'post', { build, now });
  assert.equal(result.status, 'pushed');
  const initial = splitFrontmatter(await readFile(published, 'utf8')).metadata;
  assert.equal(initial.uid, 'stable-uid'); assert.equal(initial.publishedAt, first); assert.equal(initial.updatedAt, undefined);
  await assert.rejects(access(draft));
  assert.deepEqual((await git(root, ['diff-tree', '--no-commit-id', '--name-only', '-r', 'HEAD'])).trim().split('\n'), ['articles/post/blog.md', 'articles/post/data.csv']);
  const originalCommit = (await git(root, ['rev-parse', 'HEAD'])).trim();
  assert.equal((await git(remote, ['rev-parse', 'main'])).trim(), originalCommit);
  assert.equal((await publishArticle(root, 'post', { build, now: () => new Date(second) })).status, 'unchanged');
  assert.equal((await git(root, ['rev-parse', 'HEAD'])).trim(), originalCommit);
  await writeFile(published, (await readFile(published, 'utf8')) + '\n新增段落。\n');
  await publishArticle(root, 'post', { build, now: () => new Date(second) });
  const updated = splitFrontmatter(await readFile(published, 'utf8')).metadata;
  assert.equal(updated.uid, initial.uid); assert.equal(updated.publishedAt, first); assert.equal(updated.updatedAt, second);
});

test('dry-run 与候选构建失败不修改原稿或提交', async (t) => {
  const { root, draft, published } = await fixture(t);
  const before = await readFile(draft, 'utf8'), head = await git(root, ['rev-parse', 'HEAD']);
  assert.equal((await publishArticle(root, 'post', { build, now, dryRun: true })).status, 'validated');
  assert.equal(await readFile(draft, 'utf8'), before); await assert.rejects(access(published));
  await assert.rejects(publishArticle(root, 'post', { now, build: async () => { throw new Error('intentional build failure'); } }), /build failure/);
  assert.equal(await readFile(draft, 'utf8'), before);
  assert.equal(await git(root, ['rev-parse', 'HEAD']), head);
  assert.equal(await git(root, ['diff', '--cached', '--name-only']), '');
});

test('提交失败恢复新文章与更新文章的工作稿，清空本次暂存', async (t) => {
  const { root, draft, published } = await fixture(t);
  const preCommit = path.join(root, '.git/hooks/pre-commit');
  await hook(preCommit);
  const before = await readFile(draft, 'utf8');
  await assert.rejects(publishArticle(root, 'post', { build, now }));
  assert.equal(await readFile(draft, 'utf8'), before); await assert.rejects(access(published));
  assert.equal(await git(root, ['diff', '--cached', '--name-only']), '');
  await unlink(preCommit); await publishArticle(root, 'post', { build, now });
  await writeFile(published, (await readFile(published, 'utf8')) + '\n作者未提交的新内容。');
  const working = await readFile(published, 'utf8');
  await hook(preCommit); await assert.rejects(publishArticle(root, 'post', { build, now: () => new Date(second) }));
  assert.equal(await readFile(published, 'utf8'), working);
  assert.equal(await git(root, ['diff', '--cached', '--name-only']), '');
});

test('推送失败保留提交，重试沿用时间戳和提交 SHA', async (t) => {
  const { root, remote, published, draft } = await fixture(t);
  const receive = path.join(remote, 'hooks/pre-receive'); await hook(receive);
  await assert.rejects(publishArticle(root, 'post', { build, now }), /--retry-push/);
  const head = await git(root, ['rev-parse', 'HEAD']), content = await readFile(published, 'utf8');
  await access(draft); await access(path.join(root, '.cache/publication/recovery.json'));
  await unlink(receive);
  assert.equal((await publishArticle(root, 'post', { retryPush: true, now: () => new Date(second) })).status, 'pushed');
  assert.equal(await git(root, ['rev-parse', 'HEAD']), head);
  assert.equal(await git(remote, ['rev-parse', 'main']), head);
  assert.equal(await readFile(published, 'utf8'), content);
  await assert.rejects(access(draft)); await assert.rejects(access(path.join(root, '.cache/publication/recovery.json')));
});

test('无关改动、暂存内容、错误分支和构建期间编辑均阻止发布', async (t) => {
  const { root, draft, published } = await fixture(t);
  await writeFile(path.join(root, 'unrelated.txt'), 'changed');
  await assert.rejects(publishArticle(root, 'post', { build, now }), /以外的改动/);
  await git(root, ['add', 'unrelated.txt']);
  await assert.rejects(publishArticle(root, 'post', { build, now }), /暂存区非空/);
  await git(root, ['restore', '--staged', 'unrelated.txt']); await git(root, ['restore', 'unrelated.txt']);
  await git(root, ['switch', '-c', 'topic']);
  await assert.rejects(publishArticle(root, 'post', { build, now }), /main 分支/);
  await git(root, ['switch', 'main']);
  await assert.rejects(publishArticle(root, 'post', { now, build: async (candidate) => { await build(candidate); await writeFile(draft, (await readFile(draft, 'utf8')) + '\n并发编辑'); } }), /构建期间被修改/);
  assert.match(await readFile(draft, 'utf8'), /并发编辑/); await assert.rejects(access(published));
});
