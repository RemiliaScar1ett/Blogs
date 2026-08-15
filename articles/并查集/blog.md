---
title: "并查集"
slug: legacy-d361e6360071
tree:
  - "笔记"
  - "数据结构"
tags:
  - "旧文迁移"
date: 2026-08-15
---
并查集，在一些有 $N$ 个元素的集合应用问题中，我们通常是在开始时让每个元素构成一个单元素的集合，然后按一定顺序将属于同一组的元素所在的集合合并，其间要反复查找一个元素在哪个集合中。

并查集是一种**树型**的数据结构，用于处理一些不相交集合（Disjoint Sets）的合并及查询问题。常常在使用中以森林来表示。

---

## 功能

 - 首先定义：当节点 $x$ 与节点 $y$ 有公共祖先时，$x,y$ 在同一集合中。初始状态下，每个节点应当独立。

 - 则合并集合即将两棵树根节点以某种方式连接合并为一棵树。查找 $x,y$ 在同一集合即寻找它们是否有公共祖先。

### 初始化

 建立一个 `parent` 数组，存储每个节点的父节点，将 `parent` 数组初始化为 $-1$，即每个节点互相独立。

### 寻根

**作用**：寻找一个节点的根节点。

**实现**：

(1). 传入一个节点编号 $x$ ，判断其 `parent` 数组值是否为-1（即是否为根节点）。

(2). 若是，则 **将所有经过的节点父节点设为当前的 $x$ 后（路径压缩）** 返回当前的 $x$。

(3). 若不是，将 $x$ 赋值为 `parent[x]` ，重复 (1) 步骤。

### 合并

**作用**：合并两个点所在集合，成功则返回 $true$，失败返回 $false$

**实现**：

(1). 传入两个节点编号 $x$ , $y$ 找到 $x$ , $y$ 的根。

(2). 若 $x$ 根与 $y$ 根相等，返回 $false$

(3). 若不等，则判断 $x$ 所在树与 $y$ 所在树的深度。

相等则任意以一方的根节点为根节点进行连接，被连接的一方深度 $+1$。

不等则连接深度大的一方。

返回 $true$。

（判断深度操作目的是尽量减少树的深度，从而减少寻找根的用时到 $O(logn)$，减小时间复杂度。否则最坏情况将有 $O(n)$ 的查找根时间）（按秩优化）

### 查找

**作用**:寻找两个节点是否在同一集合。

**实现**：

传入两个节点编号，返回节点根节点是否相等

---

## 完整代码

[模板题P3367传送门](https://www.luogu.com.cn/problem/P3367)

~~懒得切输入法所以写的英文注释~~
```cpp
#include <bits/stdc++.h>
using namespace std;
const int VER=1000010;/*number of vertex(node)*/
int parent[VER];/*the parent of each node,initalized with -1*/
int rank_[VER];/*the depth of tree*/
int n,m;
queue<int> ans;

inline void init()
{
	for(int i=0;i<VER;i++)
	{
		parent[i]=-1;
		rank_[i]=0;
	}
}
/*initalizing function*/

inline int find_root(int x)
{
	int x_root=x;
	while(parent[x_root]!=-1)
	{
		x_root=parent[x_root];
	}
	while(x!=x_root)
	{
		int tmp=parent[x];
		parent[x]=x_root;
		x=tmp;
	}
	return x_root;
}
/*This function is to find the root of node x*/

int union_(int x,int y)//return 1--success ; return 0--faild
{
	int x_root=find_root(x);
	int y_root=find_root(y);
	if(x_root==y_root) return 0;
	else
	{
		if(rank_[x_root]>rank_[y_root])
		{
			parent[y_root]=x_root;
		}
		else if(rank_[x_root]<rank_[y_root])
		{
			parent[x_root]=y_root;
		}
		else /*if the rank x is equal to rank y*/
		{
			parent[x_root]=y_root;
			rank_[y_root]++;
		}
		return 1;
	}
}
/*union the set of x and the set of y*/

inline int search_(int x,int y)
{
	if(find_root(x)==find_root(y))
		return 1;
	return 0;
}
/*finding if x is connected with y*/

int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);
	init();
	cin>>n>>m;
	for(int i=1;i<=m;i++)
	{
		int x,y,z;
		cin>>z>>x>>y;
		if(z==1)
			union_(x,y);
		if(z==2)
		{
			ans.push(search_(x,y));
		}
	}
	while(!ans.empty())
	{
		int x=ans.front();
		ans.pop();
		if(x==1) cout<<"Y\n";
		else cout<<"N\n";
	}
	return 0;
}
```
