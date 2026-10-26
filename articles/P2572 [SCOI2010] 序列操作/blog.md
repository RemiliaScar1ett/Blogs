---
title: "P2572 [SCOI2010] 序列操作"
slug: legacy-df46e21d44a1
tree:
  - "题解"
tags:
  - 线段树
date: 2026-08-15
uid: 320f9da4-c27d-437b-8b48-5c1d0f18bdee
dateKind: collected
---
##  P2572 [SCOI2010] 序列操作

线段树。

首先对于一个区间，我们需要存储 $8$ 个量来保证算出答案：$1$ 的个数，$0$ 的个数，最左边连续 $1/0$ 个数，最右边连续 $1/0$ 个数，区间内最长连续 $1/0$ 个数。

可以如下定义一个节点：

```cpp
struct node
{
	int cnt1,cnt0,ls1,ls0,rs1,rs0,ss1,ss0;
	/*1 的个数，0 的个数，最左边连续 1/0 个数，最右边连续 1/0 个数，区间内最长连续 1/0 个数*/
	int lson,rson;//左右节点位置。

#define lnode tree[node].lson
#define rnode tree[node].rson

	void init()
	{
		cnt1=cnt0=ls1=ls0=rs1=rs0=ss1=ss0=lson=rson=0;
	}
	void modf(int x)//区间赋值 x=(1,0)
	{
		int len=(cnt1+cnt0>0)?(cnt1+cnt0):1;
		if(x==1)
		{
			cnt1=ss1=ls1=rs1=len;
			cnt0=ss0=ls0=rs0=0;
		}
		if(x==0)
		{
			cnt1=ss1=ls1=rs1=0;
			cnt0=ss0=ls0=rs0=len;
		}
	}
	void rev()//区间取反
	{
		swap(cnt1,cnt0); swap(ls1,ls0); swap(rs1,rs0); swap(ss1,ss0);
	}
} tree[N<<3];
```

然后对于两个修改操作：区间赋值和区间翻转。

我们设两个 $lazytag$：$tag1$ 和 $tag2$。容易发现区间赋值操作会覆盖掉区间翻转。那么如何解决这个情况呢？

赋值的优先级比区间翻转高，那么我们每次涉及到赋值操作 (包括下推 $lazytag$ ) 的时候就将对应区间的 $tag2$ 清空，这也决定了我们会优先下推 $tag1$。

于是两个修改操作以及 `Pushdown` 函数的代码如下：

```cpp
int tag1[N<<3],tag2[N<<3];//区间赋值(-1,0,1)，区间取反 (0,1)
void push_down(int node,int start,int end)
{
	if(~tag1[node])//赋值
	{
		tag1[lnode]=tag1[rnode]=tag1[node];
		tree[lnode].modf(tag1[node]),tree[rnode].modf(tag1[node]);
		tag2[lnode]=0; tag2[rnode]=0;
		tag1[node]=-1;
	}
	if(tag2[node])//取反/如果一个节点同时有取反和赋值，一定是先赋值再取反
	{
		tag2[lnode]^=1; tag2[rnode]^=1;
		tag2[node]=0;
		tree[lnode].rev(); tree[rnode].rev();
	}
}
void modf0(int node,int start,int end,int l,int r,int x)//赋值
{
	if(l<=start&&end<=r)
	{
		tag1[node]=x;tag2[node]=0;//赋值会把节点的翻转标记覆盖掉
		tree[node].modf(x);
		return ;
	}
	int mid=start+end>>1;
	push_down(node,start,end);
	if(l<=mid) modf0(lnode,start,mid,l,r,x);
	if(r>mid) modf0(rnode,mid+1,end,l,r,x);
	push_up(node,start,end);
}

void modf2(int node,int start,int end,int l,int r)//翻转
{
	if(l<=start&&end<=r)
	{
		tag2[node]^=1;
		tree[node].rev();
		return ;
	}
	int mid=start+end>>1;
	push_down(node,start,end);
	if(l<=mid) modf2(lnode,start,mid,l,r);
	if(r>mid) modf2(rnode,mid+1,end,l,r);
	push_up(node,start,end);
}

```

然后是查询操作，第一个自不必说，对于第二个操作，一个节点的答案应该有以下三部分中选择：左子节点的最大连续段长度，右子节点的最大连续段长度，跨越两个子节点的最大连续段。

实现：
```cpp
int query2(int node,int start,int end,int l,int r)
{
	if(r<start||l>end) return 0;
	if(l<=start&&end<=r) return tree[node].ss1;
	int mid=(start+end)>>1;
	push_down(node,start,end);
	int ans=0;
	if(l<=mid) ans=max(ans,query2(lnode,start,mid,l,r));
	if(r>mid) ans=max(ans,query2(rnode,mid+1,end,l,r));
	if(l<=mid&&r>mid&&lnode&&rnode)
		ans=max(ans,min(tree[lnode].rs1,mid-l+1)+min(tree[rnode].ls1,r-mid));//区间内最大与区间间最大
	push_up(node,start,end);
	return ans;
}
```

完整代码
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=2e5+10;

int n,m;
int arr[N];

struct node
{
	int cnt1,cnt0,ls1,ls0,rs1,rs0,ss1,ss0;
	/*1 的个数，0 的个数，最左边连续 1/0 个数，最右边连续 1/0 个数，区间内最长连续 1/0 个数*/
	int lson,rson;//左右节点位置。

#define lnode tree[node].lson
#define rnode tree[node].rson

