---
title: "树形目录、标签与搜索为什么应该分离"
slug: "tree-tags-and-search"
tree:
  - "站点"
  - "内容管理"
tags:
  - "信息架构"
  - "搜索"
  - "标签"
date: 2026-08-11
uid: 92b0cbab-80b7-4047-b31b-393b28a00c22
---

树形目录回答“文章主要属于哪里”，标签回答“文章涉及什么”，全文搜索负责直接从标题和正文中定位信息。这三种访问方式应当共享同一个 Article Record，但不应互相替代。

## 树形目录

一篇文章通常有一个主要逻辑位置，因此 `tree` 使用有序数组：

```yaml
tree:
  - 人工智能
  - 表征研究
  - Grokking
```

## 标签

标签可以有多个：

```yaml
tags:
  - Transformer
  - Grokking
  - Latent Space
```

## 搜索

Pagefind 在 `astro build` 结束后扫描 `dist/`，因此部署仍然是纯静态文件，不需要数据库和搜索服务器。
