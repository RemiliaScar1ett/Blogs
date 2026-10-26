---
title: "【题解】P5192 有源汇上下界最大流"
slug: legacy-949984b1dfb2
tree:
  - "题解"
tags:
  - 网络流
  - 最短路
date: 2026-08-15
uid: 6596db11-f2d2-4085-b2f3-d1f3ba3de8b5
dateKind: collected
---
#P5192 有源汇上下界最大流

~~Aya 超可爱的\~~~

通读题面，我们整理出以下几点

- ~~文文想搞个大新闻~~
- 1.每天最多拍 $D_i$ 张照片。
- 2.每天只能访问给出的 $C_k$ 个少女。
- 3.对于每个少女，至少拍 $L_{k_i}$ 张，最多拍 $R_{k_i}$ 张。
- 4.到最后每个少女至少要拍 $G_i$ 张
- 5.我们的目标是要最大化照片数目。

我们有充足的动机，将照片作为流，试图使用最大流解决问题。

于是我们为了体现上面的各点限制，如下方式建图：

- 首先建立源汇点 $s,t$ 。
- 我们对每一天 $k$ 建立一个节点 $d_k$ ，对每一个少女 $i$ 建立一个节点 $g_i$ 。
- 源点 $s$ 向每一个 $d_k$ 连边，容量为 $D_k$。
- 每一天向对应的 $C_k$ 个少女连边，容量上下限分别为 $R_{k_i},L_{k_i}$。
- 所有的少女向汇点 $t$ 连边，容量上下界为 $G_i,+\infty$ 。

于是我们发现，这是一个**有源汇上下界最大流**问题。我们最大化的流量值就是照片数。

现在我们的问题是有源汇上下界最大流怎么搞。

由于只需要在这个图的源汇点之间连一条容量为 $+\infty$ 边本问题就可以转化为无源汇上下界网络流问题，我们也就先从无源汇网络流讲起。

### 无源汇上下界可行流

给定一个包含 $n$ 个点 $m$ 条边的有向图 $G<V,E,C>$，每条边都有一个流量下界和流量上界。

求一种可行方案使得在所有点满足流量平衡条件的前提下，所有边满足流量限制。

我们设流量下界为 $c_l$ ，上界为 $c_r$ 。马上可以想到如下式子：

$$
c_l(u,v)\le f(u,v)\le c_r(u,v)\\
 \Rightarrow 0\le f(u,v)-c_l(u,v)\le c_r(u,v)-c_l(u,v)。
$$

我们试着建立一个新网络，$G<V,E>$ ，使得新图中的每一条边的流量减去一个这个边的容量限制，容量也要减去一个容量下界，

即：$f^{\prime}(u,v)=f(u,v)-c_l(u,v),c^{\prime}=c_r(u,v)-c_l(u,v)$

于是，我们会发现它满足不了流向守恒原则！

比如对于 $x$ 点 ，它少出去了 $C_{出}=\sum\limits_{(x,v)\in E}c_l(x,v)$ 这么多流量，少输入了 $C_\text{入}=\sum\limits_{(v,x)\in E}c_l(v,x)$ 这么多流量。由于原图是满足流量守恒的，但建新图会出现 $C_\text{入}>C_\text{出}$ 的情况，新图就无法守恒了。

这里我们借鉴的是 Johnson全源最短路 的解题思路，建立超级源汇点$s,t$，由源点向每个点连一条容量为 $c^{\prime}(s,u)=C_\text{入}-C_\text{出}$ 的边，补齐所需流量，新图就流量守恒了。

而对于 $C_\text{入}<C_\text{出}$  的点，我们也连上一条 $c^{\prime}(u,t)=|C_\text{入}-C_\text{出}|$ 的边，将其多余的流量引入汇点。

经此操作，我们只要对新图求最大流并判定与源点汇点相关联的边是否流量等于容量(即满流)即可

### 有源汇上下界最大流

给定一个包含 $n$ 个点 $m$ 条边的有向图 $G<V,E>$ ，每条边都有一个流量下界和流量上界。

给定源点 $s$ 和汇点 $t$，求源点到汇点的最大流。

我们可以从汇点 $t$ 向源点 $s$ 连一条容量为 $+\infty$ 的虚边 ，整个图就流量守恒了。

于是问题就变成了如何求出无源汇上下界的最大流。

按照我们之前的构造方式，可以构造出新图 $G^{\prime}$ 使得原图中一个确定的可行流 $f_0$ 可以变为新图中的一个满流 $f_0^{\prime}$ 。新图的源汇点分别为 $S,T$。

下面我们考虑新图 $G^{\prime}$ 对于 $f_0^{\prime}$ 的残留网络 $G^{\prime}_{f_0^{\prime}}$。

此时令 $f^{\prime}$ 是一个残留网络中从 $S\rightarrow T$ 的一个满流，并且其中有一部分是从 $s\rightarrow t$ 流过去的，设其为 $f_{s\rightarrow t}^{\prime}$。$f_{s\rightarrow t}^{\prime}$ 是可求的，就是我们一开始加的虚边里面的流量。

现在我们考虑残留网络中所有经过 $s\rightarrow t$ 的可行流 $f^{\prime}$

