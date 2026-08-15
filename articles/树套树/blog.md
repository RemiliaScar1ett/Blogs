---
title: "树套树"
slug: legacy-a346dbe5c7ff
tree:
  - "笔记"
  - "数据结构"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## 树套树

这玩意没什么新东西，就是树里面再套树，但是码量极大，及其难调。

树套树本身也不是一种特定的数据结构，它是一种思想，将两个树套一起的思想。

----

具体怎么回事？

比如我们用线段树维护一个序列。这个线段树的每个节点都代表着一段子序列，我们**对每个节点再开一棵**平衡树维护这个序列，那么这个杂合子数据结构就叫 “线段树套平衡树”。

树套树分**外层树**和**内层树**。

**外层树**，就是最外面的的那颗树，它的每个节点都有一棵内层树维护。常见的一般用线段树，树状数组。

**内层树**，单独维护外层树各个节点信息的树。一般是某种平衡树。~~大部分时候我们可以直接用 STL~~。

从定义上讲，你可以随便抓两个树套在一起。

这玩意真没啥新定义，所以我们以题目为纲，看一下这个东西的思想方法。

---

##例题

### 树套树-Lite

2s/64M

请你写出一种数据结构，来维护一个长度为 $n$ 的序列，其中需要提供以下操作：

1. `1 pos x`，将 $pos$ 位置的数修改为 $x$。
2. `2 l r x`，查询整数 $x$ 在区间 $[l,r]$ 内的前驱(前驱定义为小于 $x$，且最大的数)。
数列中的位置从左到右依次标号为 $1∼n$。

区间 $[l,r]$ 表示从位置 $l$ 到位置 $r$ 之间（包括两端点）的所有数字。

区间内排名为 $k$ 的值指区间内从小到大排在第 $k$ 位的数值。（位次从 $1$ 开始）

#### 输入格式
第一行包含两个整数 $n,m$，表示数列长度以及操作次数。

第二行包含 $n$ 个整数，表示有序数列。

接下来 $m$ 行，每行包含一个操作指令，格式如题目所述。

#### 输出格式
对于所有操作 $2$，每个操作输出一个查询结果，每个结果占一行。

#### 数据范围
$1≤n,m≤5×10^4,\\
1≤l≤r≤n,\\
1≤pos≤n,\\
0≤x≤10^8,$

有序数列中的数字始终满足在 $[0,10^8]$ 范围内，
数据保证所有操作一定合法，所有查询一定有解。

#### 输入样例：
```
5 3
3 4 2 1 5
2 2 4 4
1 3 5
2 2 4 4
```
#### 输出样例：
```
2
1
```
#### 解析

求区间内前驱，带修。

我们先从查询入手。

如果没有区间限制，我们可以迅速地利用 STL 中的 `set` 中的 `lower_bound\upper_bound` 得到答案。

而考虑到，$x$ 的前驱是指 “$<x$ 的最大的数”，是一个带有最大值属性的值。

而最大值一般是可以合并的。或者就题而言，设已知 $[l,r]$ 内 $x$ 的前驱为 $p$，则对于  $\forall \{[a,b]\ |\ [l,r]\subset [a,b]\}$ ，都有 $x$ 在 $[a,b]$ 的前驱 $q\ge p$。并且，由于 $q\in [a,b]$ 所以 $q$ 也一定是某个子区间内 $x$ 的前驱。我们只需要利用线段树将整个区间分成几个零区间，每个区间单独求前驱 ，然后再将答案合并。

每一个区间内部求就比较简单了。直接套 `set` 即可。

再来说修改。

修改仍然是如同线段树一逐层修改。由于单点修改，我们每一层有且只有一个区间会被修改到。所以修改的次数复杂度和树的高度复杂度一样，都是 $O(\log n)$

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=5e5+10,INF=1e8;

struct Node
{
	int l,r;
	multiset<int> s;//set(本质平衡树)维护当前的区间
} tree[N<<2];

int n,m;
int w[N];

#define lnode node<<1
#define rnode node<<1|1

void build(int node,int start,int end)//建树
{
	tree[node].l=start,tree[node].r=end;
	tree[node].s.insert(-INF),tree[node].s.insert(INF);//插入哨兵节点
	for(int i=start;i<=end;i++) tree[node].s.insert(w[i]);//将区间内的数逐个插入
	if(start==end) return ;
	int mid=start+end>>1;
	build(lnode,start,mid);
	build(rnode,mid+1,end);
}

