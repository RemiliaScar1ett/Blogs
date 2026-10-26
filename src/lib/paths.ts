import { withBasePath } from '../core/urls.ts';
export { tagSlug, treeAnchor } from '../core/urls.ts';
export const withBase = (pathname = '/') => withBasePath(import.meta.env.BASE_URL, pathname);
