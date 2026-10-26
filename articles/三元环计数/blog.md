---
title: "三元环计数"
slug: legacy-dac0835de8b0
tree:
  - "笔记"
  - "图论"
tags:
  - 图论
date: 2026-08-15
uid: 132e1756-1104-4e2b-954e-f2a01d400d2d
dateKind: collected
---
## 无向图三元环计数

一个科技，在 $O(m\sqrt m)$ 复杂度内寻找三元环 。

解决的具体问题：给定 $n$ 点 $m$ 边的无向图，求无序三元点组 $(i,j,k)$ 的数量，满足图中存在边 $(i,j),(j,k),(i,k)$。

首先，对边进行重定向。对于两个点，我们比较它们的度数大小关系，若相等则比较编号大小，从小的点向大的点连边。这样可以得到一张 新图。

为了方便，我们暂时称 $v$ 是 $u$ 的子节点当 $(u,v)\in E$。

- 在新的 DAG 中每次枚举一个点 $i$，然后将它所有的出边链接的点打上标记 $i$。

- 再枚举 $i$ 的一个子节点 $j$，枚举它的所有子节点，若发现有一个子节点 $k$ 有 $i$ 的标记，则 存在一个三元环 $k$。

这样为什么是对的呢？

按照算法的流程，原来图中的一个三元环 $(i,j,k)$ 在重定向之后一定变成了 $i$ 向 $j,k$ 连边，$j,k$ 之间再连一条边的情况。不妨设为 $j\to k$ 。我们枚举 $i$ 时会标记 $j,k$ ，再遍历 $j$ 找第三个点的时候一定会找到 $k$，并且对于这个环，遍历顺序只可能是 $i,j,k$，也就是我们只能由 $i$ 来找到这个环。每个点我们只会枚举一次，所以图中的每一个三元环，我们都会遍历仅一次。

那么时间复杂度为什么 $O(m\sqrt m)$ 呢？

考虑每条边 $(u,v)$ 对时间复杂度的贡献与 $v$ 的出度同阶，总的时间复杂度应当是 $\sum_{i=1}^m d_v$，这里 $d$ 是出度。

- 对于原图中度数不大于 $\sqrt{m}$ 的点，新图中的度数也不可能更大，所以上界 $\sqrt{m}$。

- 对于原图中度数大于  $\sqrt{m}$ 的点，由于我们只向度数大的点连边，而度数大于 $\sqrt{m}$ 的点最多有 $\sqrt{m}$ 个，度数也不可能超过 $\sqrt m$。

综上，总的时间复杂度 $O(m\sqrt{m})$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef pair<int,int> PII;
typedef long long ll;

const int N=2e5+10;

int head[N],ver[N<<1],nxt[N<<1],tot=0;
void add(int x,int y)
{
	ver[++tot]=y; nxt[tot]=head[x]; head[x]=tot;
}
int n,m;
int d[N],vis[N];
PII E[N];

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=m;i++)
	{
		int x,y;
		scanf("%d%d",&x,&y);
		d[x]++; d[y]++;
		E[i]={x,y};
	}
	for(int i=1;i<=m;i++)
	{
		int x=E[i].first,y=E[i].second;
		if(d[x]<d[y]) add(x,y);
		else if(d[x]==d[y]&&x<y) add(x,y);
		else add(y,x);
	}
	ll ans=0;
	for(int i=1;i<=n;i++)
	{
		for(int j=head[i];j;j=nxt[j])
			vis[ver[j]]=i;
		for(int j=head[i];j;j=nxt[j])
		{
			int y=ver[j];
			for(int k=head[y];k;k=nxt[k])
				if(vis[ver[k]]==i) ans++;
		}
	}
	printf("%lld",ans);
	return 0;
}
```
