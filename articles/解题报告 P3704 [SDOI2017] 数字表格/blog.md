---
title: "解题报告 P3704 [SDOI2017] 数字表格"
slug: legacy-1b249b83ccf6
tree:
  - "题解"
tags:
  - 分块
date: 2026-08-15
uid: 2a983a42-7b2b-4601-b98e-907de6e94316
dateKind: collected
---
## P3704 [SDOI2017] 数字表格

经典莫反。

题目要求：
$$
\prod_{i=1}^n\prod_{j=1}^m fib(\gcd(i,j))
$$

不妨令 $n<m$。套路地，我们设 $\gcd(i,j)=d$，然后枚举 $d$：

$$
\begin{aligned}
&\quad\prod_{d=1}^n\prod_{i=1}^n\prod_{j=1}^mfib(d)^{[\gcd(i,j)==d]}\\
&=\prod_{d=1}^nfib(d)^{\sum_{i=1}^n\sum_{j=1}^m[\gcd(i,j)==d]}
\end{aligned}
$$

指数单独提出来

$$
\begin{aligned}
&\quad\sum_{i=1}^n\sum_{j=1}^m[\gcd(i,j)==d]\\
&=\sum_{i=1}^{n/d}\sum_{j=1}^{m/d}[\gcd(i,j)==1]
\end{aligned}
$$

套路地设

$$
f(x)=\sum_{i=1}^{p}\sum_{j=1}^{q}[\gcd(i,j)==x]\\
g(x)=\sum_{x|d}f(d)
$$

那么
$$
f(x)=\sum_{x|d}\mu(\frac dx)g(d)\\
\Rightarrow f(1)=\sum_{d=1}^p\mu(d)g(d)
$$

从含义出发，
$$
\begin{aligned}
g(x)&=\sum_{i=1}^p\sum_{j=1}^q[x|\gcd(i,j)]\\
&=\sum_{i=1}^{p/x}\sum_{j=1}^{q/x}[1|\gcd(i,j)]\\
&=\lfloor\frac px\rfloor \cdot \lfloor\frac qx\rfloor
\end{aligned}
$$

所以
$$
\begin{aligned}
f(1)=\sum_{i=1}^p\mu(i)\cdot\lfloor\frac pi\rfloor\cdot\lfloor\frac qi\rfloor
\end{aligned}
$$

所以原式即为：
$$
\prod_{d=1}^nfib(d)^{\sum_{i=1}^{n/d}\mu(i)\cdot\lfloor\frac pi\rfloor\cdot\lfloor\frac qi\rfloor}
$$

对一个确定的 $d$ ，指数可以 $O(\sqrt n)$ 做，同时注意到对于 $n/d$ 也可以套一层整除分块，总复杂度 $O(\sqrt n\cdot\sqrt n)=O(n)$。考虑到 $\sum n\le 10^9$ 与快速幂以及大量取模等操作带来的巨大常数的存在，并不能通过此题。

我们继续观察指数：

$$
\prod_{d=1}^nfib(d)^{\sum_{i=1}^{n/d}\mu(i)\cdot\lfloor\frac n{id}\rfloor\cdot\lfloor\frac m{id}\rfloor}
$$

令 $T=id$：

$$
\begin{aligned}
&\quad \prod_{T=1}^n\left(\prod_{d|T}fib(d)^{\mu(\frac Td)} \right)^{\lfloor\frac nT \rfloor\cdot\lfloor\frac mT\rfloor}\\
\end{aligned}
$$

外面这一块可以整除分块，里面可以 $O(n\log n)$ 预处理。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e6+10,mod=1e9+7;

ll fpow(ll a,ll k)
{
	ll res=1;
	while(k)
	{
		if(k&1) res=(res*a)%mod;
		a=(a*a)%mod;
		k>>=1;
	}
	return res%mod;
}

ll p[N],mu[N],tot=0,fib[N],infib[N];
ll F[N],inF[N];
bool mp[N];
void init(ll n)
{
	fib[1]=1; infib[0]=1;
	for(int i=2;i<=n;i++) fib[i]=(fib[i-1]+fib[i-2])%mod,F[i]=1;
	for(int i=1;i<=n;i++) infib[i]=fpow(fib[i],mod-2);
	mu[1]=1;
	for(ll i=2;i<=n;i++)
	{
		if(!mp[i]) p[++tot]=i,mu[i]=-1;
		for(int j=1;p[j]*i<=n;j++)
		{
			ll tmp=p[j]*i;
			mp[tmp]=1;
			if(i%p[j]==0)
			{
				mu[tmp]=0;
				break;
			}
			mu[tmp]=mu[i]*(-1);
		}
	}

	F[0]=F[1]=1;
	for(int i=1;i<=n;i++)//求中间那一坨
	{
		if(mu[i]==0) continue;
		for(int T=i;T<=n;T+=i)
			F[T]=(F[T]*(mu[i]==1?fib[T/i]:infib[T/i]))%mod;
	}
	for(int i=2;i<=n;i++) F[i]=(F[i]*F[i-1])%mod;//前缀积
	for(int i=0;i<=n;i++) inF[i]=fpow(F[i],mod-2);//逆元
}

int main()
{
	int t;
	scanf("%d",&t);
	init(N-10);
	while(t--)
	{
		ll n,m;
		scanf("%lld%lld",&n,&m);
		ll minn=min(n,m),ans=1;
		for(ll l=1,r;l<=minn;l=r+1)
		{
			r=min(minn,min(n/(n/l),m/(m/l)));
			ll rev=F[r]*inF[l-1]%mod;
			ans=(ans*fpow(rev,(n/l)*(m/l)%(mod-1)))%mod;
		}
		printf("%lld\n",ans%mod);
	}
	return 0;
}
```
