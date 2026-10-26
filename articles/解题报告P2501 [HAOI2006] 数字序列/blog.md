---
title: "解题报告P2501 [HAOI2006] 数字序列"
slug: legacy-5275991e2fc0
tree:
  - "题解"
tags:
  - 动态规划
date: 2026-08-15
uid: eaf09ff0-d8ed-40a3-9e7b-477e87b81396
dateKind: collected
---

###  P2501 [HAOI2006] 数字序列

#### 题目描述

现在我们有一个长度为 $n$ 的整数序列 $a$。但是它太不好看了，于是我们希望把它变成一个单调严格上升的序列。但是不希望改变过多的数，也不希望改变的幅度太大。

#### 输入格式

第一行是一个整数，表示序列长度 $n$。  
第二行有 $n$ 个整数，第 $i$ 个整数表示序列的第 $i$ 项 $a_i$。

#### 输出格式

第一行输出一个整数，表示最少需要改变多少个数。

第二行输出一个整数，表示在改变的数最少的情况下，每个数改变的绝对值之和的最小值。

#### 样例 #1

##### 样例输入 #1

```
4
5 2 3 5
```

##### 样例输出 #1

```
1
4
```

#### 数据规模与约定

- 对于 $90\%$ 的数据，保证 $n \leq 6 \times 10^3$。
- 对于 $100\%$ 的数据，保证 $1 \leq n \leq 3.5 \times 10^4$，$1 \leq a_i \leq 10^5$。数据保证 $a_i$ 随机生成。

### 解析

先看第一问。

我们考虑什么样的数需要保留。首先选定一个数 $a_i$ 作为基准，考虑在它后面的某个数 $a_j$，那么只有当 $a_j-a_i\ge i-j$ 时才有可能保留。那么我们构建一个新的数列 $b_i=a_i-i$ ，它的最长不下降子序列元素个数就是我们最多保留的数。

对于第二问，首先我们可以知道，原问题等价于把 $b$ 数组改得单调不降。

我们首先考虑 $b$ 的最长上升子序列中的两个相邻元素 $b_j,b_i(j\le i)$。

修改前 $b_i$ 和 $b_j$ 之间的数字一定 $\not\in [b_j,b_i]$，而合法的序列一定在 $[b_j,b_i]$ 内。首先我们可以想到把在外面的数全部移到最近的边界上，最优解一定是在这个基础上构造出来的。

然后我们考虑怎样继续构造是最优的。实际上，最优的解的形态肯定是以一个 $k\in[j,i]$ 为分界点，$b_{x\le k}=b_j,\ b_{x>k}=b_i$ 的一个情况。

为什么呢？我们先假设有一部分连续子序列夹在中间

对于只有一个元素的情况是显然的，把它移到靠近初始位置的那个 $b$ 更优秀。

对于多个元素，我们考虑对于这个子段向两边移动的代价。《容易发现》我们总是可以无偿甚至减少代价地将其转移到某种上文所述的最优解的情况。

于是我们设 $h(i)$ 为 $[1,i]$ 区间内的修改代价最小值。那么转移方程如下：

$$
h(i)=\underset{f(i)=f(j)+1}{\min}\{\ h(j)+w(j+1,i-1)\}
$$

其中

$$w(l,r)=\underset{l\le k\le r}{\min}\{\sum_{i=l}^k|b_i-b_l|+\sum_{i=k+1}^r|b_i-b_r|\}$$

#### 一些实现上的小细节

可以在做第一问的时候就用 vector 预处理出状态转移：即存一下所有长度为 $i$ 的子序列末尾。

由于 LCS 的前后可能还有元素要处理，所以添加 $b_0=-\infty,b_{n+1}=+\infty$。

记得开 `long long` 以及枚举间断点 $k$ 的时候只能枚举到 $i-1$
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=4e4+10;
const ll inf=0x3f3f3f3f;

int n;
ll a[N],b[N],h[N];
int g[N],f[N];
vector<int> vec[N];

ll pre[N],suf[N];
void init(int l,int r)
{
	if(l>r) return ;
	pre[l]=0,suf[r-1]=0;
	for(int i=l+1;i<=r-1;i++) pre[i]=pre[i-1]+abs(b[i]-b[l]);
	for(int i=r-1;i>=l;i--) suf[i]=suf[i+1]+abs(b[i+1]-b[r]);

}

int main()
{
	scanf("%d",&n);
	for(int i=1;i<=n;i++) scanf("%lld",&a[i]);
	for(int i=1;i<=n;i++) b[i]=a[i]-(ll)i;
	int tot=1;
	g[tot]=b[1];f[1]=1;vec[1].push_back(1); b[n+1]=inf;
	for(int i=2;i<=n+1;i++)//最长不下降
	{
		if(b[i]>=g[tot])
		{
			g[++tot]=b[i];
			vec[tot].push_back(i);
			f[i]=tot;
		}
		else
		{
			int l=upper_bound(g+1,g+1+tot,b[i])-g;
			g[l]=b[i]; vec[l].push_back(i);
			f[i]=l;
		}
	}
	printf("%d\n",n-tot+1);
	b[0]=-inf;
	memset(h,0x3f3f3f3f,sizeof h);
	h[0]=0; vec[0].push_back(0);
	for(int i=1;i<=n+1;i++)
	{
		for(int p=0;p<vec[f[i]-1].size();p++)
		{
			int j=vec[f[i]-1][p];
			if(j>i||b[j]>b[i]) continue;
			init(j,i);
			for(int k=j;k<i;k++)
			{
				h[i]=min(h[i],h[j]+pre[k]+suf[k]);
			}
		}
	}
	printf("%lld",h[n+1]);
	return 0;
}
```
