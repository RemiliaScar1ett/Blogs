---
title: "这个博客如何组织内容"
slug: "how-this-blog-is-organized"
hidden: true
tree:
  - "站点"
  - "架构"
tags:
  - "Astro"
  - "Article Bundle"
  - "静态站点"
date: 2026-08-12
summary: "演示 Article Bundle、逻辑目录、标签与静态全文搜索如何在同一套内容模型中协作。"
uid: fc305e29-c64a-42bc-86e8-2d216c97de93
---

这是一篇示例文章。每篇文章只需要一个独立文件夹，其中固定入口为 `blog.md`，其他图片与附件都可以留在自己的文章包中。

## 物理位置和逻辑位置解耦

磁盘上的位置可以只是：

```text
articles/how-this-blog-is-organized/blog.md
```

而逻辑目录由 frontmatter 决定：

```text
站点 / 架构
```

因此改变网站目录时不需要移动文章，也不会破坏文章内部的相对图片引用。

## 数学公式

历史笔记可以继续使用 LaTeX。例如：

$$
\nabla_x f(x) = J_f(x)^\top
$$

行内公式也可以写成 $a^2+b^2=c^2$。

## 代码块

```cpp
#include <iostream>

int main() {
    std::cout << "Article Bundle" << std::endl;
    return 0;
}
```

> 站点构建时，Astro 负责 Markdown 渲染，Pagefind 在生成 HTML 后建立全文索引。
