---
title: "网络流模板"
slug: legacy-a6595cac0759
tree:
  - "笔记"
  - "图论"
  - "网络流"
tags:
  - 图论
  - 网络流
date: 2026-08-15
uid: d50b70ce-c643-48a8-ab64-3f52761c276b
dateKind: collected
---
## 网络流各类算法的模板

熟背模板就行。

### EK 算法

上界 $O(nm^2)$ 一般情况下可以解决 $n+m=1000 \sim 10000$ 的图

主要步骤：bfs找增广路 $\rightarrow$ 更新答案。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=1e4+10,M=2e5+10;

int n,m,S,T;
int head[N],ver[M],nxt[M],cc[M],tot=0;//cc表示容量
void add(int x,int y,int c)
{
	ver[tot]=y;cc[tot]=c;nxt[tot]=head[x];head[x]=tot++;
	ver[tot]=x;cc[tot]=0;nxt[tot]=head[y];head[y]=tot++;
}//我们维护的是残留网络，连续建正向和反向边
int q[N],d[N],pre[N];//容量最小值，前驱数组
bool vis[N];//判重

bool bfs()//bfs找增广路
{
	int hh=0,tt=0;
	memset(vis,0,sizeof vis);
	q[0]=S,vis[S]=1,d[S]=(int)1e8;
	while(hh<=tt)
	{
		int x=q[hh++];
		for(int i=head[x];~i;i=nxt[i])
		{
			int y=ver[i];
			if(!vis[y] && cc[i])
			{
				vis[y]=1;
				d[y]=min(d[x],cc[i]);
				pre[y]=i;//这里取个巧，记录前驱边
				if(y==T) return 1;
				q[++tt]=y;
			}
		}
	}
	return 0;
}

int EK()
{
	int ans=0;
	while(bfs())
	{
		ans+=d[T];
		for(int i=T;i!=S;i=ver[pre[i]^1])
		{
			cc[pre[i]]-=d[T],cc[pre[i]^1]+=d[T];//合并答案
		}
	}
	return ans;
}

int main()
{
	ios::sync_with_stdio(0);
	cin>>n>>m>>S>>T;
	memset(head,-1,sizeof head);
	for(int i=1;i<=m;i++)
	{
		int a,b,c;
		cin>>a>>b>>c;
		add(a,b,c);
	}
	cout<<EK();
	return 0;
}

```

### dinic 算法

上界 $O(n^2m)$ 一般情况下可以艹过 $n+m=10000-100000$

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e4+10,M=2e5+10,INF=1e8;

int n,m,s,t;
int head[N],ver[M],nxt[M],cc[M],tot=0;
void add(int x,int y,int c)
{
	ver[tot]=y;cc[tot]=c;nxt[tot]=head[x];head[x]=tot++;
	ver[tot]=x;cc[tot]=0;nxt[tot]=head[y];head[y]=tot++;
}
int q[N],d[N],cur[N];//当前路优化

bool bfs()
{
	int hh,tt;
	hh=tt=0;
	memset(d,-1,sizeof d);
	q[0]=s,d[s]=0,cur[s]=head[s];
	while(hh<=tt)
	{
		int x=q[hh++];
		for(int i=head[x];~i;i=nxt[i])
		{
			int y=ver[i];
			if(d[y]==-1 &&cc[i])
			{
				d[y]=d[x]+1;
				cur[y]=head[y];//记录当前路
				if(y==t) return 1;
				q[++tt]=y;
			}
		}
	}
	return 0;
}

int find(int u,int lim)//从源点流向u点的最大流量是lim的话
{
	if(u==t) return lim;
	int flow=0;
	for(int i=cur[u];~i && flow<lim;i=nxt[i])
	{
		cur[u]=i;//记录当前路
		int y=ver[i];
		if(d[y]==d[u]+1 &&cc[i])
		{
			int tmp=find(y,min(cc[i],lim-flow));
			if(!tmp) d[y]=-1;
			cc[i]-=tmp;cc[i^1]+=tmp;flow+=tmp;
		}
	}
	return flow;
}

int dinic()
{
	int res=0,flow;
	while(bfs())
	{
		while(flow=find(s,INF)) res+=flow;
	}
	return res;
}

int main()
{
	scanf("%d%d%d%d",&n,&m,&s,&t);
	memset(head,-1,sizeof head);
	for(int i=1;i<=m;i++)
	{
		int a,b,c;
		scanf("%d%d%d",&a,&b,&c);
		add(a,b,c);
	}
	printf("%d",dinic());
	return 0;
}

```

## 最小割

由最大流最小割定理以及割的性质可以得到：最大流等于最小割。

所以要求最小割容量，直接Dinic跑就可。
