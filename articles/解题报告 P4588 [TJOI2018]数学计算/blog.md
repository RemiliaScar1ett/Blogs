---
title: "解题报告 P4588 [TJOI2018]数学计算"
slug: legacy-17d1e4be789f
tree:
  - "题解"
tags:
  - "旧文迁移"
date: 2026-08-15
---
# P4588 [TJOI2018]数学计算

一道不错的线段树练手题。

我们开一棵线段树，下标维护操作次序，节点值即是对应区间的积

设当前操作是第 $i$ 次操作。

每次操作 $1$ 我们都把 $i$ 对应叶节点的值改为 $m$ 。然后查询 $[1,i]$ 的乘积。

每次操作 $2$ 我们都把 $pos$ 对应的叶节点的值改为 $1$ ，然后查询 $[1,i]$ 的乘积。

记得初始化为 $1$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e6+10;

ll tree[N<<2];

#define lnode node<<1
#define rnode node<<1|1
#define DEFMID int mid=(start+end)>>1

ll Q,M;

void push_up(int node)
{
	tree[node]=tree[lnode]*tree[rnode]%M;
}

void build(int node,int start,int end)
{
	if(start==end)
	{
		tree[node]=1;
		return ;
	}
	DEFMID;
	build(lnode,start,mid);
	build(rnode,mid+1,end);
	push_up(node);
	return ;
}

void update(int node,int start,int end,int pos,ll val)
{
	if(start==end) {tree[node]=val; return ;}
	DEFMID;
	if(pos<=mid) update(lnode,start,mid,pos,val);
	else update(rnode,mid+1,end,pos,val);
	push_up(node);
	return;
}

ll query(int node,int start,int end,int l,int r)
{
	if(end<l||start>r) return 1;
	if(l<=start&&end<=r) return tree[node]%M;

	DEFMID;
	ll res=1;
	res=(res%M)*query(lnode,start,mid,l,r)%M;
	res=(res%M)*query(rnode,mid+1,end,l,r)%M;
	push_up(node);
	return (res%M+M)%M;
}

int main()
{
	int t;
	scanf("%d",&t);
	while(t--)
	{
		scanf("%lld%lld",&Q,&M);
		build(1,1,Q+10);
		for(int i=1;i<=Q;i++)
		{
			int opt,k;
			scanf("%d%d",&opt,&k);
			if(opt==1)
			{
				update(1,1,Q+10,i,k);
				ll res=query(1,1,Q+10,1,i);
				printf("%lld\n",res);
			}
			else
			{
				update(1,1,Q+10,k,1); update(1,1,Q+10,i,1);
				ll res=query(1,1,Q+10,1,i);
				printf("%lld\n",res);
			}
		}
	}
	return 0;
}
```
