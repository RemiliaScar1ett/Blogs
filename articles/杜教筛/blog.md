---
title: "杜教筛"
slug: legacy-eed8500013fc
tree:
  - "笔记"
  - "数论"
tags:
  - 数论
  - 杜教筛
  - 狄利克雷卷积
date: 2026-08-15
uid: 633040b8-64f0-40b0-b076-41dcbad862ab
dateKind: collected
---
## 杜教筛

杜教筛是一种在低于线性时间复杂度下求积性函数前缀和的方法。

我们对于一个积性函数 $f$ ，要求它的前缀和 $S$。

我们构造两个辅助函数：积性函数 $g$ ，狄利克雷卷积 $f*g$

有这样一个结论：$\sum\limits_{i=1}^n(f*g)(i)=\sum\limits_{i=1}^ng(i)S(\frac{n}{i})$

推导过程：
$$
\begin{aligned}
&\quad\sum_{i=1}^n\sum_{d|i}f(d)g(\frac{i}{d})\\
&=\sum_{d=1}^ng(d)\sum_{i=1}^{n/d}f(i)\cdots\text{先枚举 $d$ ，把 $g$ 提出来}\\
&=\sum_{d=1}^ng(d)S(\frac{n}{d})
\end{aligned}
$$

考虑移项，得到 $g(1)S(n)=\sum\limits_{i=1}^n(f*g)(i)-\sum_{i=2}^ng(d)S(\frac{n}{i})$

得到这个式子我们又怎么做？

我们若是可以快速求得 $\sum\limits_{i=1}^n(f*g)(i)$ 那么就可以递归解 $S(\frac{n}{i})$

代码大概长这个样子


```cpp
typedef long long ll

ll fg_sum(ll n);//计算 f*g 的前缀和
ll gsum(ll n);//计算 g 的前缀和
ll GetSum(ll n)
{
	ll ans=fg_sum(n);

	/*数论分块求第二项*/
	for(ll l=2,r;l<=n;l=r+1)
	{
		r=(n/(n/l));
		ans-=(gsum(r)-gsum(l-1))*GetSum(n/l);//递归求解
	}
	return ans;
}
```

这样直接算的时间复杂度就是 $O(n^{\frac{3}{4}})$

我们还可以进一步优化。

我们可以先线筛前 $m$ 个值，然后再杜教筛。

这样优化下来我们可以做到 $O(n^{\frac23})$ 的时间复杂度，但是会损失一些空间复杂度。

并且如果询问请求较多我们可以用hash记忆化求过的 $S$ 值，进一步优化常数。

现在来看例题：

### P4213『模板』杜教筛

2s/512M

给定一个正整数 $n$ ，求：

$$
Ans1=\sum_{i=1}^n\varphi(i)\\
Ans2=\sum_{i=1}^n\mu (i)
$$

#### 输入格式：

多组数据。

第一行为一个整数，为数据组数 $T$

接下来 $T$ 行，每行一个正整数 $n$ ，表示一组询问。

#### 输出格式

对于每组询问输出一行两个整数 $Ans1,Ans2$ 用空格隔开。

#### 数据范围

$1\le T \le 10\ ,\ 1\le n\le 2^{31}$

#### 解析

明显的杜教板子。

我们要想想 $\mu$ 和哪个函数的前缀和比较好算。

根据狄利克雷卷积的有关公式，$\mu * I= \epsilon$

这还不简单？

```cpp
ll GetSum1(ll n)
{
	if(n<= nn) return mu[n];//提前筛好的前缀和+记忆化，懒得hash了
	if(mu[n]) return mu[n];
	ll ans=1ll;//单位元 ε 的前缀和就是1

	/*数论分块求第二项*/
	for(ll l=2,r;l<=n;l=r+1)
	{
		r=(n/(n/l));
		ans-=(r-(l-1))*GetSum(n/l);//递归求解
	}
	return ans;
}
```

再看 $\varphi$ ，我们能知道 $\varphi*I=id$ 。

$id$ 的前缀和就是 $\frac{n(n+1)}{2}$

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=7e7+6e6+10,nn=1<<23;

ll pr[N],mu[N],phi[N],tot=0;
bool mp[N];

void init()
{
	ll n=nn;
	mu[1]=mp[1]=phi[1]=1;
	for(ll i=2;i<=n;++i)
	{
		if(!mp[i]) pr[++tot]=i, phi[i]=i-1, mu[i]=-1;
		for(ll j=1;pr[j]*i<=n;++j)
		{
			ll tmp=pr[j]*i;
			mp[tmp]=1;
			if(i%pr[j]==0)
			{
				mu[tmp]=0;
				phi[tmp]=phi[i]*pr[j];
				break;
			}
			mu[tmp]=mu[i]*-1ll;
			phi[tmp]=phi[i]*(pr[j]-1ll);
		}
	}
	for(ll i=1;i<=n;++i)
	{
		mu[i]+=mu[i-1];
		phi[i]+=phi[i-1];
	}
}

ll GetSum1(ll n)
{
	if(n<=nn) return phi[n];
	if(n<N&&phi[n]) return phi[n];
	ll ans=n*(n+1ll)/2;

	for(ll l=2,r;l<=n;l=r+1)
	{
		r=(n/(n/l));
		ans-=(r-l+1ll)*GetSum1(n/l);
	}
	if(n<N) return phi[n]=ans;
	else return ans;//下标太大，不存了
}

ll GetSum2(ll n)
{
	if(n<= nn) return mu[n];//提前筛好的前缀和+记忆化
	if(n<N&&mu[n]) return mu[n];
	ll ans=1ll;//单位元 ε 的前缀和就是1

	/*数论分块求第二项*/
	for(ll l=2,r;l<=n;l=r+1)
	{
		r=(n/(n/l));
		ans-=((ll)r-(l-1))*GetSum2(n/l);//递归求解
	}
	if(n<N) return mu[n]=ans;
	else return ans;//下标太大，不存了
}

int main()
{
	init();
	int t;
	scanf("%d",&t);
	while(t--)
	{
		ll n;
		scanf("%lld",&n);
		ll ans1=GetSum1(n);
		ll ans2=GetSum2(n);
		printf("%lld %lld\n",ans1,ans2);
	}
	return 0;
}

```