void update(int node,int pos,int x)
{
	tree[node].s.erase(tree[node].s.find(w[pos]));//先将这个位置的数字删去
	tree[node].s.insert(x);//再插入我们想要的数字
	if(tree[node].l==tree[node].r) return ;
	int mid=tree[node].l+tree[node].r>>1;
	if(pos<=mid) update(lnode,pos,x);
	else update(rnode,pos,x);
}

int query(int node,int l,int r,int x)
{
	if(l<=tree[node].l&&tree[node].r<=r)//找对区间
	{
		auto its=tree[node].s.lower_bound(x);
		--its;//迭代器直接写了 auto，原本的迭代器名称又长又臭
		return *its;
	}
	int mid=tree[node].l+tree[node].r>>1,res=-INF;
	if(l<=mid) res=max(res,query(lnode,l,r,x));
	if(r>mid) res=max(res,query(rnode,l,r,x));
	return res;
}

int main()
{
	int n,m;
	scanf("%d%d",&n,&m);
	for(int i=1;i<=n;i++) scanf("%d",&w[i]);
	build(1,1,n);
	for(int i=1;i<=m;i++)
	{
		int opt;
		scanf("%d",&opt);
		if(opt==1)
		{
			int pos,x;
			scanf("%d%d",&pos,&x);
			update(1,pos,x);
			w[pos]=x;//将原数列中的数也要修改掉
		}
		if(opt==2)
		{
			int l,r,x;
			scanf("%d%d%d",&l,&r,&x);
			int ans=query(1,l,r,x);
			printf("%d\n",ans);
		}
	}
	return 0;
}
```

很多时候真的没必要自己手写平衡树，STL 有的东西还是挺优秀的，并且还省下来大量的调试时间。

### 『模板』树套树

4s/128M

真的模板来了。

请你写出一种数据结构，来维护一个长度为 $n$ 的数列，其中需要提供以下操作：

1. `l r x`，查询整数 $x$ 在区间 $[l,r]$ 内的排名。
2. `l r k`，查询区间 $[l,r]$ 内排名为 $k$ 的值。
3. `pos x`，将 $pos$ 位置的数修改为 $x$。
4. `l r x`，查询整数 $x$ 在区间 $[l,r]$ 内的前驱(前驱定义为小于 $x$，且最大的数)。
5. `l r x`，查询整数 $x$ 在区间 $[l,r]$ 内的后继(后继定义为大于 $x$，且最小的数)。
数列中的位置从左到右依次标号为 $1\sim n$。

区间 $[l,r]$ 表示从位置 $l$ 到位置 $r$ 之间（包括两端点）的所有数字。

区间内排名为 $k$ 的值指区间内从小到大排在第 $k$ 位的数值。（位次从 $1$ 开始）

#### 输入格式
第一行包含两个整数 $n,m$，表示数列长度以及操作次数。

第二行包含 $n$ 个整数，表示有序数列。

接下来 $m$ 行，每行包含一个操作指令，格式如题目所述。

#### 输出格式
对于所有操作 $1,2,4,5$，每个操作输出一个查询结果，每个结果占一行。

#### 数据范围
$1≤n,m≤5×10^4,\\
1≤l≤r≤n,\\
1≤pos≤n,\\
1≤k≤r−l+1,\\
0≤x≤10^8,$

有序数列中的数字始终满足在 $[0,10^8]$ 范围内，
数据保证所有操作一定合法，所有查询一定有解。

#### 输入样例：
```
9 6
4 2 2 1 9 4 0 1 1
2 1 4 3
3 4 10
2 1 4 3
1 2 5 9
4 3 9 5
5 2 8 5
```
#### 输出样例：
```
2
4
3
4
9
```

#### 解析

区间查询第 $k$ 小，$x$ 的排名，$x$ 的前驱后继，还带修。

趁这个机会我们着重看一下各个函数的实现。

- 对于求 $x$ 前驱，我们已经知道，一个数的前驱就是最大的比它小的数，这是一个最大值属性的信息，我们查询出各个子区间中小于 $x$ 的数，然后在其中取最大值就可以得到整个区间的答案。

	求解单个区间的前驱当然可以使用平衡树。
```cpp
int queryPre(int node,int l,int r,int x)//查找前驱
{
	if(l<=tr1[node].l&&tr1[node].r<=r) return getPre(tr1[node].root,x);//平衡树
	int mid=tr1[node].l+tr1[node].r>>1;
	int res=-INF;
	if(l<=mid) res=max(res,queryPre(lnode,l,r,x));
	if(r>mid) res=max(res,queryPre(rnode,l,r,x));
	return res;
}
```
- 对于求 $x$ 后缀，后缀的定义是最小的比 $x$ 大的数，求法与前驱相同。

```cpp
int querySuc(int node,int l,int r,int x)//查找后继
{
	if(l<=tr1[node].l && tr1[node].r<=r) return getSuc(tr1[node].root,x);
	int mid=tr1[node].l+tr1[node].r>>1;
	int res=INF;
	if(l<=mid) res=min(res,querySuc(lnode,l,r,x));
	if(r>mid) res=min(res,querySuc(rnode,l,r,x));
	return res;
}
```

求前驱后继我们已经在上一题中讲过，现在问题在求第 $k$ 大和查询排名。

C++ STL 里面的所有平衡树一旦涉及到什么排名第 $k$ 大之后就都不能用了。

- 查询排名就是在问 $[L,R]$ 中有多少个数小于 $x$ ，个数加 $1$ 就是 $x$ 的排名。

	区间有多少个数小于 $x$ ，这个东西就是可加的了，线段树可以维护。我们对每个区间建立一个平衡树(我用的是 Splay )，按大小关键字排序，可以得出该区间小于 $x$ 的数字个数。单次查询复杂度 $O(\log^2n)$。
```cpp
int getRank(int node,int l,int r,int x)//查找区间内比 x 小的个数
{
	if(l<=tr1[node].l&&tr1[node].r<=r) return get_k(tr1[node].root,x)-1;//记得减去哨兵节点
	int mid=tr1[node].l+tr1[node].r>>1;
	int res=0;
	if(l<=mid) res+=getRank(lnode,l,r,x);
	if(r>mid) res+=getRank(rnode,l,r,x);
	return res;
}
```

- 第 $k$ 大。我们没有有效的办法通过合并区间信息便利地得到这个答案，所以我们可以二分答案。复杂度也才 $O(\log^3 n)$。
```cpp
if(opt==2)
{
	int l,r,k;
	scanf("%d%d%d",&l,&r,&k);
	int L=0,R=1e8;
	while(L<R)
	{
		int mid=L+R+1>>1;
		if(getRank(1,l,r,mid)+1<=k) L=mid;
		else R=mid-1;
	}
	printf("%d\n",L);
}
```

- 修改。这是单点修改，我们每次到达一个线段树区间，都直接寻找到这个区间要修改位置的数在平衡树中对应的节点，将其删去，然后再插入一个新的数。

	对于 Splay 的删去，我们可以找到要删去数 $x$ ，将其转到根节点，然后就可以去找它的前驱和后继，将前驱转到根节点，后继转到根节点的右儿子，那么后继节点的左儿子就是我们要删去的节点。(这是 Splay 的内容，不会的去复习一下)

```cpp
void update(int &root,int x,int y)//插入函数
{
	int u=root;
	while(u)//找到这个节点
	{
		if(tree[u].v==x) break;
		else if(tree[u].v>x) u=tree[u].s[0];
		else u=tree[u].s[1];
	}
	splay(root,u,0);
	int l=tree[u].s[0],r=tree[u].s[1];
	while(tree[l].s[1]) l=tree[l].s[1];
	while(tree[r].s[0]) r=tree[r].s[0];
	splay(root,l,0); splay(root,r,l);
	tree[r].s[0]=0;
	push_up(r),push_up(l);
	insert(root,y);
}
void change(int node,int pos,int x)//修改
{
	update(tr1[node].root,arr[pos],x);
	if(tr1[node].l==tr1[node].r) return ;
	int mid=tr1[node].l+tr1[node].r>>1;
	if(pos<=mid) change(lnode,pos,x);
	else change(rnode,pos,x);
}
```

这个题中所有的操作就是上面五种了。

一个不太优秀的完整实现:

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=1800010,INF=2147483647;

/*----------splay部分----------*/
struct Node1
{
	int s[2],p,v,size;

	void init(int _v,int _p)
	{
		v=_v,p=_p;
		size=1;
	}

} tree[N<<1];
int idx=0;

void push_up(int node)
{
	tree[node].size=tree[tree[node].s[0]].size+tree[tree[node].s[1]].size+1;
}

void rotate(int x)//旋转
{
	int y=tree[x].p, z=tree[y].p;
	int k=tree[y].s[1]==x;
	tree[z].s[tree[z].s[1]==y]=x; tree[x].p=z;//x代y做z儿子
	tree[y].s[k]=tree[x].s[k^1], tree[tree[x].s[k^1]].p=y;//x y 子树互换
	tree[x].s[k^1]=y, tree[y].p=x;//y 做 x 儿子
	push_up(y),push_up(x);
}

void splay(int &root,int x,int k)
{
	while(tree[x].p!=k)
	{
		int y=tree[x].p, z=tree[y].p;
		if(z!=k)
		{
			if((tree[y].s[1]==x)^(tree[z].s[1]==y)) rotate(x);//判断折线形
			else rotate(y);
		}
		rotate(x);
	}
	if(!k) root=x;
}

void insert(int &root,int v)//插入
{
	int u=root,p=0;
	while(u) p=u,u=tree[u].s[tree[u].v<v];
	u=++idx;
	if(p) tree[p].s[v>tree[p].v]=u;
	tree[u].init(v,p);
	splay(root,u,0);
}

int get_k(int &root,int v)//查找比 v 小的数的个数
{
	int u=root,res=0;
	while(u)
	{
		if(tree[u].v<v) res+=tree[tree[u].s[0]].size+1,u=tree[u].s[1];
		else u=tree[u].s[0];
	}
	return res;
}

int getPre(int &root,int v)//查找最大的比 v 小的数
{
	int u=root,res=-INF;
	while(u)
	{
		if(tree[u].v<v) res=max(res,tree[u].v),u=tree[u].s[1];
		else u=tree[u].s[0];
	}
	return res;
}

int getSuc(int &root,int v)//查找最小的比 v 大的数
{
	int u=root,res=INF;
	while(u)
	{
		if(tree[u].v>v) res=min(res,tree[u].v),u=tree[u].s[0];
		else u=tree[u].s[1];
	}
	return res;
}

void update(int &root,int x,int y)//插入函数
{
	int u=root;
	while(u)
	{
		if(tree[u].v==x) break;
		else if(tree[u].v>x) u=tree[u].s[0];
		else u=tree[u].s[1];
	}
	splay(root,u,0);
	int l=tree[u].s[0],r=tree[u].s[1];
	while(tree[l].s[1]) l=tree[l].s[1];
	while(tree[r].s[0]) r=tree[r].s[0];
	splay(root,l,0); splay(root,r,l);
	tree[r].s[0]=0;
	push_up(r),push_up(l);
	insert(root,y);
}

/*----------线段树部分----------*/
struct Node2
{
	int l,r;
	int root;
} tr1[N<<1];

int n,m;
int arr[N];

#define lnode node<<1
#define rnode node<<1|1

void build(int node,int l,int r)//建树
{
	tr1[node].l=l,tr1[node].r=r;
	insert(tr1[node].root,INF); insert(tr1[node].root,-INF);//插入哨兵节点
	for(int i=l;i<=r;i++) insert(tr1[node].root,arr[i]);
	if(l==r) return ;
	int mid=l+r>>1;
	build(lnode,l,mid); build(rnode,mid+1,r);
}

int getRank(int node,int l,int r,int x)//查找区间内比 x 小的个数
{
	if(l<=tr1[node].l&&tr1[node].r<=r) return get_k(tr1[node].root,x)-1;//记得减去哨兵节点
	int mid=tr1[node].l+tr1[node].r>>1;
	int res=0;
	if(l<=mid) res+=getRank(lnode,l,r,x);
	if(r>mid) res+=getRank(rnode,l,r,x);
	return res;
}

void change(int node,int pos,int x)//修改
{
	update(tr1[node].root,arr[pos],x);
	if(tr1[node].l==tr1[node].r) return ;
	int mid=tr1[node].l+tr1[node].r>>1;
	if(pos<=mid) change(lnode,pos,x);
	else change(rnode,pos,x);
}

int queryPre(int node,int l,int r,int x)//查找前驱
{
	if(l<=tr1[node].l&&tr1[node].r<=r) return getPre(tr1[node].root,x);
	int mid=tr1[node].l+tr1[node].r>>1;
	int res=-INF;
	if(l<=mid) res=max(res,queryPre(lnode,l,r,x));
	if(r>mid) res=max(res,queryPre(rnode,l,r,x));
	return res;
}

int querySuc(int node,int l,int r,int x)//查找后继
{
	if(l<=tr1[node].l && tr1[node].r<=r) return getSuc(tr1[node].root,x);
	int mid=tr1[node].l+tr1[node].r>>1;
	int res=INF;
	if(l<=mid) res=min(res,querySuc(lnode,l,r,x));
	if(r>mid) res=min(res,querySuc(rnode,l,r,x));
	return res;
}

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=n;i++) scanf("%d",&arr[i]);
	build(1,1,n);

	for(int i=1;i<=m;i++)
	{
		int opt;
		scanf("%d",&opt);
		if(opt==1)
		{
			int l,r,x;
			scanf("%d%d%d",&l,&r,&x);
			int ans=getRank(1,l,r,x)+1;
			printf("%d\n",ans);
		}
		if(opt==2)
		{
			int l,r,k;
			scanf("%d%d%d",&l,&r,&k);
			int L=0,R=1e8;
			while(L<R)
			{
				int mid=L+R+1>>1;
				if(getRank(1,l,r,mid)+1<=k) L=mid;
				else R=mid-1;
			}
			printf("%d\n",L);
		}
		if(opt==3)
		{
			int pos,x;
			scanf("%d%d",&pos,&x);
			change(1,pos,x);
			arr[pos]=x;
		}
		if(opt==4)
		{
			int l,r,x;
			scanf("%d%d%d",&l,&r,&x);
			int ans=queryPre(1,l,r,x);
			printf("%d\n",ans);
		}
		if(opt==5)
		{
			int l,r,x;
			scanf("%d%d%d",&l,&r,&x);
			int ans=querySuc(1,l,r,x);
			printf("%d\n",ans);
		}
	}
}

```
---
### 『ZJOI2013』K 大数查询

