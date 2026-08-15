---
title: "费用流的基本概念"
slug: legacy-81f2d40f7248
tree:
  - "笔记"
  - "图论"
  - "网络流"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## 费用流的基本概念

### 费用流

费用流是指在一个带费用网络中的可行流中的费用情况。

我们现在涉及的费用流，都是在最大流的前提之下。

**为了方便我们约定除特殊说明外我们所费用流都是最大流中的费用最大/最小流**

Q：有最大流一定有最小费用最大流嘛？

A：有的。但是我们的做法不一定能够做出来。

### 费用流求法

现在网络上的每条边，除了容量外，还有一个属性：单位费用。一条边上的费用等于 $\text{流量}\times \text{单位费用}$。我们知道，网络最大流往往可以用多种不同的方式达到，所以现在要求：在保持流最大的同时，找到总费用最少的一种。

其实这个问题很好解决。我们已经知道，只要建了反向边，无论增广的顺序如何，都能求出最大流。我们将 EK 的算法中的 BFS 改为 SPFA 就可以了。也就是说，我们每次找增广路找费用最少的增广路。

我们在建残留网络的时候若正向边单位流量费用为 $w$ 则反向边单位流量费用为 $-w$ 。本质上还是退流的思想方法。我们在退流的时候希望把相应的费用都推掉。根据费用的计算方式此时 $|f(u,v)\times w(u,v)|=|f(u,v)\times [-w(u,v)]|$ 所以可以这样建边。

基于EK算法的费用流模板：(建议背过)

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=5010,M=100010,INF=1e8;

int n,m,S,T;
int head[N],ver[M],nxt[M],cc[M],ww[M],tot=0;
void add(int x,int y,int c,int d)
{
	ver[tot]=y; cc[tot]=c; ww[tot]=d; nxt[tot]=head[x]; head[x]=tot++;
	ver[tot]=x; cc[tot]=0; ww[tot]=-d;nxt[tot]=head[y]; head[y]=tot++;
}
int q[N],d[N],pre[N],incf[N];
bool vis[N];

bool spfa()
{
	int hh=0,tt=1;
	memset(d,0x3f,sizeof d);
	memset(incf,0,sizeof incf);
	q[0]=S; d[S]=0; incf[S]=INF;
	while(hh!=tt)
	{
		int x=q[hh++];
		if(hh==N) hh=0;//循环队列
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
					if(tt==N) tt=0;//这里为了简洁+防止数组越界，我们将tt设高一位
					vis[y]=1;
				}
			}
		}
	}
	return incf[T]>0;
}

void EK(int& flow,int& cost)//用引用来解决传出两个参数的问题
{
	flow=cost=0;
	while(spfa())
	{
		int tmp=incf[T];
		flow+=tmp; cost+=tmp*d[T];
		for(int i=T;i!=S;i=ver[pre[i]^1])
		{
			cc[pre[i]]-=tmp;
			cc[pre[i]^1]+=tmp;
		}
	}
}

int main()
{
	scanf("%d%d%d%d",&n,&m,&S,&T);
	memset(head,-1,sizeof head);
	for(int i=1;i<=m;i++)
	{
		int a,b,c,d;
		scanf("%d%d%d%d",&a,&b,&c,&d);
		add(a,b,c,d);
	}
	int flow,cost;
	EK(flow,cost);
	printf("%d %d",flow,cost);
	return 0;
}

```

---

~~消圈法(先挖个坑以后来填)~~


---

### 费用流的常用做题方式

1. 把原问题转换成一个流网络。

2. 证明原问题所有解的集合可以一一对应到费用流的某一个子集。

3. 证明原问题解的数值关系也与对应的费用流一些数值有相关性