任取一个 $f_{s\rightarrow t}^{\prime}$，让它加上 $f_0^{\prime}$

则 $|f_{s\rightarrow t}^{\prime}+f_0^{\prime}|$ 中， $f_{s\rightarrow t}^{\prime}$ 应该是和 $S,T$ 及其相邻的边没什么关系的，该满流还是满流，所以我们不必考虑这些东西。

对于中间这部分的的点，不考虑虚边的话除了 $s,t$ 以外都是守恒的，考虑的话都守恒。

总之，$f_{s\rightarrow t}^{\prime}+f_0^{\prime}$ ，得到的还是新图的一个满流，还是原图的一个可行流。

所以，任意的 $f^{\prime}_{s\rightarrow t}$ 在原图中都能找到一个唯一的 $f$ 与之对应。

反向证明：在原图中任取一个可行流 $f$ , 对应到新图中是 $f^{\prime}$

参考上面的证明过程，我们可以试试 $f^{\prime}-f_0^{\prime}$ 会发生什么。

减完之后，$S,T$ 邻边的流量全部抵消了，所有的流量都在中间这部分，流量守恒可以得知，此时减得的流量也可以是 $s\rightarrow t$ 的可行流。也就是能对应一个 $f^{\prime}_{s\rightarrow t}$ 。

综上，我们在新图中任取一个满流 $f_0^{\prime}$ 使得这个图中任意一个满流 $f^{\prime}$ 都可以由 $f_0^{\prime}$ 和 $f^{\prime}_{s\rightarrow t}$ 叠加得到，也就与原图可行流一一对应。

也就是说，令 $f^{\prime}_{0,s\rightarrow t}$ 表示流 $f_0^{\prime}$ 流经 $s\rightarrow t$ 的部分，我们只要最大化 $|f^{\prime}_{0,s\rightarrow t}+f^{\prime}_{s\rightarrow t}|$ 即可

由于 $|f^{\prime}_{0,s\rightarrow t}|$ 已经确定了，其容量就是我们判定可行流式从汇点向源点连边中的流量， 让 $|f^{\prime}_{s\rightarrow t}|$ 最大只需要在新图上求一次 $s\rightarrow t$ 的最大流就可以了。

$Talk\ is\ easy\ ,\ show\ me\ the\ code$

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=4e6+10,M=4e7+10,INF=1e9;

int n,m,s,t,S,T;
int head[N],ver[M],nxt[M],cc[M],tot=0;
void add(int x,int y,int c)
{
	ver[tot]=y; cc[tot]=c; nxt[tot]=head[x]; head[x]=tot++;
	ver[tot]=x; cc[tot]=0; nxt[tot]=head[y]; head[y]=tot++;
}
int q[N],d[N],cur[N];
int A[N];

bool bfs()
{
	int hh=0,tt=0;
	memset(d,-1,sizeof d);
	q[0]=S,d[S]=0,cur[S]=head[S];
	while(hh<=tt)
	{
		int x=q[hh++];
		for(int i=head[x];~i;i=nxt[i])
		{
			int y=ver[i];
			if(d[y]==-1 &&cc[i])
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
		cur[u]=i;
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
		while(flow=find(S,INF)) res+=flow;
	}
	return res;
}

int main()
{
	while(scanf("%d%d",&n,&m)!=EOF)
	{
		memset(A,0,sizeof A);
		memset(head,-1,sizeof head);tot=0;
		s=N-4,t=N-3;
		S=t+1,T=t+2;
		/*1-m 少女 , m+1-m+n 天*/
		for(int i=1;i<=m;i++)//少女与连边
		{
			int G;
			scanf("%d",&G);
			add(i,t,INF-G);
			A[i]-=G,A[t]+=G;
		}
		for(int i=1;i<=n;i++)
		{
			int C,D;
			scanf("%d%d",&C,&D);
			add(s,m+i,D);//源点与天数连边
			for(int j=1;j<=C;j++)
			{
				int tt,L,R;
				scanf("%d%d%d",&tt,&L,&R);
				++tt;//编号从 0 开始->从 1 开始
				add(m+i,tt,R-L);//天数与少女连边
				A[m+i]-=L;A[tt]+=L;
			}
		}
		int sum=0;
		for(int i=1;i<=n+m;i++)//无源汇转化为最大流
		{
			if(A[i]>0) add(S,i,A[i]),sum+=A[i];
			else if(A[i]<0) add(i,T,-A[i]);
		}
		if(A[s]>0) add(S,s,A[s]),sum+=A[s];
		else if(A[s]<0) add(s,T,-A[s]);
		if(A[t]>0) add(S,t,A[t]),sum+=A[t];
		else if(A[t]<0) add(t,T,-A[t]);
        
		add(t,s,INF);//有源汇转无源汇
		if(dinic()<sum) printf("-1\n\n");
		else
		{
			int ff=cc[tot-1];//f'(0,s->t)
			S=s,T=t;//重新指定源汇点，求f'(s->t)
			cc[tot-1]=cc[tot-2]=0;//删边
			printf("%d\n\n",ff+dinic());
		}
	}
	return 0;
}

```
