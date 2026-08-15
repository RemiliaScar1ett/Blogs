---
title: "题解 P3573 [POI2014]RAJ-Rally"
slug: legacy-eae566e07799
tree:
  - "题解"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## P3573 [POI2014]RAJ-Rally

首先我们考虑求出以某个点为 起点/终点 的最长路径长度。

由于这是一个 DAG 且边权固定为 1 ，我们可以拓补排序之后 DP。

设 $diss(i)$ 为以 $i$ 为起点的最长路径长度，考虑状态来源。这个状态会被所有有 $(u,i)$ 存在的点更新到，即 $diss(i)=\max\limits_{(u,i)\in E}\{diss(u)+1\}$ 。我们在反图上跑刷表法。用当前的 $x$ 更新 $y$。

设 $dist(i)$ 为以 $i$ 为终点的最长路径长度，和上面几乎一样，在正图上面跑刷表法即可。

现在我们要考虑删点的问题。显然我们无法立即知道哪个点最优。所以我们试图遍历每个点，把每个点都删除一遍。此时我们需要快速得出删点之后的最长路。

首先我们要知道一个拓补图的性质，在拓补序列的两个不相交区间 $A=[l_1,r_1],B=[l_2,r_2](r_1<l_2)$ 之间，只会存在边 $(u,v),(u\in A,v\in B)$。这是拓补排序的过程所决定的。

而我们若是删除一个点 $x$ ，相当于将拓补序列分成了两部分 $A,B$，那么最长路径有三种情况：在 $A$ 内部，在 $B$ 内部，从 $A$ 到 $B$。我们需要维护 $A,B$ 两个集合以及三种情况的最大值。

具体的说：
- 在 $A$ 内部的最长路我们维护它的终点在 $A$ 内部，也就是 $dist(i),i\in A$；
- 跨越 $A,B$ 之间的最长路我们维护在跨越 $A,B$ 集合之间的边 $(u,v),u\in A,v\in B$ 上的最长路，即 $dist(u)+1+diss(v)$ 。
- 在 $B$ 内的最长路我们维护 $diss(i),i\in B$ 即可。

附示意图：

[![](./images/image-75435a9d604e6951.png)](https://pic.imgdb.cn/item/61246cbd44eaada739a7e1d8.png)

现在我们来正式删除点 $x$。这个点上次删除时应在 $B$ 集合中。

首先我们要把经过 $A$ 中的点连向它的边上的最长路全部删去，同时要将以它为起点的最长路删去。

然后直接查询全图的最长路。打擂台记录最小值。

现在我们要把这个点放回去，我们应该把它放到 $A$ 集合。先将以它为终点的最长路放进去，然后再把所有经过它出边的最长路也放进去。

综上，我们需要一个能够支持插入、删除、查询全局最大的数据结构。multiset线段树懒惰删除堆都是可以的，这里使用的懒惰删除堆

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=5e5+10,M=4e6+10,INF=1e8;
int n,m;
int head[N],head1[N],ver[M],nxt[M],edg[M],tot=0;
void add(int x,int y,int w)
{
	ver[++tot]=y; edg[tot]=w; nxt[tot]=head[x]; head[x]=tot;
}
void add1(int x,int y,int w)
{
	ver[++tot]=y; edg[tot]=w; nxt[tot]=head1[x]; head1[x]=tot;
}
int ind[N];
int diss[N],dist[N];
queue<int> q;
int seq[N],id[N];

struct Heap
{
	priority_queue<int> a,b;
	int size_=0;
	void push(int x){a.push(x);++size_;}
	void pop(int x){b.push(x);--size_;}
	int top()
	{
		while(b.size()&&a.top()==b.top()) a.pop(),b.pop();
		return size_<=0?-INF:a.top();
	}
} H;//懒惰删除堆

void topo()
{
	int cnt=0;
	while(q.size())
	{
		int x=q.front();
		q.pop();
		seq[++cnt]=x;id[x]=cnt;
		for(int i=head[x];i;i=nxt[i])
		{
			int y=ver[i];
			ind[y]--;
			if(!ind[y]) q.push(y);
		}
	}
}

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=m;i++)
	{
		int x,y;
		scanf("%d%d",&x,&y);
		add(x,y,1);add1(y,x,1);
		ind[y]++;
	}
	for(int i=1;i<=n;i++) if(!ind[i]) q.push(i);
	topo();
	for(int i=1;i<=n;i++)
	{
		int x=seq[i];
		for(int j=head[x];j;j=nxt[j])
		{
			int y=ver[j];
			dist[y]=max(dist[y],dist[x]+1);
		}
	}
	for(int i=n;i>=1;i--)
	{
		int x=seq[i];
		for(int j=head1[x];j;j=nxt[j])
		{
			int y=ver[j];
			diss[y]=max(diss[y],diss[x]+1);
		}
	}
	for(int i=1;i<=n;i++) H.push(diss[i]);
	int ans=H.top(),anx;
	for(int i=1;i<=n;i++)
	{
		int x=seq[i]; H.pop(diss[x]);
		for(int j=head1[x];j;j=nxt[j])
			H.pop(dist[ver[j]]+diss[x]+1);
		int tmp=H.top();
		if(tmp<ans) ans=tmp,anx=x;
		for(int j=head[x];j;j=nxt[j])
			H.push(dist[x]+diss[ver[j]]+1);
		H.push(dist[x]);
	}
	printf("%d %d",anx,ans);
	return 0;
}
```
