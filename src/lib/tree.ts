import type { ArticleEntry } from './articles';

export interface ArticleTreeNode {
  name: string;
  path: string[];
  children: ArticleTreeNode[];
  articles: ArticleEntry[];
  count: number;
}

interface MutableNode {
  name: string;
  path: string[];
  children: Map<string, MutableNode>;
  articles: ArticleEntry[];
}

export function buildArticleTree(articles: ArticleEntry[]): ArticleTreeNode[] {
  const root: MutableNode = { name: '', path: [], children: new Map(), articles: [] };

  for (const article of articles) {
    let cursor = root;
    for (const segment of article.data.tree) {
      let next = cursor.children.get(segment);
      if (!next) {
        next = {
          name: segment,
          path: [...cursor.path, segment],
          children: new Map(),
          articles: [],
        };
        cursor.children.set(segment, next);
      }
      cursor = next;
    }
    cursor.articles.push(article);
  }

  const freeze = (node: MutableNode): ArticleTreeNode => {
    const children = [...node.children.values()]
      .map(freeze)
      .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
    const own = [...node.articles].sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
    const count = own.length + children.reduce((sum, child) => sum + child.count, 0);
    return { name: node.name, path: node.path, children, articles: own, count };
  };

  return [...root.children.values()]
    .map(freeze)
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}
