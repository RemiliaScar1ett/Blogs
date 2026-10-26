---
title: "莫比乌斯反演入门"
slug: legacy-3bb0658c4795
tree:
  - "笔记"
  - "数论"
tags:
  - 数论
  - 莫比乌斯反演
  - 分块
date: 2026-08-15
uid: 9edf4223-5536-4f49-98b2-cbd4185bbb3d
dateKind: collected
---
## 莫比乌斯反演

莫比乌斯反演是数论中的一个重要内容，可以化简很多数论函数的计算。

本文形式化过程偏多，一定要耐心看完并试着自己推导。

### 前置芝士

\>[莫比乌斯函数](https://www.cnblogs.com/IzayoiMiku/p/14067226.html)<

### 定义

对于定义在自然数域的两个函数 $F(x)$ 与 $f(x)$ ，若两函数满足
$$F(n)=\sum_{d|n}f(d)$$

则有
$$f(n)=\sum_{d|n}\mu(d)F(\frac{n}{d})$$

莫比乌斯反演还有另外一种常用的形式:
$$F(n)=\sum_{n|d}f(d)\\ \Rightarrow f(n)=\sum_{n|d}\mu(\frac{d}{n})F(d)$$

### 证明：

$$
\begin{aligned}
\sum_{d|n}\mu(d)F(\frac{n}{d})
& =\sum_{d|n}\mu(d)\sum_{d^{\prime}|\frac{n}{d}}f(d^{\prime})\\
& =\sum_{d^{\prime}|n}\mu(d)\sum_{d|\frac{n}{d}}f(d)\\
& =f(n)
\end{aligned}
$$

---
### 使用例：

求
$$\sum_{i=1}^{n}\sum_{j=1}^{m}[gcd(i,j)=1]$$

不妨假设这里的$n<m$。

对于gcd这个东西很套路，先设

$$f(x)=\sum_{i=1}^{n}\sum_{j=1}^{m}[gcd(i,j)=x]\\ g(x)=\sum_{x|d}f(d)$$

其中 $d\leq n$。

代入莫比乌斯反演公式2，得到：

$$f(x)=\sum_{x|d}\mu(\frac{d}{x})g(d)\\
  \Rightarrow f(1)=\sum_{1|d}\mu(d)g(d)\\
$$

修改枚举项，可以得到

$$f(1)=\sum_{i=1}^{n}\mu(i)g(i)$$

$\mu(i)$ 再好求不过了，关键在于 $g(i)$ 是个什么东西。

从含义出发，易得到：

$$
g(x)=\sum_{i=1}^{n}\sum_{j=1}^{m}[x|gcd(i,j)]\\
g(x)=\sum_{i=1}^{n/x}\sum_{j=1}^{m/x}[1|\gcd(i,j)]\\
$$

$1|gcd(i,j)$ 显然恒成立，则

$$g(x)=\frac{n}{x}\cdot \frac{m}{x}$$

$O(1)$ 算就可以了。

最后我们求的是
$$Ans=f(1)=\sum_{i=1}^{n}\mu(i)\lfloor\frac{n}{i}\rfloor\lfloor\frac{m}{i}\rfloor$$

所以只需要 $O(n)$ 算 $\mu(i)$ 前缀和即可。

最后代码和>[莫比乌斯函数](https://www.cnblogs.com/IzayoiMiku/p/14067226.html)<里的没有太大区别

---

## 例题

### P2398 GCD SUM

\>[题目链接](https://www.luogu.com.cn/problem/P2398)<

#### 题目描述

求
$$\sum_{i=1}^{n}\sum_{j=1}^{n}gcd(i,j)$$

#### 输入格式

一行一个正整数 $n$

#### 输出格式

一行一个整数表示答案

#### 数据范围

$n\leq 10^5$

---
#### 解析

这里直接讲 $\sum_{i=1}^{n}\sum_{j=1}^{m}gcd(i,j)$ 的做法

直接拿给我们是没有办法做的。

不妨设$n < m$，实际代码中 $n=min(n,m)$ 即可。这类有限项枚举求和交换枚举项顺序一般是没有问题的。

考虑枚举gcd，能化得如下式子
$$
\sum_{d=1}^{n}\sum_{i=1}^{n}\sum_{j=1}^{m}d\cdot[gcd(i,j)=d]\\
=\sum_{d=1}^{n}d\sum_{i=1}^{n}\sum_{j=1}^{m}[gcd(i,j)=d]\\
=\sum_{d=1}^{n}d\sum_{i=1}^{n/d}\sum_{j=1}^{m/d}[gcd(i,j)=1]
$$

后面这一团不就是之前推的式子？

直接套结论

$$
\sum_{d=1}^{n}d\sum_{i=1}^{n/d}\sum_{j=1}^{m/d}[gcd(i,j)=1]\\
=\sum_{d=1}^{n}d\sum_{i=1}^{n/d}\mu(i)\lfloor\frac{n}{id}\rfloor\lfloor\frac{m}{id}\rfloor
$$

可以知道，对于特定区间内的 $d$ ，$n/d$ 是无变化的。

所以可以对前面的 $d$ 进行数论分块。

后面的求值参考上面，也可以数论分块。

总时间复杂度 $O(\sqrt{n}\times\sqrt{n})=O(n)$ 。

落到本题上，本题的 $n=m$ , 数论分块的取 $min(n/(n/i),m/(m/i))$ 操作都免了。

参考code:
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e6;

int primes[N],tot=0;
bool mp[N];

int mu[N],sum_[N];

void init(int n)
{
	mu[1]=1;
	for(int i=2; i<=n; i++)
	{
		if(!mp[i])
		{
			primes[++tot]=i;
			mu[i]=-1;
		}
		for(int j=1; primes[j]*i<=n; j++)
		{
			int tmp=primes[j]*i;
			mp[tmp]=1;
			if(i%primes[j]==0)
			{
				mu[tmp]=0;
				break;
			}
			mu[tmp]=mu[i]*-1;
		}
	}
	for(int i=1; i<=n; i++)
	{
		sum_[i]=sum_[i-1]+mu[i];
	}
}

ll solve(ll a,ll b)
{
	ll res=0;
	for(int i=1,j; i<=a; i=j+1)
	{
		j=min(a/(a/i),b/(b/i));
		res+=(ll)(sum_[j]-sum_[i-1])*(a/i)*(b/i);
	}
	return res;
}

int main()
{
	init(1e5+10);

	int n;
	scanf("%d",&n);
	ll ans=0;
	for(int i=1,j; i<=n; i=j+1) //第一遍整除分块前面的d
	{
		j=n/(n/i);
		ll tmp=(ll)(i+j)*(j-i+1)/2;
		ans+=(ll)tmp*solve(n/i,n/i);//第二遍整除分块
	}
	printf("%lld",ans);
	return 0;
}
```
---

### P2568 GCD

\>[题目链接](https://www.luogu.com.cn/problem/P2568)\<

#### 题目描述
给定正整数 $n$，求 $1\le x,y\le n$ 且 $\gcd(x,y)$ 为素数的数对 $(x,y)$ 有多少对。

#### 输入格式
只有一行一个整数，代表 $n$。

#### 输出格式
一行一个整数表示答案。

#### 数据范围

$1\le n \le 10^7$

---

#### 解析

题目求
$$\sum_{i=1}^{n}\sum_{j=1}^{n}[gcd(i,j)\text{是素数}]$$

令 $gcd(i,j)=d$，则
$$\text{原式}=\sum_{d=1}^{n}d[d\text{是素数}]\sum_{i=1}^{n/d}\sum_{j=1}^{n/d}[gcd(i,j)=1]$$

后面那个东西怎么做不用重复说了吧。

至于前面，对 $d$ 再进行一次数论分块 (有向下取整除法的地方就可以考虑一下数论分块)

再处理一个素数个数前缀和就行了。

code:(仅供思路参考，下面这份代码以 2.82s/247.67MB 的好成绩惊险卡过)
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e7+10;

ll primes[N],psum[N],tot=0;
bool mp[N];

ll mu[N],sum[N];

void init(ll n)
{
	mu[1]=1,mp[1]=1;
	for(int i=2; i<=n; i++)
	{
		if(!mp[i])
		{
			primes[++tot]=i;
			mu[i]=-1;
		}
		for(int j=1; (ll)primes[j]*i<=n; j++)
		{
			ll tmp=(ll)primes[j]*i;
			mp[tmp]=1;
			if(i%primes[j]==0)
			{
				mu[tmp]=0;
				break;
			}
			mu[tmp]=mu[i]*-1;
		}
	}
	for(int i=1; i<=n; i++)
	{
		sum[i]=sum[i-1]+mu[i];
		if(mp[i]) psum[i]=psum[i-1];
		else psum[i]=psum[i-1]+1;
	}
}

ll solve(ll a,ll b)
{
	ll res=0;
	for(int i=1,j; i<=a; i=j+1)
	{
		j=min(a/(a/i),b/(b/i));
		res+=(ll)(sum[j]-sum[i-1])*(a/i)*(b/i);
	}
	return res;
}

int main()
{
	init(1e7+10);

	int n;
	scanf("%d",&n);
	ll ans=0;
	for(int i=1,j; i<=n; i=j+1)
	{
		j=n/(n/i);
		ans+=(ll)(psum[j]-psum[i-1])*solve(n/i,n/i);
	}
	printf("%lld",ans);
	return 0;
}
```
---

### P2257 YY的GCD

\>[题目链接](https://www.luogu.com.cn/problem/P2257)\<

#### 题目描述
神犇 YY 虐完数论后给傻× kAc 出了一题

给定 $N, M$，求 $1 \leq x \leq N$ ，$1 \leq y \leq M$ 且 $\gcd(x, y)$ 为质数的 $(x, y)$ 有多少对。

#### 输入格式
第一行一个整数 $T$ 表述数据组数。

接下来 $T$ 行，每行两个正整数，$N, M$。

#### 输出格式
共 $T$ 行，每行一个整数表示第 $i$ 组数据的结果。

#### 数据范围

$T=10^4\ , \ N,M\le 10^7$

---

#### 解析

乍看跟上面那个题几乎完全相同

但是是多组询问，按照上面那个级别的~~优秀~~时空复杂度是肯定过不了的。

再往下推一下式子(这里已经把 $n,m$ 换上去了，$n,m$ 相当于题中的 $N,M$ ，且 $n\le m$ )

令 $T=id$

$$
\begin{aligned}
Ans
& =\sum_{d=1}^{n}d[d\text{是素数}]\sum_{i=1}^{n/d}\mu(i)\lfloor\frac{n}{id}\rfloor\lfloor\frac{m}{id}\rfloor\\
& =\sum_{T=1}^{n}\lfloor\frac{n}{T}\rfloor\lfloor\frac{m}{T}\rfloor\sum_{d|T}[d\text{是素数}]\mu(\frac{T}{d})
\end{aligned}
$$
按照惯例，我们要想一下后面那团东西的前缀和怎么求。

可以从线性筛出发考虑。

令函数 $\lambda(x)=\sum_{d|x}[d\text{是素数}]\mu(\frac{x}{d})$ ，求这个函数的前缀和。

首先，$\lambda(1)=0,\lambda(\text{质数})=1$ 。

设 $x=i\cdot y$ ， $y$ 是 $x$ 的最小质因子。

**1.** 当 $y|i$ 时，即 $x$ 有多个最小质因子：

- 若 $i$ 质因子互不相同时，当且仅当枚举的素数 $d=y$ 时 $\mu(\frac{x}{d})\ne 0$。

  此时：$\lambda(x)=\mu(\frac{x}{y})$

- 若 $i$ 有相同质因子，则对于任意枚举的素数 $d$  ，$\frac{x}{d}$ 内都有相同质因子， 即 $\mu(\frac{x}{d})=0$。

  此时仍有 $\lambda(x)=\mu(\frac{x}{y})$

**2.** 当 $y\nmid i$ 时，即 $x$ 只有一个最小质因子：

$$\lambda(x)=\sum_{d|x}[d\text{是素数}]\mu(\frac{x}{d})\\ \Rightarrow \lambda(i\cdot y)=\sum_{d|(i\cdot y)}[d\text{是素数}]\mu(\frac{i\cdot y}{d})$$

我们已经知道，$\mu(i\cdot y)=-\mu(i)$ (如果看不懂可以再看看莫比乌斯函数定义)

所以对于 $\lambda(i)$ 其中的每一项的相反数都被包括在了 $\lambda(x)$ 中，且 $\lambda(x)$ 只是多了一个 $\mu(\frac{i\cdot y}{y})=\mu(i)$。

所以此时的 $\lambda(x)=-\lambda(i)+\mu(i)$

综上：

$$
\lambda(x)=
\begin{cases}
\mu(1) , & x\text{是质数}\\
\mu(i) , & y|i\\
-\lambda(i)+\mu(i) , & y\nmid i
\end{cases}
$$

于是 $\lambda(x)$ 就可以用线筛求了。

code: 7.79s/90.86MB
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e7+10;

int primes[N],tot=0;
int mu[N],lam[N];
bool mp[N];

void init(int n)
{
	mu[1]=mp[1]=1;
	for(int i=2; i<=n; i++)
	{
		if(!mp[i]) primes[++tot]=i,mu[i]=-1,lam[i]=1;
		for(int j=1; primes[j]*i<=n; j++)
		{
			int x=i*primes[j];
			mp[x]=1;
			if(i%primes[j]==0)
			{
				lam[x]=mu[i];
				mu[i]=0;
				break;
			}
			lam[x]=-lam[i]+mu[i];
			mu[x]=-1*mu[i];
		}
	}
	for(int i=1; i<=n; i++)
		lam[i]+=lam[i-1];//前缀和
}

int main()
{
	init(1e7);
	int t;
	scanf("%d",&t);
	while(t--)
	{
		int n,m;
		scanf("%d%d",&n,&m);
		ll ans=0;
		if(n>m) swap(n,m);
		for(int i=1,j; i<=n; i=j+1)
		{
			j=min(n/(n/i),m/(m/i));
			ans+=(ll)(lam[j]-lam[i-1])*(n/i)*(m/i);
		}
		printf("%lld\n",ans);
	}
	return 0;
}
```

[P1829 \[国家集训队\]Crash的数字表格/JZPTAB](https://www.luogu.com.cn/problem/P1829)

[P6156 简单题](https://www.luogu.com.cn/problem/P6156)

[P3768 简单的数学题](https://www.luogu.com.cn/problem/P3768)

[P3704 [SDOI2017]数字表格](https://www.luogu.com.cn/problem/P3704)

[P5518 [MtOI2019]幽灵乐团 / 莫比乌斯反演基础练习题](https://www.luogu.com.cn/problem/P5518)

 ~~(在做了在做了)~~

## 参考文章
[我也不知道什么是"莫比乌斯反演"和"杜教筛"](https://blog.csdn.net/qq_30974369/article/details/79087445)
