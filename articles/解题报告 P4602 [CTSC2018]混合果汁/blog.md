---
title: "解题报告 P4602 [CTSC2018]混合果汁"
slug: legacy-2239c61721a3
tree:
  - "题解"
tags:
  - 线段树
  - 贪心
date: 2026-08-15
uid: a46800b4-5552-4334-8840-153c74bc8980
dateKind: collected
---
# P4602 [CTSC2018]混合果汁

仍然是个不错的题。~~虽然CTSC2018锅挺大的~~

有 $n$ 种果汁，每种果汁有单价 $p_i$ 、美味度 $d_i$ 和总量 $L_i$ 三种属性。

有 $m$ 次询问，每次给出两个整数 $g_i$ 和 $L_i$ 为价格和总量的限制。

让我们最大化加入果汁的美味度 $d$ 的最小值。

考虑一下每次二分一个美味度 $d$，作为最小值。

我们当然是贪心地优先选择不小于 $d$ 的最便宜的果汁。然后根据其选择果汁的量来确定最终价格，判断是否合乎要求。

为了快速获得价格数据，我们可以对每一个 $d$ 使用一个权值线段树来维护当前美味度能取到的总量和价格总和。下标是价钱。

我们要对 $d$ 区间查询，所以要可持久化，每个版本维护 $1\sim d$ 的信息。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e5+10;

struct node
{
	int lson,rson;
	ll val,sum;//总价，总数
} tree[N*70];

int n,m;
int root[N],tot=0;//第i种美味度建树
ll MAX=0;//最大价格

struct qwq
{
	ll d,p,l;
	bool operator < (const qwq& a){
		return d<a.d;
	}
} arr[N];

#define lnode tree[node].lson
#define rnode tree[node].rson
#define DEFMID int mid=(start+end)>>1
#define lnode1 tree[node1].lson
#define rnode1 tree[node1].rson

void push_up(int node)
{
	tree[node].sum=tree[lnode].sum+tree[rnode].sum;
	tree[node].val=tree[lnode].val+tree[rnode].val;
}

int build(int start,int end)
{
	int node=++tot;
	if(start==end) return node;
	DEFMID;
	lnode=build(start,mid);
	rnode=build(mid+1,end);
	return node;
}

int update(int node,int start,int end,ll val,ll num)
{
	int node1=++tot;
	tree[node1]=tree[node];
	if(start==end)
	{
		tree[node1].val+=val*num,tree[node1].sum+=num;
		return node1;
	}
	DEFMID;
	if(val<=mid) lnode1=update(lnode,start,mid,val,num);
	else rnode1=update(rnode,mid+1,end,val,num);

	push_up(node1);
	return node1;
}

ll query(int node1,int node,int start,int end,ll val)
{
	if(start==end) return min((ll)val/start,tree[node1].sum-tree[node].sum);
	DEFMID;
	ll cost=tree[lnode1].val-tree[lnode].val;
	if(val>=cost) return tree[lnode1].sum-tree[lnode].sum+query(rnode1,rnode,mid+1,end,val-cost);
	else return query(lnode1,lnode,start,mid,val);
}

bool check(int mid,ll G,ll L)
{
	ll tmp=query(root[n],root[mid-1],0,MAX,G);
	return tmp>=L;
}

ll solve(ll G,ll L)
{
	ll l=1,r=n,ans=0;
	while(l<=r)
	{
		ll mid=(l+r)>>1;
		if(check(mid,G,L))ans=mid,l=mid+1;
		else r=mid-1;
	}
	return ans==0?-1:arr[ans].d;
}

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=n;i++)
		scanf("%lld%lld%lld",&arr[i].d,&arr[i].p,&arr[i].l),MAX=max(MAX,arr[i].p);
	sort(arr+1,arr+1+n);//按照 d 排序
	for(int i=1;i<=n;i++)
		root[i]=update(root[i-1],0,MAX,arr[i].p,arr[i].l);
	for(int i=1;i<=m;i++)
	{
		ll G,L;
		scanf("%lld%lld",&G,&L);
		ll ans=solve(G,L);//二分
		printf("%lld\n",ans);
	}
	return 0;
}
```
