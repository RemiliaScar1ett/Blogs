const base = import.meta.env.BASE_URL;
const cleanBase = base === '/' ? '' : base.replace(/\/$/, '');

export function withBase(path = '/') {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}` || '/';
}

export function tagSlug(tag: string) {
  const slug = tag
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
  return slug || encodeURIComponent(tag);
}

export function treeAnchor(path: string[]) {
  return `tree-${path.map(tagSlug).join('--')}`;
}
