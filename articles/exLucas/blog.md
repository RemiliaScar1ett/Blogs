---
title: "exLucas"
slug: legacy-82ace9cae74d
tree:
  - "笔记"
  - "数论"
tags:
  - 数论
  - 组合数学
date: 2026-08-15
uid: aa39c962-ea4a-4acb-af82-5aa5be22133a
dateKind: collected
---
## ExLucas 定理

和 Lucas 没啥关系。

求：

$$C_n^m\bmod p\\\ $$

其中，$1\le n,m\le 10^{18},\ 1\le p\le 10^6$。

$p$ 不是质数了不能套 Lucas 了。

首先把 $p$ 质数分解掉：设 $p=p_1^{k_1}p_2^{k_2}p_3^{k_3}\cdots p_i^{k_i}$

套路的，我们将要求的东西分解成：

$$
\begin{cases}
C_n^m\bmod p_1^{k_1}\\
C_n^m\bmod p_2^{k_2}\\
C_n^m\bmod p_3^{k_3}\\
\qquad \vdots\\
C_n^m\bmod p_i^{k_i}
\end{cases}
$$

最后用 CRT 合并即可。

现在我们的问题变成了要求：

$$C_n^m\bmod p_i^{k_i}$$

考虑到 $m!(n-m)!$ 中可能有
