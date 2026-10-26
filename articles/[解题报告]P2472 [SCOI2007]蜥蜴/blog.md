---
title: "[解题报告]P2472 [SCOI2007]蜥蜴"
slug: legacy-bd427143a1f5
tree:
  - "题解"
tags:
  - 网络流
date: 2026-08-15
uid: b2145e60-65cc-4b13-8109-8d9dded2a152
dateKind: collected
---
## P2472 [SCOI2007]蜥蜴

把石柱抽象为点，蜥蜴抽象为流来建图。

由于石柱有次数限制所以要拆点，出入点连的边容量为使用限制次数。

建立超级源点，向每个有蜥蜴的竹子连一条容量为 $1$ 的边。

能够互相跳到的柱子之间连容量为 $+\infty$ 的边。能够跳出去的柱子向汇点连一条容量为 $+\infty$ 的边。

然后最大流就是最多能够跳出去的蜥蜴数量。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=5e3+10,M=5e5+10,INF=1e8;

int head[N<<1],ver[M<<1],nxt[M<<1],cc[M<<1],tot=0;
void add(int x,int y,int c)
{
	ver[tot]=y; cc[tot]=c; nxt[tot]=head[x]; head[x]=tot++;
	ver[tot]=x; cc[tot]=0; nxt[tot]=head[y]; head[y]=tot++;
}
int q[N],d[N],cur[N];
int num=0,tim[N];
pair<int,int> pos[N];
map<pair<int,int>,int> poi;
int R,C,D,S,T;

int disq(pair<int,int> a,pair<int,int> b)
{
	return (a.first-b.first)*(a.first-b.first)+(a.second-b.second)*(a.second-b.second);
}

bool bfs()
{
	int hh=0,tt=0;
	memset(d,-1,sizeof d);
	q[0]=S; d[S]=0; cur[S]=head[S];
	while(hh<=tt)
	{
		int x=q[hh++];
		for(int i=head[x];~i;i=nxt[i])
		{
			int y=ver[i];
			if(d[y]==-1 && cc[i])
			{
				d[y]=d[x]+1;
				cur[y]=head[y];
				if(y==T) return 1;
				q[++tt]=y;
			}
		}
	}
	return 0;
}

int find(int u,int lim)
{
	if(u==T) return lim;
	int flow=0;
	for(int i=cur[u];~i && flow<lim;i=nxt[i])
	{
		int y=ver[i];
		cur[u]=i;
		if(d[y]==d[u]+1 && cc[i])
		{
			int tmp=find(y,min(cc[i],lim-flow));
			if(!tmp) d[y]=-1;
			cc[i]-=tmp; cc[i^1]+=tmp; flow+=tmp;
		}
	}
	return flow;
}

int dinic()
{
	int res=0,flow;
	while(bfs())
	while(flow=find(S,INF)) res+=flow;
	return res;
}

int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0); cout.tie(0);

	memset(head,-1,sizeof head);
	cin>>R>>C>>D;
	S=N-1,T=N-2;
	for(int i=1;i<=R;i++)
	{
		for(int j=1;j<=C;j++)
		{
			char x;
			cin>>x;
			if(x>'0'&&x<='9') tim[++num]=x-'0',pos[num]={i,j},poi[pos[num]]=num;
		}
	}
	for(int i=1;i<=num;i++)
	{
		add(i,R*C+i,tim[i]);
		for(int j=i+1;j<=num;j++)
		{
			if(disq(pos[i],pos[j])<=D*D)
			{
				add(R*C+i,j,INF);
				add(R*C+j,i,INF);
			}
		}
		if(abs(pos[i].first-1)<D||abs(R-pos[i].first)<D||abs(pos[i].second-1)<D||abs(C-pos[i].second)<D) add(R*C+i,T,INF);
	}
	int sum=0;
	for(int i=1;i<=R;i++)
	{
		for(int j=1;j<=C;j++)
		{
			char x;
			cin>>x;
			if(x=='L') add(S,poi[{i,j}],1),++sum;
		}
	}
	cout<<sum-dinic()<<"\n";
	return 0;
}

```
