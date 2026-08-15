---
title: "同余最短路"
slug: legacy-3aeb20a93cc5
tree:
  - "笔记"
  - "图论"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## 同余最短路

同余最短路是一种最短路的应用 ，一般用来解决如下问题：

数列 $\{a_n\}$ 已知，求 $n$ 元多项式 $\sum\limits_{i=1}^na_ix_i=k$ 的最值之类的问题。

我们通过一道题来引入：

### 引：跳楼机

[$link:luogu\ P3403$](https://www.luogu.com.cn/problem/P3403)

**形式化的题意**：给定四正整数 $x,y,z,h$，求有多少个正整数 $y$ 满足 $(y<h)\land (y=ax+by+cz+1)$ 对于 $a,b,c$ 有非负整数解。

#### 输入格式

第一行一个整数 $h$

第二行三个正整数，分别表示题目中的 $x,y,z$。

#### 输出格式

一行一个整数，表示这样的正整数个数。

#### 数据范围

$1\le h \le 2^{63}-1,\ 1\le x,y,z\le 10^5$

#### 解析

首先我们第一眼可以看出一个三个物品的完全背包，复杂度 $O(h)$。

但是这个 $O(h)$ 达到了 $10^{19}$ 级别，显然不是正解。

这个时候我们就要使用**同余最短路**来做了。

### 同余最短路

先讲一下思路的转换，也就是这个东西的推导。

我们知道，任意一个正整数 $x$ 都可以对应到一个数 $n$ 的最小非负剩余为代表的完全剩余系 $S=\{0,1,\dots,n-1\}$ 中的某个元素。

而要得到这个数，我们只需要加几个模数 $n$；写成带余除法的形式，就是 $x=kn+r,\quad (r\in S\land x\bmod n=r)$。

我们能从中受启发，得到一个构造拼凑数字方案的方法：

假设我们有原数 $a,b,c$ ，要拼出一个数 $x$。(保证合法)

我们可以先**将所有的数放在模 $a$ 意义下**，然后**用 $a,b,c$ 去凑余数**，凑得一个**最小的正整数。$x^{\prime}$ 满足 $x^{\prime}\equiv x\mod a$**，

此时这个 $x^{\prime}$ 与 $x$ 的关系有 $x^{\prime}<x$ 和 $x^{\prime}\ge x$ 两种情况。

- 当 $x<x^{\prime}$ 时

    这意味着我们最小能凑得的与 $x$ 同余的数都大于 $x$，那么我们肯定不能凑出 $x$。

- 当 $x\ge x^{\prime}$ 时

    由于 $x\equiv x^{\prime}\mod a$ ，所以 $x=x^{\prime}+ka(k\in N)$ 。

大体思路即是这样，现在我们关注具体怎么去凑这个余数。

首先我们可以想到 DP 。

- 状态设计：设 $f(i)$ 表示给定数凑出来的模 $a$ 余数为 $i$ 的最小数。

- 状态计算：由于它的来源状态较为复杂，我们考虑它被包含在了哪些集合中。

    由于凑数的时候我们可以加上 $a,b,c$ 中的任意一个数，设这个数为 $t$，可以得到：

    $$f((i+t)\bmod a)=\min\{f((i+t)\bmod a)\ ,\ f(i)+t\}$$

    初始状态 $f(0)=0$。

以上即是朴素 DP 的过程，复杂度大概 $O(na)$，$n$ 是给定的能拿来凑数的数的个数，在这题里面是 $3$。

我们继续观察这个 DP。

这是一个形如 $d(y)=d(x)+z$ 的转移式，我们能想到什么？

$$dis(y)=\min(dis(y),dis(x)+z)$$

这是我们在写最短路时候的式子。

完全一样。

将完系中的各个元素抽象为点，并将 $(i+t)\bmod a$ 与 $i\bmod a$ 连上权值为 $t$ 的边。这就是一个最短路问题。

我们使用了最短路将这个问题弄到了 $O(n\times aloga)\dots\dots?$。

似乎反向优化了？

但是最短路模型下这个问题的 $h$ 处理范围可以达到 $10^{18}$，这应该是 DP 所不能及的。

对于这个题，我们只需要将最短路跑出来得到 $f$ 数组后，将数组内的数 $f[i]$ 与 $h-1$ 做比较，若小于 $h-1$，则答案 $Ans+=(h-1-f[i])/base+1$ 即可。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<ll,int> PII;

const int N=2e5+10;

ll h;
ll a,b,c;
ll base;
ll edg[N],f[N];

int head[N],ver[N],nxt[N],tot=0;
void add(int x,int y,ll z)
{
	ver[++tot]=y; edg[tot]=z; nxt[tot]=head[x]; head[x]=tot;
}

bool vis[N];
priority_queue<PII,vector<PII>,greater<PII> > q;

void dijkstra()
{
	memset(f,0x3f,sizeof f);
	memset(vis,0,sizeof vis);
	f[0]=0;q.push({0,0});
	while(q.size())
	{
		int x=q.top().second;
		q.pop();
		if(vis[x]) continue;
		vis[x]=1;
		for(int i=head[x];i;i=nxt[i])
		{
			int y=ver[i];
			if(f[y]>f[x]+edg[i])
			{
				f[y]=f[x]+edg[i];
				q.push({f[y],y});
			}
		}
	}
}

int main()
{
	scanf("%lld",&h);
	scanf("%lld%lld%lld",&a,&b,&c);
	base=a;
	for(int i=0;i<base;i++)
	{
		add(i,(i+b)%base,b);//同余最短路的关键在于建图
		add(i,(i+c)%base,c);
	}
	dijkstra();
	ll ans=0;
	for(int i=0;i<base;i++)
		if(h-1>f[i]) ans+=(ll)(h-1-f[i])/base+1LL;
	printf("%lld",ans);
	return 0;
}

```

### P2662 牛场围栏

#### 题目描述


奶牛们十分聪明,于是在牛场建围栏时打算和小L斗智斗勇！小 L 有 $N$ 种可以建造围栏的木料，长度分别是 $l_1,l_2, …, l_N$ ，每种长度的木料无限。

修建时，他将把所有选中的木料拼接在一起，因此围栏的长度就是他使用的木料长度之和。但是聪明的小L很快发现很多长度都是不能由这些木料长度相加得到的，于是决定在必要的时候把这些木料砍掉一部分以后再使用。

不过由于小 L 比较节约，他给自己规定：任何一根木料最多只能削短 $M$ 米。当然，每根木料削去的木料长度不需要都一样。不过由于测量工具太原始，小 L 只能准确的削去整数米的木料，因此，如果他有两种长度分别是 $7$ 和 $11$ 的木料，每根最多只能砍掉 $1$ 米，那么实际上就有 $4$ 种可以使用的木料长度，分别是 $6,7,10, 11$。

因为小L相信自己的奶牛举世无双，于是让他们自己设计围栏。奶牛们不愿意自己和同伴在游戏时受到围栏的限制，于是想刁难一下小 L ，希望小 L 的木料无论经过怎样的加工，长度之和都不可能得到他们设计的围栏总长度。不过小 L 知道，如果围栏的长度太小，小 L 很快就能发现它是不能修建好的。因此她希望得到你的帮助，找出无法修建的最大围栏长度。

#### 输入格式

输入的第一行包含两个整数$N,M$，分别表示木料的种类和每根木料削去的最大值。

以下各行每行一个整数 $l_i$，表示第 $i$ 根木料的原始长度。

#### 输出格式

一行一个整数表示答案。若如果任何长度的围栏都可以修建或者这个最大值不存在，输出 $-1$。

#### 输入样例
```
2 1
7 11
```

#### 输出样例
```
15
```

#### 数据范围
$40 \% ：1< N< 10,  0< M< 300$

$100 \% ：1< N< 100,  0< M< 3000$

#### 解析

首先我们可以将所有能用的数暴力跑出来，复杂度 $O(NM)$，可以接受。

此时我们发现第一个无解情况：当能用的数出现 $1$ 的时候，可以拼凑的出任意正整数。

将其特判掉，我们继续。

设所有能用的数个数为 $n$，那么本题的问题就是给定一个序列 $\{a_n\}$，求 $\sum_{i=1}^na_ix_i$ 最大不能表示出的整数。

我们可以考虑使用**同余最短路**来求。

设 $base$ 是我们规定的模数，同余最短路求出的距离 $f[x]$ 是能拼凑出的在以 $x$ 为代表元的剩余类中的最小数字。

那么 $f[x]-base$ 就是不能拼凑出的在该剩余类中的最大数字。遍历所有剩余类 $[x]$ ，取最大的 $f[x]$ 即可。

这里我们会遇到另一个无解情况，可能我们根本无法拼出某一个剩余类中的数字，即 $f[x]\to \infty$。

仍然特判掉即可。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef pair<int,int> PII;

const int N=4e5+10,INF=0x3f3f3f3f;

int n,m;
int arr[N],cnt=0;
int base=INF;

int head[N],ver[N<<1],nxt[N<<1],edg[N<<1],tot=0;
void add(int x,int y,int z)
{
	ver[++tot]=y; edg[tot]=z; nxt[tot]=head[x]; head[x]=tot;
}
bool vis[N];
int f[N];
priority_queue<PII,vector<PII>,greater<PII> > q;

void dijkstra()
{
	memset(f,0x3f,sizeof f);
	memset(vis,0,sizeof vis);
	f[0]=0; q.push({0,0});
	while(q.size())
	{
		int x=q.top().second;
		q.pop();
		if(vis[x]) continue;
		vis[x]=1;
		for(int i=head[x];i;i=nxt[i])
		{
			int y=ver[i];
			if(f[y]>f[x]+edg[i])
			{
				f[y]=f[x]+edg[i];
				q.push({f[y],y});
			}
		}
	}
}

int main()
{
	scanf("%d%d",&n,&m);
	cnt=n;
	for(int i=1;i<=cnt;i++) scanf("%d",&arr[i]),vis[arr[i]]=1,base=min(base,arr[i]);
	for(int i=1;i<=n;i++)//暴力跑出所有能用的数
	{
		for(int j=1;j<=m;j++)
			if(arr[i]-j>0&&!vis[arr[i]-j]) arr[++cnt]=arr[i]-j,vis[arr[cnt]]=1,base=min(arr[cnt],base);
			else if(arr[i]-j<=0) break;
	}
	if(vis[1]) return 0&printf("-1");//出现了 1
	for(int i=0;i<base;i++)
	{
		for(int j=1;j<=cnt;j++)
			add(i,(i+arr[j])%base,arr[j]);
	}
	dijkstra();
	int ans=0;
	for(int i=1;i<base;i++)
	{
		if(f[i]>=INF) return 0&printf("-1");//这个剩余类无法被拼凑出
		ans=max(ans,f[i]-base);
	}
	printf("%d",ans);
	return 0;
}
```

### P2371 [国家集训队]墨墨的等式

#### 题目描述

墨墨突然对等式很感兴趣，他正在研究 $\sum_{i=1}^n a_ix_i=b$ 存在非负整数解的条件，他要求你编写一个程序，给定 $n, \{a_n\}, l, r$，求出有多少 $b\in[l,r]$ 可以使等式存在非负整数解。

#### 输入格式

第一行三个整数 $n,l,r$ 。

第二行 $n$ 个整数 $a_1\sim a_n$

#### 输出格式

一行一个整数，表示有多少 $b\in [l,r]$ 可以使得等式存在非负整数解。

#### 输入样例
```
2 5 10
3 5
```
#### 输出样例
```
5
```
#### 数据范围

$1\le n\le 12\ ,\ 0<a_i\le 5\times 10^5\ ,\ 1\le l\le r\le 10^{12}$

#### 解析

P3403 跳楼机 升级版。

我们仿照那题的做法，使用**同余最短路**解决问题。

对于所有的 $a_i$，我们先将 $0$ 筛掉，然后找到最小值，设为 $base$。

之后我们枚举所有的剩余类 $[\ i\ ]$ 和给定数组 $a_i$，按照如下方式建边。

```cpp
for(int i=0;i<base;i++)
{
    for(int j=1;j<=n;j++)
        add(i,(i+a[i])%base,a[i]);
}
```

这样之后，我们跑出来的最短路数组 $f[x]$ 表示的就是我们能够拼出来的最小的在剩余系 $[x]$ 中的数。

现在我们考虑如何计算 $[l,r]$ 中满足条件的数。

首先我们能够轻易计算出 $[1,x]$ 中满足条件的数：$\sum_{i=1}^{base-1}(\frac{x-f[i]}{base}+1)$。

显然的是区间满足条件的数是类型与有前缀和性质的。

所以我们只需要计算：$[1,r]$ 中满足条件的数 $-$ $[1,l-1]$ 中满足条件的数。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<ll,int> PII;

const int N=5e6+10;

int n;
ll l,r,base=1e9;
vector<ll> a;
int head[N],ver[N<<1],nxt[N<<1],tot=0;
ll edg[N<<1];
void add(int x,int y,ll z)
{
	ver[++tot]=y; edg[tot]=z; nxt[tot]=head[x]; head[x]=tot;
}
bool vis[N];
ll f[N];
priority_queue<PII, vector<PII>,greater<PII> > q;

void dijkstra()
{
	memset(f,0x42,sizeof f);
	memset(vis,0,sizeof vis);
	f[0]=0; q.push({0,0});
	while(q.size())
	{
		int x=q.top().second;
		q.pop();
		if(vis[x]) continue;
		vis[x]=1;
		for(int i=head[x];i;i=nxt[i])
		{
			int y=ver[i];
			if(f[y]>f[x]+edg[i])
			{
				f[y]=f[x]+edg[i];
				q.push({f[y],y});
			}
		}
	}
}

int main()
{
	scanf("%d%lld%lld",&n,&l,&r);
	for(int i=1;i<=n;i++)
	{
		int x;
		scanf("%d",&x);
		if(x) a.push_back((ll)x),base=min(base,(ll)x);
	}
	for(int i=0;i<base;i++)
	{
		for(int j=0;j<a.size();j++)
			add(i,(i+a[j])%base,a[j]);
	}
	dijkstra();
	ll ansl=0,ansr=0;
	for(int i=0;i<base;i++)
	{
		if(r>=f[i]) ansr+=(r-f[i])/base+1LL;
		if(l-1>=f[i]) ansl+=(l-1-f[i])/base+1LL;]);
	}
	printf("%lld",ansr-ansl);
	return 0;
}
```
## 总结

其实同余最短路的关键是建边，这是一种通过建图来用图论算法解决非图论问题的经典例子。

同时同余最短路也只是一种最短路的运用方式，并不是一个单独的算法。我们在题目中可以结合特定的性质来确定做法。总之，算法是死的，人是活的。