	void init()
	{
		cnt1=cnt0=ls1=ls0=rs1=rs0=ss1=ss0=lson=rson=0;
	}
	void modf(int x)//区间赋值 x=(1,0)
	{
		int len=(cnt1+cnt0>0)?(cnt1+cnt0):1;
		if(x==1)
		{
			cnt1=ss1=ls1=rs1=len;
			cnt0=ss0=ls0=rs0=0;
		}
		if(x==0)
		{
			cnt1=ss1=ls1=rs1=0;
			cnt0=ss0=ls0=rs0=len;
		}
	}
	void rev()//区间取反
	{
		swap(cnt1,cnt0); swap(ls1,ls0); swap(rs1,rs0); swap(ss1,ss0);
	}
} tree[N<<3];
int ntot=0,root=0;

int tag1[N<<3],tag2[N<<3];//区间赋值(-1,0,1)，区间取反 (0,1)


void push_up(int node,int start,int end)
{
	int mid=(start+end)>>1;
	int llen=mid-start+1,rlen=end-mid;
	tree[node].cnt0=tree[lnode].cnt0+tree[rnode].cnt0;
	tree[node].cnt1=tree[lnode].cnt1+tree[rnode].cnt1;
	tree[node].ls0=(tree[lnode].ls0<llen?tree[lnode].ls0:llen+tree[rnode].ls0);
	tree[node].ls1=(tree[lnode].ls1<llen?tree[lnode].ls1:llen+tree[rnode].ls1);
	tree[node].rs0=(tree[rnode].rs0<rlen?tree[rnode].rs0:rlen+tree[lnode].rs0);
	tree[node].rs1=(tree[rnode].rs1<rlen?tree[rnode].rs1:rlen+tree[lnode].rs1);
	tree[node].ss1=max(tree[lnode].rs1+tree[rnode].ls1,max(tree[lnode].ss1,tree[rnode].ss1));
	tree[node].ss0=max(tree[lnode].rs0+tree[rnode].ls0,max(tree[lnode].ss0,tree[rnode].ss0));
}

void push_down(int node,int start,int end)
{
	if(~tag1[node])//赋值
	{
		tag1[lnode]=tag1[rnode]=tag1[node];
		tree[lnode].modf(tag1[node]),tree[rnode].modf(tag1[node]);
		tag2[lnode]=0; tag2[rnode]=0;
		tag1[node]=-1;
	}
	if(tag2[node])//取反/如果一个节点同时有取反和赋值，一定是先赋值再取反
	{
		tag2[lnode]^=1; tag2[rnode]^=1;
		tag2[node]=0;
		tree[lnode].rev(); tree[rnode].rev();
	}
}

void build(int &node,int start,int end)
{
	if(!node)
	{
		node=++ntot;
		tag1[ntot]=-1;
		tree[ntot].init();
		tag1[node]=-1;
	}
	if(start==end)
	{
		tree[node].modf(arr[start]);
		return ;
	}
	int mid=(start+end)>>1;
	build(lnode,start,mid);
	build(rnode,mid+1,end);
	push_up(node,start,end);
	return ;
}

void modf0(int node,int start,int end,int l,int r,int x)//赋值
{
	if(l<=start&&end<=r)
	{
		tag1[node]=x;tag2[node]=0;//赋值会把节点的翻转标记覆盖掉
		tree[node].modf(x);
		return ;
	}
	int mid=start+end>>1;
	push_down(node,start,end);
	if(l<=mid) modf0(lnode,start,mid,l,r,x);
	if(r>mid) modf0(rnode,mid+1,end,l,r,x);
	push_up(node,start,end);
}

void modf2(int node,int start,int end,int l,int r)//翻转
{
	if(l<=start&&end<=r)
	{
		tag2[node]^=1;
		tree[node].rev();
		return ;
	}
	int mid=start+end>>1;
	push_down(node,start,end);
	if(l<=mid) modf2(lnode,start,mid,l,r);
	if(r>mid) modf2(rnode,mid+1,end,l,r);
	push_up(node,start,end);
}

int query1(int node,int start,int end,int l,int r)
{
	if(r<start||l>end) return 0;
	if(l<=start&&end<=r) return tree[node].cnt1;
	int mid=start+end>>1;
	push_down(node,start,end);
	int sum=0;
	if(l<=mid) sum+=query1(lnode,start,mid,l,r);
	if(r>mid) sum+=query1(rnode,mid+1,end,l,r);
	push_up(node,start,end);
	return sum;
}

int query2(int node,int start,int end,int l,int r)
{
	if(r<start||l>end) return 0;
	if(l<=start&&end<=r) return tree[node].ss1;
	int mid=(start+end)>>1;
	push_down(node,start,end);
	int ans=0;
	if(l<=mid) ans=max(ans,query2(lnode,start,mid,l,r));
	if(r>mid) ans=max(ans,query2(rnode,mid+1,end,l,r));
	if(l<=mid&&r>mid&&lnode&&rnode)
		ans=max(ans,min(tree[lnode].rs1,mid-l+1)+min(tree[rnode].ls1,r-mid));//区间内最大与区间间最大
	push_up(node,start,end);
	return ans;
}

#undef lnode
#undef rnode

void pos()
{
	for(int i=1;i<=n;i++)
		printf("%d ",query1(root,1,n,i,i));
	printf("\n");
}

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=n;i++) scanf("%d",&arr[i]);
	build(root,1,n);
	for(int i=1;i<=m;i++)
	{
		int x,l,r;
		scanf("%d%d%d",&x,&l,&r);
		l++,r++;
		if(x==0) modf0(root,1,n,l,r,0);
		if(x==1) modf0(root,1,n,l,r,1);
		if(x==2) modf2(root,1,n,l,r);
		if(x==3) printf("%d\n",query1(root,1,n,l,r));
		if(x==4) printf("%d\n",query2(root,1,n,l,r));
	}
	return 0;
}

```
