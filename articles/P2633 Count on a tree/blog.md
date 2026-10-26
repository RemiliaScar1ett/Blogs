---
title: "P2633 Count on a tree"
slug: legacy-597340712b34
tree:
  - "题解"
tags:
  - 线段树
  - 树上算法
date: 2026-08-15
uid: 6358bbbd-a5f7-47c4-960e-7ed2014c70c0
dateKind: collected
---
## P2633 Count on a tree

这是一道主席树入门题。

当初我们在做线性序列的主席树的时候，用的是前缀和的思想。

我们可以知道主席树是“可减的”数据结构，是能做前缀和操作的。

那么对于这个题，我们使用主席树维护 $1$ 到 $x$ 节点路径上节点的所有信息

根据DFS顺序插点就可以了。

又根据树上差分，得到：$v[x]+v[y]-v[lca(x,y)]-v[fa[lca(x,y)]]$ 即是我们需要查询的区间。

然后写个树剖LCA就好，DFS顺手就可以插点了www反正也没有修改

~~但是由于一个sb错误我还是调了一个晚上+半个上午~~

```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=2e5+10;

struct node
{
	int lson,rson;
	int sum;
} tree[(N<<5)+N*5];
int root[N],tot=0;

int n,m;
int arr[N];

vector<int> disc;
int poi[N];

int head[N],ver[N<<1],nxt[N<<1],_tot=0;
void add(int x,int y)
{
	ver[++_tot]=y;
	nxt[_tot]=head[x];
	head[x]=_tot;
}
int dpt[N],size_[N],top[N],tsp=0;//树剖部分
int fa[N],son[N];
int MAX;

int find(int x)
{
	return lower_bound(disc.begin(),disc.end(),x)-disc.begin();
}

#define lnode tree[node].lson
#define rnode tree[node].rson
#define DEF_MID int mid=start+end>>1

int build(int start,int end)
{
	int node=++tot;
	if(start==end) return node;
	DEF_MID;
	lnode=build(start,mid);
	rnode=build(mid+1,end);

	return rnode;
}

#define lnode1 tree[node1].lson
#define rnode1 tree[node1].rson

int insert(int node,int start,int end,int x)
{
	int node1=++tot;
	tree[node1]=tree[node];
	if(start==end)
	{
		tree[node1].sum++;
		return node1;
	}
	DEF_MID;
	if(x<=mid) lnode1=insert(lnode,start,mid,x);
	else rnode1=insert(rnode,mid+1,end,x);

	tree[node1].sum=tree[lnode1].sum+tree[rnode1].sum;
	return node1;
}

#define lnode2 tree[node2].lson
#define rnode2 tree[node2].rson
#define lnode3 tree[node3].lson
#define rnode3 tree[node3].rson

int query(int node,int node1,int node2,int node3,int start,int end,int k)
/*端点版本-LCA版本-LCA父亲版本*/
{
	if(start==end) return start;
	int tmp=tree[lnode].sum+tree[lnode1].sum-tree[lnode2].sum-tree[lnode3].sum;/*万恶之源*/
	DEF_MID;
	if(k<=tmp) return query(lnode,lnode1,lnode2,lnode3,start,mid,k);
	else return query(rnode,rnode1,rnode2,rnode3,mid+1,end,k-tmp);
}

void dfs1(int x,int f)
{
	root[x]=insert(root[f],0,MAX,poi[x]);
	dpt[x]=dpt[f]+1;
	size_[x]=1;
	fa[x]=f;
	for(int i=head[x]; i; i=nxt[i])
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
	for(int i=head[x]; i; i=nxt[i])
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

int query_path(int x,int y,int k)
{
	int LCA=lca(x,y);
	int ans=query(root[x],root[y],root[LCA],root[fa[LCA]],0,MAX,k);
	return disc[ans];
}

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1; i<=n; i++)
	{
		scanf("%d",arr+i);
		disc.push_back(arr[i]);
	}

	sort(disc.begin(),disc.end());
	disc.erase(unique(disc.begin(),disc.end()),disc.end());
	MAX=disc.size()-1;
	for(int i=1; i<=n; i++)
		poi[i]=find(arr[i]);

	root[0]=build(0,MAX);

	for(int i=1; i<n; i++)
	{
		int x,y;
		scanf("%d%d",&x,&y);
		add(x,y);
		add(y,x);
	}

	dfs1(1,0);
	dfs2(1,1);

	int last_ans=0;
	for(int i=1; i<=m; i++)
	{
		int x,y,k;
		scanf("%d%d%d",&x,&y,&k);
		printf("%d\n",last_ans=query_path(x^last_ans,y,k));
	}
}
```
