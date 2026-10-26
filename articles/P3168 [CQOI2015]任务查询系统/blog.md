---
title: "P3168 [CQOI2015]任务查询系统"
slug: legacy-67bdafde594d
tree:
  - "题解"
tags:
  - 线段树
date: 2026-08-15
uid: aca4a9b1-d4af-4645-bc9c-e29bf121600a
dateKind: collected
---
## P3168 [CQOI2015]任务查询系统

**核心思路：主席树**

这是个主席树模板题~~但我还是做了一个下午~~

题目可以抽象为求覆盖在 $x_i$ 上的 $k$ 小值和。区间修改，单点查询。

但是前面也提到过，主席树区间修改是很耗费时间的，所以我们考虑维护一个差分数组。

这样就区间修改转化为两个单点修改，查询变成了区间查询。

然后就是板子了......

注意 `query` 函数在 `start==end` 的情况下不能直接返回 `tree[node].sum_` 而要返回 `(tree[node].sum_/tree[node].c_*k)`

~~我也不知道为什么但是改了就过了~~

code ：
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<int,int> PII;

const int N=1e5+10;

struct node
{
	int lson,rson;
	ll sum_,c_;
} tree[N*44];
int root[N],tot=0;

int n,m;
PII arr[N<<1];
int poi[N];

#define lnode tree[node].lson
#define rnode tree[node].rson
#define DEFMID int mid=start+end>>1

int build(int start,int end)
{
	int node=++tot;
	if(start==end) return node;
	DEFMID;
	lnode=build(start,mid);
	rnode=build(mid+1,end);

	return node;
}

#define lnode1 tree[node1].lson
#define rnode1 tree[node1].rson

int update(int node,int start,int end,int val,int k)//k判断删去或添加
{
	int node1=++tot;
	tree[node1]=tree[node];
	if(start==end)
	{
		tree[node1].c_+=k;
		tree[node1].sum_+=k*poi[val];
		return node1;
	}
	DEFMID;
	if(val<=mid) lnode1=update(lnode,start,mid,val,k);
	else rnode1=update(rnode,mid+1,end,val,k);

	tree[node1].sum_=tree[lnode1].sum_+tree[rnode1].sum_;
	tree[node1].c_=tree[lnode1].c_+tree[rnode1].c_;

	return node1;
}

int query(int node,int start,int end,int k)
{
	if(start==end) return tree[node].sum_/tree[node].c_*k;
	DEFMID;
	if(k<=tree[lnode].c_) return query(lnode,start,mid,k);
	else return tree[lnode].sum_+query(rnode,mid+1,end,k-tree[lnode].c_);
}

#define x_ first
#define y_ second

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1; i<=n; i++)
	{
		int p=(i<<1)-1,q=(i<<1);//把修改分为两部分
		scanf("%d%d%d",&arr[p].x_,&arr[q].x_,&arr[p].y_);
		arr[q].x_++;//区间终点的修改在x+1
		arr[q].y_=-arr[p].y_;//删去处理
		poi[i]=arr[p].y_;//准备离散化
	}
	sort(poi+1,poi+1+n);
	int max_=unique(poi+1,poi+1+n)-poi-1;
	sort(arr+1,arr+1+(n<<1));
	root[0]=build(1,max_);//主席树维护差分数组
	int kk=1;
	for(int i=1; i<=(n<<1); i++)
	{
		while(kk<arr[i].x_)
		{
			root[kk+1]=root[kk];
			kk++;
		}
		if(kk==n+1) break;
		int x=lower_bound(poi+1,poi+1+max_,abs(arr[i].y_))-poi;
		root[kk]=update(root[kk],1,max_,x,arr[i].y_>0?1:-1);
	}
	ll pre=1;
	for(int i=1; i<=m; i++)
	{
		int x,ai_,bi_,ci_;
		scanf("%d%d%d%d",&x,&ai_,&bi_,&ci_);
		ll k=((ll)ai_*pre+bi_)%ci_+1;     //三年OI一场空，不开long long见祖宗
		if(tree[root[x]].c_<=k) printf("%lld\n",pre=tree[root[x]].sum_);//特判不够的情况
		else printf("%lld\n",pre=query(root[x],1,max_,k));
	}
	return 0;
}
```
