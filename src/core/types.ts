export interface ArticleMetadata {
  title: string;
  slug: string;
  uid?: string;
  tree: string[];
  tags: string[];
  date?: string;
  updated?: string;
  dateKind: 'published' | 'collected';
  publishedAt?: string;
  updatedAt?: string;
  summary?: string;
  hidden: boolean;
  format: string;
}

export interface ArticleDocument {
  format: string;
  source: string;
  sourcePath: string;
  bundleRoot: string;
  lineOffset: number;
}

export interface Diagnostic {
  level: 'error' | 'warning';
  code: string;
  message: string;
  file: string;
  line?: number;
  column?: number;
}

export interface RenderAsset {
  kind: 'image' | 'attachment' | 'style' | 'script';
  outputPath: string;
  sourcePath?: string;
  contents?: string;
  entrypoint?: boolean;
}

export interface RenderResult {
  html: string;
  headings: { depth: number; slug: string; text: string }[];
  summaryText: string;
  searchText: string;
  assets: RenderAsset[];
  diagnostics: Diagnostic[];
}

export interface RenderContext {
  base: string;
  slug: string;
  resolveAsset: (reference: string, kind: RenderAsset['kind']) => Promise<string>;
}

export interface Renderer {
  format: string;
  render: (document: ArticleDocument, context: RenderContext) => Promise<RenderResult>;
}

export interface ArticleSource {
  metadata: ArticleMetadata;
  document: ArticleDocument;
  raw: string;
}

export interface ArticleRecord {
  id: string;
  uid: string;
  data: ArticleMetadata & { date: string };
  document: ArticleDocument;
  rendered: RenderResult;
  summary: string;
  url: string;
}
