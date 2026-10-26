---
title: "线段树合并"
slug: legacy-e9d739bb70ad
tree:
  - "笔记"
  - "数据结构"
tags:
  - 数据结构
  - 线段树
date: 2026-08-15
uid: de1b24ae-35f7-4ecf-9d94-9cea4c39ba75
dateKind: collected
---
# 线段树合并

前置芝士->[线段树进阶 —— 权值线段树与动态开点](https://www.cnblogs.com/IzayoiMiku/p/13997750.html)

我们有时需要将两棵线段树合并成一棵，维护这两个线段树各自所维护集合的并集的信息。

比如 [P4556 雨天的尾巴](https://www.luogu.com.cn/problem/P4556) 我们要是对每个点建立一颗线段树，就要在树上差分的基础上进行线段树。

我们就以[P4556 雨天的尾巴](https://www.luogu.com.cn/problem/P4556)为例题，看看动态开点线段树的合并操作。

先说说这个题的思路吧。

观察题意，我们发现，树形结构区间加法操作，要么树剖要么树上差分。

我们选择树上差分，将每次加法操作 $(x,y,z)$ 拆为 $(x,lca(x,y),z),(y,lca(x,y),z)$ ，

我们能够得到差分方式:

$diff[x][z]+1\ ,\ diff[y][z]+1\ ,\\\ \\diff[lca(x,y)][z]-1\ ,\ diff[\ fa[lca(x,y)]\ ][z]-1$

单点询问从叶子结点向上累加即可。

为了方便统计答案，我们将二维数组变为动态开点权值线段树。问题就变为了如何高效地合并两棵线段树的所有信息。

我们考虑两个线段树合并，实际上只需要合并它们的叶子节点的信息，非叶子结点都可以通过线段树`push_up`操作推算出来，也就是说，我们可以使用类似修改和查询那样递归到叶子结点，合并信息后逐层向上推断。显然的是，我们每次合并都会抛弃其中一棵树。

我们可以得到如下函数(在动态开点线段树基础上)
```cpp
#define DEFMID int mid=start+end>>1
#define lnode tree[node].lson
#define rnode tree[node].rson
#define lnode1 tree[node1].lson
#define rnode1 tree[node1].rson

int Merge(int node,int node1,int start,int end)
{
	if(!node||!node1) return node|node1;
	if(start==end)
	{
		/*合并叶节点信息*/
		return node;
	}
	DEFMID;
	lnode=Merge(lnode,lnode1,start,mid);
	rnode=Merge(rnode,rnode1,mid+1,end);
	push_up(node);
	return node;
}

```

合并均摊复杂度 $O(log\ n)$

对于这个题，由于我们不会再在任意一次合并之后有新的节点建立，所以空间没有浪费。

但是有的题会。而我们在抛弃一棵树时其节点也弃置不用了，但是每次线段树插入时都新建节点，会造成空间的浪费，此时我们可以采用回收站优化空间。

回收站所需数组，函数，及改造过的`Merge`函数
```cpp
int root[N*2],nodetot=0,rabb[N*60],rabcnt=0;
/*root[]为各个线段树的根，nodetot为新建的总结点数，
rabb[]存弃置不用的节点编号，rabcnt为弃置不用节点的数目*/

int New()//新建一个节点时调用，返回新建的节点编号
{
	if(rabcnt>0) return rabb[rabcnt--];
	else {tree[++nodetot]={0,0,0,0}; return nodetot;}
}

void Del(int &node)//删除一个节点
{
	tree[node]={0,0,0,0};
	rabb[++rabcnt]=node; node=0;
}

/*这里使用了传引用的写法*/
void Merge(int &node,int &node1,int start,int end)
{
	if(!node) {node=node1; return ;}
	if(!node1) {return ;}
	if(start==end)
	{
		/*合并子节点信息*/
		Del(node1);
		return ;
	}
	DEFMID;
	Merge(lnode,lnode1,start,mid);
	Merge(rnode,rnode1,mid+1,end);
	Del(node1);
	push_up(node);
}
```

若 `rabb` 使用`vector`类而不是数组能够更省内存，也将带来更多的常数。 ~~然而我脑抽了没写~~。

例题完整代码：(不带节点回收)
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=1e5+10,MAX=1e5+10;

struct node
{
	int lson,rson,sum,num;
} tree[N*60];

int root[N*2],nodetot=0;

#define DEFMID int mid=start+end>>1
#define lnode tree[node].lson
#define rnode tree[node].rson

void push_up(int node)
{
	if(tree[lnode].sum>=tree[rnode].sum)
		tree[node].sum=tree[lnode].sum,tree[node].num=tree[lnode].num;
	else tree[node].sum=tree[rnode].sum,tree[node].num=tree[rnode].num;
	if(!tree[node].sum) tree[node].num=0;
}

void update(int &node,int start,int end,int val,int k)
{
	if(!node) node=++nodetot;
	if(start==end)
	{
		tree[node].sum+=k;
		if(tree[node].sum==0) tree[node].num=0;
		else tree[node].num=start;
		return;
	}
	DEFMID;
	if(val<=mid) update(lnode,start,mid,val,k);
	else update(rnode,mid+1,end,val,k);
	push_up(node);
}

#define lnode1 tree[node1].lson
#define rnode1 tree[node1].rson

int Merge(int node,int node1,int start,int end)
{
	if(!node||!node1) return node|node1;
	if(start==end)
	{
		tree[node].sum+=tree[node1].sum;
		if(tree[node].sum==0) tree[node].num=0;
		else tree[node].num=start;
		return node;
	}
	DEFMID;
	lnode=Merge(lnode,lnode1,start,mid);
	rnode=Merge(rnode,rnode1,mid+1,end);
	push_up(node);
	return node;
}

int n,m;
int head[N],ver[N<<1],nxt[N<<1],tot=0;
void add(int x,int y) {ver[++tot]=y; nxt[tot]=head[x]; head[x]=tot;}
int dpt[N],size_[N],top[N];
int fa[N],son[N];

void dfs1(int x,int f)
{
	dpt[x]=dpt[f]+1;
	fa[x]=f;
	size_[x]=1;
	for(int i=head[x];i;i=nxt[i])
	{
		int y=ver[i];
		if(y==f) continue;
		dfs1(y,x);
		size_[x]+=size_[y];
		if(size_[son[x]]<size_[y]) son[x]=y;
	}
}

void dfs2(int x,int t)
{
	top[x]=t;
	if(!son[x]) return ;
	dfs2(son[x],t);
	for(int i=head[x];i;i=nxt[i])
	{
		int y=ver[i];
		if(y==fa[x]||y==son[x]) continue;
		dfs2(y,y);
	}
}

int lca(int x,int y)
{
	while(top[x]!=top[y])
	{
		if(dpt[top[x]]<dpt[top[y]]) swap(x,y);
		x=fa[top[x]];
	}
	if(dpt[x]>dpt[y]) swap(x,y);
	return x;
}

int ans[N];
void dfs3(int x)
{
	for(int i=head[x];i;i=nxt[i])
	{
		int y=ver[i];
		if(y==fa[x]) continue;
		dfs3(y);
		root[x]=Merge(root[x],root[y],1,MAX);

	}
	ans[x]=tree[root[x]].num;
	return ;
}

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<n;i++)
	{
		int a,b;
		scanf("%d%d",&a,&b);
		add(a,b); add(b,a);
	}
	dfs1(1,1);
	dfs2(1,1);
	for(int i=1;i<=m;i++)
	{
		int x,y,z;
		scanf("%d%d%d",&x,&y,&z);
		int LCA=lca(x,y);
		update(root[x],1,MAX,z,1);
		update(root[y],1,MAX,z,1);
		update(root[LCA],1,MAX,z,-1);
		if(fa[LCA]!=LCA) update(root[fa[LCA]],1,MAX,z,-1);
	}
	dfs3(1);
	for(int i=1;i<=n;i++)
		printf("%d\n",ans[i]);
	return 0;
}
```
