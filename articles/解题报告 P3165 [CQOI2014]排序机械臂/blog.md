---
title: "解题报告 P3165 [CQOI2014]排序机械臂"
slug: legacy-9d9ea60791da
tree:
  - "题解"
tags:
  - "旧文迁移"
date: 2026-08-15
---
# P3165 [CQOI2014]排序机械臂

区间翻转？第一反应Splay

~~wtcl 不会FHQtreap~~

观察题意，题目让我们依次输出第 $k$ 大所在位置 $p_k$ 并将 $[k,p_k]$ 翻转。并且我们自始至终只关心位置。所以我们可以按照高度排序，从最小的依次找起。我们将最初始的序列元素依次编号 $1,2,3 \cdots$，问题就变成了如何在区间中查找第 $k$ 号元素，带翻转操作。

我们利用 Splay 的中序遍历维护区间， Splay 的旋转操作不会改变其中序序列。然后当我们查询第 $i$ 号元素时，我们就将 $i$ 转到根，此时根据平衡树的性质，它的左子树大小 $+1$ 就是答案。翻转操作请参考~~照搬~~[P3391 【模板】文艺平衡树
](https://www.luogu.com.cn/problem/P3391)。

总之，是一道不错的 Splay 练手题。~~并且你还可以多做几遍以提高熟练度(指多倍经验~~

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=1e5+10,INF=1e8+10;

struct node
{
	int s[2],p,v;
	int size,flag;

	void init(int _v)
	{
		v=_v;
		size=1; flag=0;
	}
} tree[N];

int root,idx=0;

int n;
struct pak
{
	int x,no;
} poi[N];

bool cmp(pak a,pak b)
{
	if(a.x==b.x) return a.no<b.no;
	else return a.x<b.x;
}

inline int ls(int x){return tree[x].s[0];}
inline int rs(int x){return tree[x].s[1];}

void push_up(int x)
{
	if(!x) return;
	tree[x].size=tree[ls(x)].size+tree[rs(x)].size+1;
}

void push_down(int x)
{
	if(!tree[x].flag) return ;
	swap(tree[x].s[0],tree[x].s[1]);
	if(ls(x)) tree[ls(x)].flag^=1;
	if(rs(x)) tree[rs(x)].flag^=1;
	tree[x].flag=0;
}

int build(int l,int r)//严格对照中序遍历的方式建树
{
	int mid=l+r>>1;
	int la=0,ra=0;
	if(l<mid) la=build(l,mid-1);
	int u=++idx;
	tree[u].init(poi[mid].x);
	if(r>mid) ra=build(mid+1,r);
	tree[u].s[1]=ra; tree[u].s[0]=la;
	tree[ls(u)].p=tree[rs(u)].p=u;
	push_up(u);
	return u;
}

void rotate(int x)
{
	int y=tree[x].p, z=tree[y].p;
	int k=tree[y].s[1]==x;

	tree[z].s[tree[z].s[1]==y]=x;
	tree[x].p=z;

	tree[y].s[k]=tree[x].s[k^1];
	tree[tree[x].s[k^1]].p=y;

	tree[x].s[k^1]=y; tree[y].p=x;
	push_up(y), push_up(x);
}

void splay(int x,int k)
{
	while(tree[x].p!=k)
	{
		int y=tree[x].p,z=tree[y].p;
		push_down(z); push_down(y); push_down(x);
		if(z!=k)
		{
			if((tree[y].s[1]==x)^(tree[z].s[1]==y)) rotate(x);
			else rotate(y);
		}
		rotate(x);
	}
	if(!k) root=x;
}

int get_k(int k)
{
	int u=root;
	while(1)
	{
		push_down(u);
		if(tree[tree[u].s[0]].size>=k) u=tree[u].s[0];
		else if(tree[tree[u].s[0]].size+1==k) return u;
		else k-=tree[tree[u].s[0]].size+1,u=tree[u].s[1];
	}
	return -1;
}

int main()
{
	scanf("%d",&n);
	for(int i=1;i<=n;i++)
	{
		scanf("%d",&poi[i].x);
		poi[i].no=i;
	}
	poi[0].x=-INF,poi[0].no=1;
	poi[n+1].x=INF,poi[n+1].no=n+1;
	sort(poi+1,poi+1+n,cmp);
	root=build(0,n+1);//建树无所谓在哪里，我们只关心某棵子树的左子树
	for(int i=1;i<n;i++)
	{
		splay(poi[i].no+1,0);//记得加上哨兵节点
		int s=tree[tree[root].s[0]].size;//答案也要减去哨兵
		printf("%d ",s);
		int l=get_k(i),r=get_k(s+2);
		splay(l,0); splay(r,l);
		tree[tree[r].s[0]].flag^=1;
	}
	printf("%d",n);
	return 0;
}

```
