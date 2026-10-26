---
title: "解题报告 P2839 [国家集训队]middle"
slug: legacy-3450a3220975
tree:
  - "题解"
tags:
  - 线段树
date: 2026-08-15
uid: 99461d06-0dcf-4e69-a59f-d6d85ee8a397
dateKind: collected
---
## P2839 [国家集训队]middle

绝世好题

首先对于求区间 $[l,r]$ 的中位数，有一个套路可以套：

二分一个值 $d$ ，每次将区间内 $<d$ 的点设为 $-1$ ，将 $\ge d$ 的点设为 $1$。当区间和 $\ge 0$ 时 $d$ 值过大或刚好，若 $<0$ 则 $d$ 值过小。

我们继续观察题目。

我们发现，每次询问的区间不固定，但是 $[b+1,c-1]$ 这个区间是必须选择的，所以我们可以先求这个区间的和。

由于我们要最大化中位数，所以我们可以在 $[a,b]$ 中选取最大后缀，在 $[c,d]$ 中选取最大前缀。

将三个区间的和加起来，就是我们要求的和了。

如果我们暴力统计查询，单次查询 $O(nlog\ n)$ 显然过不了，所以要想办法优化。

我们可以对每一个 $d$ 建立一棵线段树同时维护区间和、最大前缀和、最大后缀和，下标维护元素位置。将 $<d$ 的点设为 $-1$ ，将 $\ge d$ 的点设为 $1$，就可以区间查询了。

但是这样干空间会炸，我们还要另想办法。

将序列元素排序我们发现，对两个相邻的 $d$ 值，其构造出来的 " $1,-1$ " 序列只有一处不同。换句话说，它们的线段树只有一条路径不同。

我们可以考虑使用主席树维护，将 $d$ 所在位置的值改成 $-1$ 即可，版本号依据 $d$ 确定。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=2e5+10;

struct node
{
	int lson,rson;
	int sum,lmax,rmax;//和，前缀，后缀
} tree[N*60];

int root[N],tot=0,q[10];

int n,MAX;
int arr[N],v[N];
vector<int> pos[N];

#define lnode tree[node].lson
#define rnode tree[node].rson
#define DEFMID int mid=(start+end)>>1

void push_up(int node)
{
	tree[node].sum=tree[lnode].sum+tree[rnode].sum;//和
	tree[node].lmax=max(tree[lnode].lmax,tree[lnode].sum+tree[rnode].lmax);//前缀和
	tree[node].rmax=max(tree[rnode].rmax,tree[rnode].sum+tree[lnode].rmax);//后缀和
}

int build(int start,int end)
{
	int node=++tot;
	if(start==end)
	{
		tree[node].sum=tree[node].lmax=tree[node].rmax=1;
		return node;
	}
	DEFMID;
	lnode=build(start,mid);
	rnode=build(mid+1,end);
	push_up(node);
	return node;
}

#define lnode1 tree[node1].lson
#define rnode1 tree[node1].rson

int update(int node,int start,int end,int val)
{
	int node1=++tot;
	tree[node1]=tree[node];
	if(start==end)
	{
		tree[node1].lmax=tree[node1].rmax=tree[node1].sum=-1;
		return node1;
	}
	DEFMID;
	if(val<=mid) lnode1=update(lnode,start,mid,val);
	else rnode1=update(rnode,mid+1,end,val);
	push_up(node1);
	return node1;
}

int query1(int node,int start,int end,int l,int r)
{
	if(r<l) return 0;
	if(l<=start&&end<=r) return tree[node].sum;
	DEFMID;
	if(r<=mid) return query1(lnode,start,mid,l,r);
	else if(l>mid) return query1(rnode,mid+1,end,l,r);
	else return query1(lnode,start,mid,l,r)+query1(rnode,mid+1,end,l,r);
}

int query2(int node,int start,int end,int l,int r)//最大前缀和;
{
	if(l<=start&&end<=r) return tree[node].lmax;
	DEFMID;
	if(r<=mid) return query2(lnode,start,mid,l,r);
	else if(l>mid) return query2(rnode,mid+1,end,l,r);
	else
	{
		int t1=query2(lnode,start,mid,l,mid);
		int t2=query1(lnode,start,mid,l,mid)+query2(rnode,mid+1,end,mid+1,r);
		return max(t1,t2);
	}
}

int query3(int node,int start,int end,int l,int r)
{
	if(l<=start&&end<=r) return tree[node].rmax;
	DEFMID;
	if(r<=mid) return query3(lnode,start,mid,l,r);
	else if(l>mid) return query3(rnode,mid+1,end,l,r);
	else
	{
		int t1=query3(rnode,mid+1,end,mid+1,r);
		int t2=query1(rnode,mid+1,end,mid+1,r)+query3(lnode,start,mid,l,mid);
		return max(t2,t1);
	}
}

bool check(int mid)
{
	int a=query1(root[mid],1,n,q[2]+1,q[3]-1);//求和
	int c=query2(root[mid],1,n,q[3],q[4]);//最大前缀和
	int b=query3(root[mid],1,n,q[1],q[2]);//最大后缀和
	return a+b+c>=0;
}

int solve()
{
	int l=1,r=MAX;
	while(l<r)
	{
		int mid=(l+r+1)>>1;
		if(check(mid)) l=mid;
		else r=mid-1;
	}
	return l;
}

int main()
{
	scanf("%d",&n);
	root[0]=build(1,n);
	for(int i=1;i<=n;i++)
	{
		scanf("%d",&arr[i]);
		v[i]=arr[i];
	}
	sort(v+1,v+1+n);
	MAX=unique(v+1,v+1+n)-v-1;
	for(int i=1;i<=n;i++)
	{
		arr[i]=lower_bound(v+1,v+1+n,arr[i])-v;
		pos[arr[i]].push_back(i);
	}
	for(int i=1;i<=MAX;i++)//构建主席树
	{
		root[i]=root[i-1];
		for(int j=0;j<pos[i-1].size();j++)
			root[i]=update(root[i],1,n,pos[i-1][j]);//插入
	}
	int m,ans=0;
	scanf("%d",&m);
	for(int i=1;i<=m;i++)
	{
		for(int t=1;t<=4;t++) scanf("%d",q+t);
		for(int t=1;t<=4;t++) q[t]=(q[t]+ans)%n+1;//我们的下标从1开始
		sort(q+1,q+5);
		ans=v[solve()];
		printf("%d\n",ans);
	}
	return 0;
}

```
