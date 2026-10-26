import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
export const astroBin = path.join(path.dirname(require.resolve('astro/package.json')), 'bin/astro.mjs');
export function run(command: string, args: string[], cwd: string, env: NodeJS.ProcessEnv = process.env) {
  return new Promise<void>((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: 'inherit', windowsHide: true });
    child.on('error', reject);
    child.on('exit', (code) => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} 退出码 ${code}`)));
  });
}
