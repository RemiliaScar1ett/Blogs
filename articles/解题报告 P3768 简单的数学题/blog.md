---
title: "解题报告 P3768 简单的数学题"
slug: legacy-d8e11421b011
tree:
  - "题解"
tags:
  - 莫比乌斯反演
  - 分块
date: 2026-08-15
uid: 7b11fcaf-7623-4614-b2ea-f274ed746be6
dateKind: collected
---
# P3768 简单的数学题

给定 $n,p$，求 ：

$$\sum_{i=1}^n\sum_{j=1}^nijgcd(i,j)\quad (\mod p)$$

$n\le 10^{10},5\times 10^{8} \le p\le 1.1\times 10^{10}$

话不多述直接开始推式子。

令 $gcd(i,j)=d$：

$$
\begin{aligned}
&\quad\sum_{i=1}^n\sum_{j=1}^nijgcd(i,j)\\
&=\sum_{d=1}^nd\sum_{i=1}^n\sum_{j=1}^nij[gcd(i,j)=d]\\
&=\sum_{d=1}^nd^3\sum_{i=1}^{n/d}\sum_{j=1}^{n/d}ij[gcd(i,j)=1]
\end{aligned}
$$

设:

$$f(x)=\sum_{i=1}^{n/d}\sum_{j=1}^{n/d}ij[gcd(i,j)=x]$$

$$F(x)=\sum_{x|i}f(i)$$

可以知道要求的是 $f(1)$

莫比乌斯反演得到：

$$
\begin{aligned}
&\quad f(x)=\sum_{x|i}\mu(\frac ix)F(i)\\
&\Rightarrow f(1)=\sum_{i=1}^{n/d}\mu(i)F(i)\\
&\because F(x)=\sum_{i=1}^{n/d}\sum_{j=1}^{n/d}ij[x|gcd(i,j)]\\
&\quad =x^2\sum_{i=1}^{n/dx}\sum_{j=1}^{n/dx}ij\\
&\quad =x^2(\sum_{i=1}^{n/dx}i)^2\\
&\therefore Ans=\sum_{d=1}^{n}d^3\sum_{i=1}^{n/d}\mu(i)i^2(\sum_{j=1}^{n/id}j)^2
\end{aligned}
$$

设 $T=id,sum(x)=\sum\limits_{i=1}^xi$ ，则 $i=\frac Td$，。

$$
\begin{aligned}
Ans&=\sum_{T=1}^nsum(\frac nT)^2\sum_{d|T}d^3(\frac Td)^2\mu(\frac Td)\\
&=\sum_{T=1}^n sum(\frac nT)^2\cdot T^2\sum_{d|T}d\mu(\frac Td)
\end{aligned}
$$

联想到 $\mu *id=\varphi$，我们可以得到：

$$Ans=\sum_{T=1}^nsum(\frac nT)^2\cdot T^2\varphi(T)$$

前面的 $sum(\frac nT)^2$ 可以数论分块求，现在我们看看后面这块能不能求前缀和。

重新定义 $f(x)=x^2\varphi(x)$，我们发现它是一个积性函数。

先设 $S(n)=\sum\limits_{i=1}^nf(i)$，然后把杜教筛的式子摆在这里：

$$g(1)S(n)=\sum_{i=1}^n(f*g)(i)-\sum_{i=2}^ng(i)S(\frac ni)$$

我们想要快速求 $\sum f*g$。

先把 $\sum\limits_{i=1}^n(f*g)(x)$ 写开：

$$\sum\limits_{i=1}^n(f*g)(x)=\sum_{i=1}^n\sum_{d|i}g(\frac id)d^2\varphi(d)$$

我们考虑到 $\varphi*I=id\ \text{，即}\ \sum\limits_{d|n}\varphi (d)=n$，就要将 $d^2$ 因子消去，所以我们设 $g(x)=x^2$

$$
\begin{aligned}
&\quad \sum_{i=1}^n\sum_{d|i}g(\frac id)d^2\varphi(d)\\
&=\sum_{i=1}^ni^2\sum_{d|i}\varphi(d)\\
&=\sum_{i=1}^ni^3
\end{aligned}
$$

由小学奥数知识它的值为 $sum(n)^2$。

总之：

$$S(n)=\sum_{i=1}i^3-\sum_{i=2}i^2S(\frac ni)$$

答案是

$$Ans=\sum_{T=1}sum(\frac nT)^2\cdot T^2\varphi(T)$$

数论分块后，前面半截可以直接求，后面半截可以用杜教筛在非线性时间里面处理出来。

时间在 $O(n^{\frac 34})$ 左右。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=8000010;

ll nn=N-10,mod;

ll pr[N],phi[N],tot=0;
bool mp[N];
unordered_map<ll,ll> f;

void init()
{
	int n=nn;
	phi[1]=mp[1]=1ll;
	for(int i=2;i<=n;++i)
	{
		if(!mp[i]) pr[++tot]=i, phi[i]=i-1;
		for(int j=1;j<=tot&&pr[j]*i<=n;++j)
		{
			ll tmp=1ll*i*pr[j];
			mp[tmp]=1;
			if(i%pr[j]) phi[tmp]=1ll*phi[i]*phi[pr[j]]%mod;
			else {phi[tmp]=1ll*phi[i]*pr[j]%mod; break;}
		}
	}

	for(int i=2;i<=n;++i)
		phi[i]=(phi[i-1]+1ll*phi[i]*i%mod*i%mod)%mod;
}

ll inv2,inv6;
ll fpow(ll a,ll k,ll mod)
{
	ll res=1; a%=mod;
	while(k)
	{
		if(k&1) res=res*a%mod;
		a=a*a%mod; k>>=1;
	}
	return (res+mod)%mod;
}

ll sum(ll x)
{
	x%=mod;
	return x*(x+1)%mod*inv2%mod;
}

ll sumP(ll x)
{
	x%=mod;
	return x*(x+1)%mod*(x+x+1)%mod*inv6%mod;
}

ll GetSum(ll n)
{
	if(n<=nn) return phi[n];
	if(f[n]) return f[n];
	ll res=sum(n);
	res=res*res%mod;
	for(ll l=2,r;l<=n;l=r+1)
	{
		r=n/(n/l);
		ll T=(sumP(r)-sumP(l-1))%mod;
		res-=GetSum(n/l)*T%mod;
		res%=mod;
	}
	return f[n]=(res+mod)%mod;
}


int main()
{
#ifdef test
	freopen("wa.txt","w",stdout);
#endif
	ll n;
	scanf("%lld%lld",&mod,&n);
	nn=min(n,nn);
	inv2=fpow(2,mod-2,mod),inv6=fpow(6,mod-2,mod);
	init();
	ll ans=0;
	for(ll l=1,r;l<=n;l=r+1)
	{
		r=n/(n/l);
		ll Sum=sum(n/l);
		Sum=Sum*Sum%mod;
		ll T=(GetSum(r)-GetSum(l-1))%mod;
		ans+=Sum*T%mod;
		ans%=mod;
//		cout<<GetSum(r)<<" "<<r<<"\n";
	}
//	cout<<"-1 -1\n";
	printf("%lld",(ans+mod)%mod);
	return 0;
}

```
