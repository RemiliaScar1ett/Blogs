import { createHash } from 'node:crypto';

export function withBasePath(base: string, pathname = '/') {
  const prefix = base === '/' ? '' : `/${base.replace(/^\/+|\/+$/g, '')}`;
  return `${prefix}/${pathname.replace(/^\/+/, '')}`;
}

export function tagKey(tag: string) {
  return tag.normalize('NFKC').trim().toLocaleLowerCase('en-US');
}

export function tagSlug(tag: string) {
  const key = tagKey(tag);
  const simple = key.replace(/[^\p{Letter}\p{Number}]+/gu, '-').replace(/^-+|-+$/g, '');
  // Preserve existing simple tag URLs; punctuation must not erase identity.
  return /^[\p{Letter}\p{Number}]+(?:-[\p{Letter}\p{Number}]+)*$/u.test(key)
    ? simple
    : `${simple || 'tag'}-${createHash('sha256').update(key).digest('hex').slice(0, 12)}`;
}

export function treeAnchor(segments: string[]) {
  return `tree-${segments.map(tagSlug).join('--')}`;
}
