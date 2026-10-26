---
title: "AT4168 [ARC100C] Or Plus Max"
slug: legacy-53492972fc80
tree:
  - "题解"
tags:
  - 位运算
  - 子集枚举
date: 2026-08-15
uid: d3349d5e-3fb6-47b2-a0e8-81bf2b9329cf
dateKind: collected
---
## AT4168 [ARC100C] Or Plus Max

观察题目，我们要对所有的整数 $K\in[1,2^n-1]$ 求 $\mathop{Max}_{i\mathop{|} j\le K \text{且} i,j\le2^n}a_i+a_j$。

考虑问题限制条件的的意义。

由于涉及到了位运算，我们可以从二进制与集合的角度来看。选出 $i,j$ 满足 $i|j\le K$ 其实就是在 $K$ 表示的集合中选出两个子集，而 $a_i+a_j$ 的和最大就是给集合一个权值，求选出两个子集能做到的最大权值和。

最暴力的做法是枚举这两个子集。
