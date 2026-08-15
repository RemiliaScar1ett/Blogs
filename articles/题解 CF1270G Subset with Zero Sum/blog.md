---
title: "题解 CF1270G Subset with Zero Sum"
slug: legacy-cdccb8a9f1e7
tree:
  - "题解"
tags:
  - "旧文迁移"
date: 2026-08-15
---
# CF1270G Subset with Zero Sum

[$link$](https://www.luogu.com.cn/problem/CF1270G)

这题太神仙了。

首先我们要对限制条件 $i-n\le a_i\le i-1$ 变形，得到 $1\le i-a_i\le n$。

我们要让 $\sum_{i\in S} a_i=0$，就是让 $\sum_{i\in S}i-a_i=\sum_{i\in S}i$。

由于 $i-a_i\in[1,n]$，我们相当于要选出一堆 $i$，让它们变成 $i-a_i$ 之后和还是不变，有点原地转圈的感觉。

考虑让 $i$ 向 $i-a_i$ 连单向边，如果图中有一个环，我们选环上所有的点，那么它们不管怎么变换，求和的总是那几个数，这样的方案一定合法。

考虑到这是一个 $n$ 点 $n$ 边的图，一定存在环；而且题目只让求任意一个方案，所以我们直接搜环即可。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=2e6+10;

int arr[N];
int ver[N],ans[N],res=0;
int root;
bool vis[N];

void dfs(int x)//找环并返回环的根
{
	if(vis[x])
	{
		root=x;
		return ;
	}
	vis[x]=1;
	dfs(ver[x]);
}
void dfs2(int x)
{
	ans[++res]=x;
	if(ver[x]==root) return ;
	dfs2(ver[x]);
}

int main()
{
	int t;
	scanf("%d",&t);
	while(t--)
	{
		res=0;
		int n;
		scanf("%d",&n);
		for(int i=1;i<=n;i++)
		{
			scanf("%d",&arr[i]); vis[i]=0;
			ver[i]=i-arr[i];
		}
		dfs(1);
		dfs2(root);
		printf("%d\n",res);
		for(int i=1;i<=res;i++) printf("%d ",ans[i]);
		printf("\n");
	}
	return 0;
}
```

~~据说这题狙了 tourist%%%(害怕~~
