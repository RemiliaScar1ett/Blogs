---
title: "P4587 [FJOI2016]神秘数"
slug: legacy-eab367f12c99
tree:
  - "题解"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## P4587 [FJOI2016]神秘数

### 题意简述：

一个可重复数字集合S的神秘数定义为最小的不能被S的子集的和表示的正整数。例如S={1,1,1,4,13}

现给定n个正整数a[1]..a[n]，m个询问，每次询问给定一个区间l,r，求由a[l],a[l+1],…,a[r]所构成的可重复数字集合的神秘数。

---

### 解析

先探究神秘数的有关性质。

假设我们是把数一个一个插入序列中的(这也是主席树的解题过程)

设当前能组成的数的值域为 $[1,x]$ ，要插入的数为 $a_i$

有如下性质:

1. 当 $a_i>x+1$ 时，$x+1$ 不能被组成，故此时神秘数为 $x+1$

2. 当 $a_i<x+1$ 时，能表示的值域变为 $[1,a_i+x]$  。

若每插入一个 $a_i$ 就新增一个版本，那么对于每个版本：

设它的值域为 $[1,x]$，则答案 $ans=x+1$ 。

此时检查小于等于 $ans$ 的所有数的和 $sum$

若 $ans\leq sum$， 则一定有未选的且小于等于 $ans$ 的数。

则令 $ans = res+1$，重复检查。

若 $ans > sum$，则答案就是 $ans$。

这里维护的并不是权值线段树，离散化什么的也不用了。

code :
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e5+10;

struct node
{
	int lson,rson;
	ll _sum;
} tree[N<<5];
int root[N],tot=0;

int n,m;
int ans=0,res=0;

#define lnode tree[node].lson
#define rnode tree[node].rson
#define DEFMID ll mid=start+end>>1;
#define lnode1 tree[node1].lson
#define rnode1 tree[node1].rson

int insert(int node,ll start,ll end,int x)
{
	int node1=++tot;
	tree[node1]=tree[node];
	tree[node1]._sum+=x;
	if(start==end)
	{
		return node1;
	}
	DEFMID
	if(x<=mid) lnode1=insert(lnode,start,mid,x);
	else rnode1=insert(rnode,mid+1,end,x);

	tree[node1]._sum=tree[lnode1]._sum+tree[rnode1]._sum;
	return node1;
}

ll query(int node1,int node,ll start,ll end,ll l,ll r)
{
	if(l<=start&&end<=r) return tree[node1]._sum-tree[node]._sum;
	DEFMID
	ll ans=0;
	if(l<=mid) ans+=query(lnode1,lnode,start,mid,l,r);
	if(r>mid) ans+=query(rnode1,rnode,mid+1,end,l,r);

	return ans;
}

int main()
{
	scanf("%d",&n);
	for(int i=1; i<=n; i++)
	{
		int x;
		scanf("%d",&x);
		root[i]=insert(root[i-1],1,1e9,x);
	}

	scanf("%d",&m);
	for(int i=1; i<=m; i++)
	{
		int l,r;
		scanf("%d%d",&l,&r);
		ans=1;
		while(1)
		{
			res=query(root[r],root[l-1],1,1e9,1,ans);
			if(res>=ans) ans=res+1;
			else break;
		}
		printf("%d\n",ans);
	}
	return 0;
}
```
