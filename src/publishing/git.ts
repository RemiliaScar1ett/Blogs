import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { withBasePath } from '../core/urls.ts';
const execute = promisify(execFile);
export async function git(root: string, args: string[]) {
  const result = await execute('git', ['-c', 'core.quotepath=false', ...args], { cwd: root, encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024 });
  return result.stdout;
}
export const under = (file: string, directory: string) => file === directory || file.startsWith(directory + '/');
export async function preflight(root: string, target: string) {
  if ((await git(root, ['branch', '--show-current'])).trim() !== 'main') throw new Error('请在 main 分支发布');
  if ((await git(root, ['diff', '--cached', '--name-only', '-z'])).length) throw new Error('暂存区非空，请先处理已暂存的改动');
  const changed = (await git(root, ['diff', '--name-only', '-z', 'HEAD'])).split('\0').filter(Boolean);
  const unrelated = changed.filter((file) => !under(file, target));
  if (unrelated.length) throw new Error(`存在本篇文章以外的改动，请先处理：\n${unrelated.join('\n')}`);
  await git(root, ['fetch', '--quiet', 'origin', 'main']);
  const head = (await git(root, ['rev-parse', 'HEAD'])).trim();
  if (head !== (await git(root, ['rev-parse', 'FETCH_HEAD'])).trim()) throw new Error('本地 main 与 origin/main 不一致，请先同步后再发布');
  return head;
}

export async function deploymentInfo(root: string, commit: string, slug: string) {
  const remote = (await git(root, ['remote', 'get-url', 'origin'])).trim();
  const match = remote.match(/github\.com[:/]([^/]+)\/([^/]+?)(?:\.git)?$/);
  const base = process.env.BASE_PATH ?? (match && match[2].toLowerCase() !== `${match[1]}.github.io`.toLowerCase() ? `/${match[2]}` : '/');
  const site = process.env.SITE_URL ?? (match ? `https://${match[1]}.github.io` : undefined);
  return { commit, article: site ? new URL(withBasePath(base, `blog/${slug}/`), site).href : withBasePath(base, `blog/${slug}/`), workflow: match ? `https://github.com/${match[1]}/${match[2]}/actions?query=branch%3Amain` : undefined };
}
