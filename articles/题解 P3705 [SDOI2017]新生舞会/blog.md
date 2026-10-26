---
title: "题解 P3705 [SDOI2017]新生舞会"
slug: legacy-bfc2ebdef5a5
tree:
  - "题解"
tags:
  - 网络流
date: 2026-08-15
uid: a5a83b8f-997e-41c9-9f65-a733950e1ad7
dateKind: collected
---
## P3705 [SDOI2017]新生舞会

读题，总结题意：

有两个点集合，不同点集之间的点可以两两互相配对，每一对配对 $(i,j)$ 会产生有两个权值 $a_{i,j},b_{i,j}$，求配对方案 $S$ 使得 $C=\frac{\sum_{(i,j)\in S} a_{i,j}}{\sum_{(i,j)\in S} b_{i,j}}$ 最大，且所有点都被配对。只需给出 $C$ 的最大值。

---

根据做题经验，这是一个分数规划问题，我们可以考虑 **二分一个值 $mid$ 使得 $C\ge mid$**。

然后套路地化一下式子：

$$\sum_{(i,j)\in S} a_{i,j}\ge mid \sum_{(i,j)\in S} b_{i,j}\\
\sum_{(i,j)\in S}(a_{i,j}-mid\cdot b_{i,j})\ge 0
$$

对于每一个 $mid$，我们需要验证存在一种情况上面的式子能够成立。问题集中于如何解决这个配对问题。

对于这类配对问题我们很容易想到网络流。

设题中的男生为左部点，女生为右部点，由于对于每一个左部点，都向所有的右部点连了边，且左右两部点的个数相同，所以一定存在一个完美匹配。

我们 **建立超级源汇点，超级源点向所有左部点连边，左部点向右部点连边，右部点向超级汇点连边，容量均为 $1$**。容易证图中任意一个最大流与一个合法方案一一对应。

然后我们要考虑如何体现权值的影响。

由于最大流已经被用来保证了合法方案，我们可以从费用下手。从上面的不等式可以看出，我们只需要验证不等式右边的最大值大于 $0$ 即可，发现求和的每一项都只与一对配对本身有关，而配对在上面的建图中被抽象成了边，**所以我们将边 $(i,j)$ 的费用设成 $a_{i,j}-mid\cdot b_{i,j}$，然后跑最大费用最大流，判定费用是否大于 $0$** 即可

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef double dd;

const int N=1010,M=1e5+10,INF=1e8;

int head[N],ver[M<<1],nxt[M<<1],cc[M<<1],tot=0;
dd ww[M<<1];
void add(int x,int y,int c,dd d)
{
	ver[tot]=y; cc[tot]=c; ww[tot]=d; nxt[tot]=head[x]; head[x]=tot++;
	ver[tot]=x; cc[tot]=0; ww[tot]=-d; nxt[tot]=head[y]; head[y]=tot++;
}
int n,S,T;
int a[N][N],b[N][N];

int q[M],incf[M],pre[M];
dd d[M];
bool vis[M];

bool spfa()
{
	int hh=0,tt=1;
	memset(d,0x42,sizeof d);
	memset(incf,0,sizeof incf);
	q[0]=S; d[S]=0.0; incf[S]=INF;
	while(hh!=tt)
	{
		int x=q[hh++];
		if(hh==M) hh=0;
		vis[x]=0;
		for(int i=head[x];~i;i=nxt[i])
		{
			int y=ver[i];
			if(cc[i] && d[y]>d[x]+ww[i])
			{
				d[y]=d[x]+ww[i];
				pre[y]=i;
				incf[y]=min(cc[i],incf[x]);
				if(!vis[y])
				{
					q[tt++]=y;
					if(tt==M) tt=0;
					vis[y]=1;
				}
			}
		}
	}
	return incf[T]>0;
}

dd EK()
{
	int flow=0;
	dd cost=0;
	while(spfa())
	{
		int tmp=incf[T];
		flow+=tmp; cost+=(dd)tmp*d[T];
		for(int i=T;i!=S;i=ver[pre[i]^1])
		{
			cc[pre[i]]-=tmp;
			cc[pre[i]^1]+=tmp;
		}
	}
	return cost;
}


bool check(dd mid)
{
	memset(head,-1,sizeof head);
	tot=0;
	for(int i=1;i<=n;i++)
	{
		for(int j=1;j<=n;j++)
			add(i,n+j,1,-((dd)a[i][j]-mid*(dd)b[i][j]));
	}
	for(int i=1;i<=n;i++)
		add(S,i,1,0),add(n+i,T,1,0);
	return -EK()>=0;
}

int read()
{
	int x=0;
	int w=1;
	char ch=getchar();
	while(ch>'9'||ch<'0') w*=(ch=='-'?-1:1),ch=getchar();
	while(ch>='0'&&ch<='9') x=(x<<1)+(x<<3)+ch-'0',ch=getchar();
	return x*w;
}

int main()
{
	n=read();
	for(int i=1;i<=n;i++)
		for(int j=1;j<=n;j++) a[i][j]=read();
	for(int i=1;i<=n;i++)
		for(int j=1;j<=n;j++) b[i][j]=read();
	dd l=-1e5-10,r=1e5+10,mid;
	S=0,T=2*n+1;
	while(r-l>1e-7)
	{
		mid=(l+r)/2.0;
		if(check(mid)) l=mid;
		else r=mid;
	}
	printf("%.6lf",l);
	return 0;
}

```
