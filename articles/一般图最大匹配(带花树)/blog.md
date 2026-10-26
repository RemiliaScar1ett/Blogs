---
title: "一般图最大匹配(带花树)"
slug: legacy-f0f47480c269
tree:
  - "笔记"
  - "图论"
tags:
  - 图论
  - 并查集
  - 图匹配
date: 2026-08-15
uid: ac37565b-e68e-4016-b50c-347b47969d4e
dateKind: collected
---
~~又开始乱学东西了~~

## 一般图的最大匹配—带花树算法

### 简介

在此之前，请先确保理解 >[二分图匹配](https://www.luogu.com.cn/problem/P3386)<

对于二分图的最大匹配，我们常用的便是找增广路+给点染白/黑色 (分左/右部) 的匈牙利算法。

而二分图与一般图的区别就是，**二分图没有奇环，一般图有**。问题也就出在这个奇环上。

于是带花树算法(Jack Edmonds于1961年发表)就是来解决这个问题的

### 解析

看下图

![](./images/image-132d916940f67303.png)

当这个具有 $3$ 个点的奇环内存在 $1$ 对以上的匹配时，就会发生同色点匹配的情况，匈牙利直接 $O(+\infty)$ 了。

所以这时我们要在匈牙利的基础上，对前面的匹配进行修改。因此带花树的基本框架是BFS的匈牙利。

现在想想怎么修改比较好。

对于一个有 $2k+1$ 个点的奇环，其内部最多能有 $k$ 组匹配，同时有一个点匹配到环外的点。
我们可以**将奇环缩到一个点**，这个点向外匹配。剩下 $2k$ 个点两两匹配。这个缩完的点就叫**花**。

怎么缩环为点呢？我们需要明白，出现同色点匹配的情况，是由于我们从某个点开始搜出来的两条路径碰头了。现在我们要找到这个点。记这个点 $lca$ 为**最近公共花祖先**，也称**花根**。可以让两个同色节点交替往上跳，第一个重复点就是花根。由于求完花根我们就会缩环 ~~(开花)~~ ，所以暴力上跳的时间复杂度均摊下来并不高。

缩环时，我们利用一个记录前驱的 $pre$ 数组将环连接起来。将**所有的白点染黑然后让这些白点进队**以进行后面的增广操作。此时**整个花中全部变成了黑点，相当于整个花缩成了一个黑点**。为了方便修改以及寻找节点在花中的真正祖先(可能会出现套娃的现象)，我们可以使用并查集。

总时间复杂度约为 $O(nmlog\ n)$。

结合代码食用更佳

code:

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
#define rg register
const int N=1e4+10,M=5e5+10;

inline int read()
{
	rg int x=0,w=1;
	rg char ch=getchar();
	while((ch<'0'||ch>'9')&&ch!='-') ch=getchar();
	if(ch=='-') w=-1,ch=getchar();
	while(ch<='9'&&ch>='0') x=(x<<3)+(x<<1)+(ch-'0'),ch=getchar();
	return x*w;
}

int head[N],ver[M],nxt[M],tot=0;
void add(int x,int y)
{
	ver[++tot]=y;
	nxt[tot]=head[x];
	head[x]=tot;
}
int fa[N];
int find(int x)//并查集
{
	int x_root=x;
	while(fa[x_root]!=x_root) x_root=fa[x_root];
	while(x!=x_root)
	{
		int tmp=fa[x];
		fa[x]=x_root; x=tmp;
	}
	return x_root;
}
int match[N],pre[N];//记录匹配与前驱
int vis[N],dfn[N],tim=0;
int n,m,res=0;

int lca(int x,int y)//求花根
{
  /*dfn是一个标记数组，一边打标即一边上跳，第一个重复点就是花根
	花根一定是一个黑点，所以可以隔点上跳*/
	++tim;
	x=find(x);y=find(y);
	while(dfn[x]!=tim)
	{
		dfn[x]=tim;
		x=find(pre[match[x]]);
		if(y) swap(x,y);
	}
	return x;
}

queue<int> q;
void blossom(int x,int y,int w)//缩奇环(开花)
{
	while(find(x)!=w)
	{
		pre[x]=y;y=match[x];//
		if(vis[y]==2) vis[y]=1,q.push(y);//暴力染黑然后进队
		if(find(x)==x) fa[x]=w;
		if(find(y)==y) fa[y]=w;
		x=pre[y];
	}
}

bool solve(int S)//带花树
{
	for(int i=1;i<=n;i++) fa[i]=i,vis[i]=pre[i]=0;
	while(q.size()) q.pop();

	q.push(S);
	vis[S]=1;
	while(q.size())
	{
		int x=q.front();
		q.pop();
		for(int i=head[x];i;i=nxt[i])
		{
			int y=ver[i];

			if(find(x)==find(y)||vis[y]==2) continue;//y是白点或是同一花中的点
			if(!vis[y])//y还没有染色
			{
				vis[y]=2; pre[y]=x;
				if(!match[y])//没被匹配
				{
					for(int k=y,p;k;k=p)
						p=match[pre[k]],match[k]=pre[k],match[pre[k]]=k;//修改匹配
					return 1;
				}
				vis[match[y]]=1,q.push(match[y]);//被匹配过了
			}
			else //y是黑色点
			{
				int w=lca(x,y);
				blossom(x,y,w);
				blossom(y,x,w);//缩环两个方向各一次拼起来
			}
		}
	}
	return 0;
}

int main()
{
	n=read(),m=read();
	for(int i=1;i<=m;i++)
	{
		int x=read(),y=read();
		add(x,y); add(y,x);
	}

	for(int i=1;i<=n;i++)
		if(!match[i]) res+=solve(i);
	printf("%d\n",res);
	for(int i=1;i<=n;i++)
		printf("%d ",match[i]);
	return 0;
}

```
