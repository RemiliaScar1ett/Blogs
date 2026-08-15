---
title: "P1829 [国家集训队]Crash的数字表格"
slug: legacy-64ba2a46ccf5
tree:
  - "题解"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## P1829 [国家集训队]Crash的数字表格 / JZPTAB

\>[题目链接](https://www.luogu.com.cn/problem/P1829)<

**为了书写方便，本文中涉及的除法除特殊说明以外均向下取整**

### 题目描述
今天的数学课上，Crash 小朋友学习了最小公倍数（Least Common Multiple）。对于两个正整数 $a$ 和 $b$，$lcm(a,b)$ 表示能同时整除 $a$ 和 $b$ 的最小正整数。例如，$lcm(6,8)=24$。

回到家后，Crash 还在想着课上学的东西，为了研究最小公倍数，他画了一张 $n \times m$ 的表格。每个格子里写了一个数字，其中第 $i$ 行第 $j$ 列的那个格子里写着数为
$lcm(i,j)$。

看着这个表格，Crash 想到了很多可以思考的问题。不过他最想解决的问题却是一个十分简单的问题：这个表格中所有数的和是多少。当 $n$ 和 $m$ 很大时，Crash 就束手无策了，因此他找到了聪明的你用程序帮他解决这个问题。由于最终结果可能会很大，Crash 只想知道表格里所有数的和 $\bmod 20101009$ 的值。

### 输入格式
输入包含一行两个整数，分别表示 $n$ 和 $m$。

### 输出格式
输出一个正整数，表示表格中所有数的和 $\bmod 20101009$的值。

### 输入输出样例

输入
```
4 5
```
输出
```
122
```

---

### 解析

题目求
$$\sum_{i=1}^{n}\sum_{j=1}^{m}lcm(i,j)$$

不妨令 $n\leq m$，正确性显然。

由小学奥数，我们可知：$lcm(i,j)=\frac{ij}{gcd(i,j)}$

所以题目求的是
$$\sum_{i=1}^{n}\sum_{j=1}^{m}\frac{ij}{gcd(i,j)}$$

于是开始愉快(并不)推式子：令$gcd(i,j)=d$

$$
\begin{aligned}
& \sum_{i=1}^{n}\sum_{j=1}^{m}\frac{ij}{gcd(i,j)}\\
& =\sum_{d=1}^{n}\sum_{i=1}^{n}\sum_{j=1}^{m}[gcd(i,j)=d]\frac{ij}{d}\\
& =\sum_{d=1}^{n}\sum_{i=1}^{n/d}\sum_{j=1}^{m/d}[gcd(i,j)=1]\frac{id\cdot jd}{d}\\
& =\sum_{d=1}^{n}d\sum_{i=1}^{n/d}\sum_{j=1}^{m/d}[gcd(i,j)=1]ij
\end{aligned}\\
$$
后面这一团和GCD结论的形式很相似，我们可以依样画葫芦推一下。

对于上界 $n/d,m/d$ 不要想太多，可以当成 $p,q$ 或其他变量推就是了。
$$
\text{设：}f(x)=\sum_{i=1}^{p}\sum_{j=1}^{q}[gcd(i,j)=x]ij\\
 F(x)=\sum_{x|d}^{p}f(d)\\

由莫比乌斯反演得到:\\

f(x)=\sum_{x|d}\mu(\frac{d}{x})F(d)\\
f(1)=\sum_{i=1}^{p}\mu(i)F(i)
$$

现在看 $F(x)$ 如何求：

$$
\begin{aligned}
F(x)
& =\sum_{x|d}^{p}f(d)\\

& =\sum_{x|d}^{p}\sum_{i=1}^{p}\sum_{j=1}^{q}[gcd(i,j)=d]ij\\

& =\sum_{i=1}^{p}\sum_{j=1}^{q}[x|gcd(i,j)]ij\\

& =x^2\sum_{i=1}^{p/x}\sum_{j=1}^{q/x}ij\\

& =x^2\sum_{i=1}^{p/x}i\cdot \frac{(1+\frac{q}{x})\frac{q}{x}}{2}\\

& =x^2\cdot \frac{(1+\frac{p}{x})\frac{p}{x}}{2}\cdot\frac{(1+\frac{q}{x})\frac{q}{x}}{2}

\end{aligned}
$$

代入莫比乌斯反演式子后：

$$
Ans=\sum_{d=1}^{n}d\sum_{i=1}^{n/d}\mu(i)\cdot i^2\cdot\frac{(1+\frac{n}{id})\frac{n}{id}}{2}\cdot\frac{(1+\frac{m}{id})\frac{m}{id}}{2}\\

\text{令}g(n,m)=\sum_{i=1}^{n}\mu(i)\cdot i^2\cdot\frac{(1+\frac{n}{i})\frac{n}{i}}{2}\cdot\frac{(1+\frac{m}{i})\frac{m}{i}}{2}\\

Ans=\sum_{d=1}^{n}d\cdot g(\frac{n}{d},\frac{m}{d})
$$

对于 $g(\frac{n}{d},\frac{m}{d})$ ，我们可以数论分块求。

而对于整个式子，也是可以数论分块的。

总复杂度 $O(n+m)$ 。

**code**:(三年OI一场空，不开long long、unsigned long long见祖宗)
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

const ll N=1e7+10,mod=20101009;

int primes[N],tot=0;
ll mu[N],sum[N];
bool mp[N];

void init(int n)
{
	mu[1]=mp[1]=1;
	for(int i=2; i<=n; i++)
	{
		if(!mp[i]) primes[++tot]=i,mu[i]=-1;
		for(int j=1; i*primes[j]<=n; j++)
		{
			int x=primes[j]*i;
			mp[x]=1;
			if(i%primes[j]==0)
			{
				mu[x]=0;
				break;
			}
			mu[x]=-mu[i];
		}
	}

	for(int i=1; i<=n; i++)
		sum[i]=(sum[i-1]+1LL*i*i%mod*(mu[i]+mod))%mod;
}

inline ll func(ll n,ll m)
{
	return (1LL*(n+1)*n/2%mod)*1LL*((m+1)*m/2%mod)%mod;
}

ll solve(ll n,ll m)
{
	if(n>m) swap(n,m);
	ll res=0;
	for(int i=1,j=0; i<=n; i=j+1)
	{
		j=min(n/(n/i),m/(m/i));
		res=(res+1LL*(sum[j]-sum[i-1]+mod)*func(n/i,m/i)%mod)%mod;
	}
	return res;
}

int main()
{
	init(1e7);
	ll n,m;
	scanf("%lld%lld",&n,&m);
	if(n>m) swap(n,m);
	ll ans=0;
	for(int i=1,j=0; i<=n; i=j+1)
	{
		j=min(n/(n/i),m/(m/i));
		ans=(ll)(ans+1LL*(j-i+1)*(i+j)/2%mod*solve(n/i,m/i)%mod)%mod;
	}
	printf("%lld",ans);
	return 0;
}
```
