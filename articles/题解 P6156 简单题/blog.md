---
title: "题解 P6156 简单题"
slug: legacy-1c54a6783fdb
tree:
  - "题解"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## P6156 简单题

简单题(大嘘

首先，由肉眼观察可以得到： $f(x)=\mu^2(x)$

即题目求
$$\sum_{i=1}^n\sum_{j=1}^n (i+j)^k\mu^2(gcd(i,j))gcd(i,j)$$

开始推式子部分：令 $gcd(i,j)=d$，

$$
\begin{aligned}
\text{原式}&=\sum_{d=1}^nd\sum_{i=1}^n\sum_{j=1}^n(i+j)^k\mu^2(d)[gcd(i,j)=d]\\
&=\sum_{d=1}^{n}d^{k+1}\sum_{i=1}^{n/d}\sum_{j=1}^{n/d}(i+j)^k[gcd(i,j)=1]
\end{aligned}
$$

套路地设以下函数：

$$f(x)=\sum_{i=1}^{n/d}\sum_{j=1}^{n/d}(i+j)^k[gcd(i,j)=x]$$

$$F(x)=\sum_{x|i}f(i)$$

则

$$f(x)=\sum_{x|i}\mu(\frac{i}{x})F(i)$$
$$\Rightarrow f(1)=\sum_{i=1}^{n/d}\mu(i)F(i)$$

下面化简 $F(x)$

$$
\begin{aligned}
F(x)&=\sum_{x|i}\sum_{j=1}^{n/d}\sum_{r=1}^{n/d}(j+r)^k[gcd(j,r)=x]\\
&=\sum_{j=1}^{n/d}\sum_{r=1}^{n/d}(j+r)^k[x|gcd(i,j)]\\
&=x^k\sum_{j=1}^{n/xd}\sum_{r=1}^{n/xd}(j+r)^k
\end{aligned}
$$

那么：

$$Ans=\sum_{d=1}^n d^{k+1}\mu(d)\sum_{i=1}^{n/d}\mu(i)i^k\sum_{j=1}^{n/id}\sum_{r=1}^{n/id}(j+r)^k$$

令 $T=id\ ,\ Sum(x)=\sum\limits_{i=1}^{x}\sum\limits_{j=1}^{x}(i+j)^k$，则:

$$
Ans=\sum_{T=1}^nT^kSum(\frac{n}{T})\sum_{d|T}d\mu^2(d)\mu{\frac{T}{d}}
$$

式子主要分为两部分需要我们集中精力处理 $Sum(\frac{n}{T})$ 和 $\sum\limits_{d|T}d\mu^2(d)\mu(d)$。

1. **$Sum(x)$**

    以 $x=2,3$ 为例，我们将这个东西写开，试图找寻规律：

    $$
    \begin{array}{cl}
    x=2 & , &Sum(x)=2^k+2\times 3^k+4^k\\
    x=3 & , &Sum(x)=2^k+2\times 3^k+3\times 4^k+2\times 5^k+6^k\\
    \end{array}
    $$

    观察得到，它的系数是一个形似 $\{1,2,3,2,1\}$ 的从 $1$ 开始的连续回文数列。

    我们试图将 $Sum(n)$ 展开，穷举第一个求和积分的变量 $i$ 并将各项列在下面，寻找这个规律的一般性：

    $$
    \begin{array}{cc}
    &j=1&j=2&j=3& &j=n-1&j=n\\
    i=1  & 2^k, & 3^k, & 4^k,& \cdots &  n^k, &(n+1)^k\\
    i=2  & 3^k, & 4^k, & 5^k,& \cdots & (n+1)^k, &(n+2)^k\\
    i=3  & 4^k, & 5^k ,& 6^k,& \cdots & (n+2)^k, &(n+3)^k\\
    \vdots \\
    i=n  & (n+1)^k, & (n+2)^k & (n+3)^k, & \cdots  & (n+n-1)^k, & (n+n)^k\\
    \end{array}
    $$

    加法合并同类项时刚好就是在合并上表对角线以及对角线的平行线上的项。由于这个矩阵长宽相等，所以是系数一个从 $1$ 开始的回文数列，这个规律具有普遍性。

    那么这个东西怎么求呢？画一个图或许就能明白：

    横坐标表示第几项，图形在某一横坐标上的最大纵坐标减最小纵坐标是系数。

    ![](./images/image-39a7c3fa9da6bfc6.png)

    红色就是我们要求的部分，黄色是将图形补齐后多出的部分。

    那么 $Sum(n)=\sum\limits_{i=n+1}^{2n}\sum\limits_{j=1}^{i}j^k-\sum\limits_{i=1}^n\sum\limits_{j=1}^{i}j^k=\sum\limits_{i=1}^{2n}\sum\limits_{j=1}^{i}j^k-2\sum\limits_{i=1}^n\sum\limits_{j=1}^{i}j^k$。

    令 $S(x)=\sum\limits_{i=1}^{x}i^k$，则 $Sum(x)=\sum\limits_{i=1}^{2x}F(i)-2\sum\limits_{i=1}^xF(i)$

    对于 $i^k,F(x),\sum F(x)$ ，由于 $i^k$ 是积性函数，可以 $O(n)$ 时间预处理出来，前缀和也可以 $O(n)$ 一起做掉。

2. **$f(T)=\sum_{d|T}d\mu^2(d)\mu(\frac{T}{d})$**

    观察形式可知：这是一堆积性函数卷在一起得到的式子，所以这个东西也一定是积性函数。

    但是这个函数的形式太怪，我们不好配函数使用杜教筛。

    所以我们直接考虑线性筛。

    假设我们线筛枚举到了一个质数 $p$，我们要知晓 $f(q)=f(i\times p^k),\quad (gcd(i,p^k)=1)$ 的值的情况。由于 $f$ 是积性函数，我们可以着重讨论 $f(p^k)$ 的值。

    当 $k=1$ 时，$f(p)=1\mu^2(1)\mu(p)+p\mu^2(p)\mu(1)=p-1$.

    当 $k=2$ 时，$f(p^2)=1\mu^2(1)\mu(p^2)+p\mu^2(p)\mu(p)+p^2\mu^2(p^2)\mu(1)=-p$

    当 $k>2$ 时，我们发现，对于每一项形如 $x\mu^2(x)\mu(\frac{p^k}{x})$ ，$x$ 与 $\frac{p^k}{x}$ 中必有一项是 $p^2$ 的倍数。也就是说，$f(p^k)=0$。

    于是根据这个巧妙的性质，我们只需要线筛中对枚举到的数 $i$ 判断有几个 $p$ 做为质因子即可。

综上，经过上面的 $O(n)$ 预处理后，对于答案式子：

$$Ans=\sum_{T=1}^nSum(\frac{n}{T})T^k\sum_{d|T}d\mu^2(d)\mu{\frac{T}{d}}$$

我们只需要整除分块即可，解决询问的时间复杂度 $O(\sqrt n)$。

code：(代码实现中我把 $T^k$ 和 $\sum\limits_{d|T}d\mu^2(d)\mu{\frac{T}{d}}$ 的前缀和合并到了一起)。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e7+10;
const ll mod=998244353;

ll n,k;
ll pr[N],tot=0;
bool mp[N];
ll powk[N<<1],F[N<<1],f[N<<1],S[N<<1];

ll fpow(ll a,ll k)
{
	ll res=1; a%=mod;
	while(k) {if(k&1) res=res*a%mod; a=a*a%mod; k>>=1; }
	return res;
}

void init(ll n,ll k)
{
	f[1]=powk[1]=mp[1]=1;
	for(ll i=2;i<=n;++i)
	{
		if(!mp[i]) pr[++tot]=(ll)i,f[i]=i-1,powk[i]=fpow(i,k);
		for(int j=1;(ll)pr[j]*i<=n;++j)
		{
			powk[pr[j]*i]=powk[pr[j]]*powk[i]%mod;
			mp[pr[j]*i]=1;
			if(i%pr[j]==0)
			{
				int tmp=i/pr[j];
				if(tmp%pr[j]) f[pr[j]*i]=(ll)f[tmp]*(mod-pr[j])%mod;
				break;
			}
			f[pr[j]*i]=(ll)f[i]*(pr[j]-1)%mod;
		}
	}
	for(int i=1;i<=n;i++)
	{
		f[i]=((ll)f[i]*powk[i]%mod+f[i-1])%mod;
		F[i]=(F[i-1]+powk[i])%mod;
	}
	for(int i=1;i<=n;i++)
		F[i]=(F[i-1]+F[i])%mod;
}

inline ll Sum(ll x) {return (F[2*x]-2*F[x])%mod;}

int main()
{
	scanf("%lld%lld",&n,&k);
	init(2*n+10,k);
	ll ans=0;
	for(int l=1,r;l<=n;l=r+1)
	{
		r=(n/(n/l));
		ans+=Sum(n/l)*(f[r]-f[l-1])%mod;
		ans%=mod;
	}
	printf("%lld",(ans%mod+mod)%mod);
	return 0;
}
```