有 $N$ 个位置，$M$ 个操作。每个位置可以同时存储多个数。

操作有两种，每次操作:

- 如果是 `1 a b c` 的形式，表示在第 $a$ 个位置到第 $b$ 个位置，每个位置加入一个数 $c$。
- 如果是 `2 a b c` 的形式，表示询问从第 $a$ 个位置到第 $b$ 个位置，第 $c$ 大的数是多少。
#### 输入格式
第一行包含两个整数 $N,M$。

接下来 $M$ 行，每行包含一条指令，形如 `1 a b c` 或 `2 a b c`。

#### 输出格式
输出每个询问的结果，每个结果占一行。

#### 数据范围
$1≤N,M≤50000,\\
1≤a≤b≤N,$

$1$ 操作中的 $c$ 的绝对值不超过 $N$,
$2$ 操作中 $c$ 满足 $1≤c≤2^{31}−1$。

所有操作保证合法。

#### 输入样例：
```
2 5
1 1 2 1
1 1 2 2
2 1 1 2
2 1 1 1
2 1 2 3
```
#### 输出样例：
```
1
2
1
```
#### 样例解释
第一个操作后位于位置 $1$ 的数只有 $1$，位于位置 $2$ 的数也只有 $1$。

第二个操作后位于位置 $1$ 的数有 $1$、$2$，位于位置 $2$ 的数也有 $1$、$2$。

