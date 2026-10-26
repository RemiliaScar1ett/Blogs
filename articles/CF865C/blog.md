---
title: "CF865C"
slug: legacy-48cd7cc53f01
tree:
  - "题解"
tags:
  - 概率期望
date: 2026-08-15
uid: 1cecc5df-bc11-4162-9634-26c8da4c7b19
dateKind: collected
---
# Gotta Go Fast

## 题面翻译

一个游戏关卡有 $n(n\le50)$ 个任务，若在 $m$ 秒内按顺序完成所有任务则算作通过当前关卡。每个关卡有三个属性 $a_i,b_i,p_i(1\le a_i<b_i\le100,80\le p_i\le99)$，表示有 $p_i\%$ 的概率用 $a_i$ 完成任务 $i$，有 $1-p_i\%$ 的概率用 $b_i$ 秒完成任务 $i$。每完成一个任务后可以选择继续下一个任务或重新开始当前关卡。问通过当前关卡的期望时间。

## 输入格式

The first line of input contains integers $n$ and $m$ ![](./images/image-28036fb17945bce1.png), the number of levels and number of seconds you want to complete the game in, respectively. $n$ lines follow. The $i$ th such line contains integers $a_{i},b_{i},p_{i}$ $(1\le a_{i},b_{i}\le 100,80\le p_{i}\le 99)$ , the fast time for level $i$ , the slow time for level $i$ , and the probability (as a percentage) of completing level $i$ with the fast time.

## 输出格式

Print the total expected time. Your answer must be correct within an absolute or relative error of $10^{-9}$ .

### 样例输入

```
1 8
2 8 81
```

### 样例输出

```
3.14
```

### 解析

先不考虑时间限制 $m$，我们首先可以得到完成任务 $i$ 的期望时间 $f(i)$ 的转移方程：
$$
f(i)=f(i-1)+a_ip_i+b_i(1-p_i)
$$

这里 $p_i$ 直接表示概率。

那么现在，考虑重置操作，
