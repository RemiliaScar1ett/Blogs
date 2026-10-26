---
title: "P4258 [WC2016]挑战NPC"
slug: legacy-2188722982c3
tree:
  - "题解"
tags:
  - 图匹配
date: 2026-08-15
uid: 83f27185-0793-4bfa-a6b1-a70d35070141
dateKind: collected
---
##P4258 [WC2016]挑战NPC

~~小 I 浅笑：“所以，等我领图灵奖吧！”~~

每个筐能装三个？那我把它拆成三个筐，每个筐就只能装一个了。

球和筐的对应关系可以抽象为边。

但是现在要考虑的是怎样做到满足“一个筐子内有不超过 $1$ 个球，那么我们称这样的筐子为半空的”。

观察拆出的点我们发现，对于一个三个点的奇环，要么就没有匹配，要么只有一个匹配，另外单出一个点向外匹配。

所以我们把一个筐拆出的三个点互相连边，算出最大匹配数后 $-n$ 就行。

然后就是几乎裸的带花树。

code

```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=1e6+10;
#define rg register
inline int read()
{
	rg int x=0,w=1;
	rg char ch=getchar();
	if(ch=='-') w=-1,ch=getchar();
	while((ch<'0'||ch>'9')&&ch!='-') ch=getchar();
	while(ch<='9'&&ch>='0') x=(x<<3)+(x<<1)+(ch-'0'),ch=getchar();
	return x*w;
}
int head[N],ver[N],nxt[N],tot;
void add(int x,int y)
{
	ver[++tot]=y;
	nxt[tot]=head[x];
	head[x]=tot;
}
int fa[N];
int find(int x)
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
int match[N],pre[N];
int vis[N],dfn[N],tim=0;
int n,m,e,sum=0;

int lca(int x,int y)
{
	++tim;
	x=find(x);y=find(y);
	while(tim!=dfn[x])
	{
		dfn[x]=tim;
		x=find(pre[match[x]]);
		if(y) swap(x,y);
	}
	return x;
}

queue<int> q;
void blossom(int x,int y,int w)
{
	while(find(x)!=w)
	{
		pre[x]=y; y=match[x];
		if(vis[y]==2) vis[y]=1,q.push(y);
		if(find(x)==x) fa[x]=w;
		if(find(y)==y) fa[y]=w;
		x=pre[y];
	}
}

bool solve(int s)
{
	for(rg int i=1;i<=sum;++i) fa[i]=i,vis[i]=pre[i]=0;
	while(!q.empty()) q.pop();

	q.push(s);
	vis[s]=1;
	while(!q.empty())
	{
		int x=q.front();
		q.pop();
		for(int i=head[x];i;i=nxt[i])
		{
			int y=ver[i];

			if(find(x)==find(y)||vis[y]==2) continue;
			if(!vis[y])
			{
				vis[y]=2; pre[y]=x;
				if(!match[y])
				{
					for(int k=y,p;k;k=p)
						p=match[pre[k]],match[k]=pre[k],match[pre[k]]=k;
					return 1;
				}
				vis[match[y]]=1,q.push(match[y]);
			}
			else
			{
				int w=lca(x,y);
				blossom(x,y,w);
				blossom(y,x,w);
			}
		}
	}
	return 0;
}
inline void add_(int x,int y)
{
	add(x,y);add(y,x);
}
int main()
{
	int T=read();
	while(T--)
	{
		memset(head,0,sizeof head);
		memset(match,0,sizeof match);
		memset(pre,0,sizeof pre);
		memset(vis,0,sizeof vis);
		n=read(),m=read(),e=read();
		/*1-n为各个球代表的点的编号,n-n+3m是筐代表点的编号*/
		sum=n+3*m;
		for(int i=1;i<=e;i++)
		{
			int x,y;
			x=read(),y=read();
			add_(x,n+y);
			add_(x,n+m+y);
			add_(x,n+(m<<1)+y);
		}
		for(int i=1;i<=m;i++)
		{
			add_(n+i,n+m+i);
			add_(n+m+i,n+(m<<1)+i);
			add_(n+i,n+(m<<1)+i);
		}
		int res=0;
		for(int i=1;i<=sum;i++)
			if(!match[i]) res+=solve(i);
		printf("%d\n",res-n);
		for(int i=1;i<=n;i++)
			printf("%d ",(match[i]-n-1)%m+1);
		printf("\n");
	}
	return 0;
}

```