第三次询问位置 $1$ 到位置 $1$ （也就是位置 $1$）中第 $2$ 大的数，答案是 $1$。

第四次询问位置 $1$ 到位置 $1$ （也就是位置 $1$）中第 $1$ 大的数，答案是 $2$。

第五次询问位置 $1$ 到位置 $2$ 中第 $3$ 大的数，答案是 $1$。

---

#### 解析

如果认真地打了上面的例题 ~~(指重构两遍(雾)~~，那么就可以清楚地认识到，线段树套平衡树对于区间修改是很无力的。并且，本题这种区间插入我们还要维护一个 `set` 作为懒标记来记录区间里面加了哪些数。

随便想一想都觉得很麻烦。

本题只求区间第 $k$ 大，所以我们想到利用权值线段树，这也同时要求我们离散化。

而对于每一个数，我们还要关心它的位置在哪里，所以我们还要对每一个值域区间建立一棵权值线段树，记录这个区间内的数的下标出现情况。

也就是说，这个题我们将使用线段树套线段树。线段树比平衡树还是要好写一点(大概。

知道了大概的策略，我们来看具体操作：

- 插入

	我们对于每一个包含 $c$ 的值域区间，都要在它对应的内层线段树的区间 $[a,b]$ 上 $+1$ 。时间复杂度 $O(\log^2n)$

- 查询

	我们首先查找较大的区间，在其内层树求一下 $[a,b]$ 内的总和。如果此时和大于 $k$ ，证明第 $k$ 大比此时的 $mid$ 小，那么就进入右儿子继续查找。反之则证明第 $k$ 大比当前的 $mid$ 大，我们应该去查询左区间的 $k-mid$ 大。如果 $k$ 和 $mid$ 相等，则证明我们要找的第 $k$ 大就是 $mid$。

由于 $push\ down$ 懒标记时间消耗会很大( $O(n^2\log^2n)$ 优秀数据结构)，我们需要使用标记永久化。
