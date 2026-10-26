---
title: "题解 P3327 [SDOI2015]约数个数和"
slug: legacy-b27e2fef65a4
tree:
  - "题解"
tags:
  - 分块
date: 2026-08-15
uid: fda63f8c-4dcf-447f-a769-013c8b2e96e7
dateKind: collected
---
# P3327 [SDOI2015]约数个数和

求 $\sum\limits_{i=1}^n\sum\limits_{j=1}^md(ij)$

其中 $1\le n,m \le 5\times 10^4$。

乍一看我们是找不到任何思路的，所以我们要想一想函数有些什么性质。

约数个数和乘法有关，而题目中的 $d$ 的自变量又是乘积形式，所以我们从定义出发考虑，得到下面这个性质：

$$d(ij)=\sum\limits_{x|i}\sum\limits_{y|j}[gcd(x,y)=1]$$

文字叙述上就是说，$i\times j$ 的约数个数和就是 $i,j$ 各因子中两两互质的因子对个数和。

于是我们把它套进原式子：

$$
\begin{aligned}
\sum\limits_{i=1}^n\sum\limits_{j=1}^md(ij)
&= \sum\limits_{i=1}^n\sum\limits_{j=1}^m\sum_{x|i}\sum_{y|j}[gcd(x,y)=1]\\
&= \sum_{x=1}^n\sum_{y=1}^m\lfloor\frac{n}{x}\rfloor\lfloor\frac{m}{y}\rfloor[gcd(x,y)=1]
\end{aligned}
$$

熟悉多了。

我们设 $f(x)=\sum\limits_{i=1}^n\sum\limits_{j=1}^m\lfloor\frac{n}{i}\rfloor\lfloor\frac{m}{j}\rfloor[gcd(i,j)=x]$

$F(x)=\sum\limits_{x|d}f(d)$。

代入莫反公式：

$$f(x)=\sum_{x|d}\mu(\frac{d}{x})F(d)$$

由 $f(x)$ 的定义可以知道我们要求的是 $f(1)$

$$f(1)=\sum_{i=1}^n\mu(i)F(i)$$

现在我们要想办法求 $F(i)$

从定义出发可以知道：
$$
\begin{aligned}
F(x)
&=\sum_{i=1}^n\sum_{j=1}^m\lfloor\frac{n}{i}\rfloor\lfloor\frac{m}{j}\rfloor[x|gcd(i,j)]\\
&=\sum_{i=1}^{n/x}\sum_{j=1}^{m/x}\lfloor\frac{n}{ix}\rfloor\lfloor\frac{m}{jx}\rfloor\\
&=\sum_{i=1}^{n/x}\lfloor\frac{n}{ix}\rfloor\sum_{j=1}^{m/x}\lfloor\frac{m}{jx}\rfloor
\end{aligned}
$$

下面我们单独提出一个函数 $h(x)=\sum\limits_{i=1}^{x}\lfloor\frac{x}{i}\rfloor$，发现这个东西能够数论分块 $O(\sqrt{n})$。

$$\therefore F(x)=h(\frac{n}{x})\cdot h(\frac{m}{x})$$

结合求解式子 $ans=\sum\limits_{i=1}^n\mu(i)F(i)$

总复杂度 $O(T\sqrt n)$

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=5e4+10;
int pr[N],tot=0,mu[N],sum[N];
bool mp[N];
ll h[N];

int get(int k,int x)//整除分块结论
{
	return k/(k/x);
}

void init(int n)
{
	mu[1]=1;
	for(int i=2;i<=n;i++)
	{
		if(!mp[i]) mu[i]=-1,pr[++tot]=i;
		for(int j=1;pr[j]*i<=n;j++)
		{
			int tmp=pr[j]*i;
			mp[tmp]=1;
			if(i%pr[j]==0) break;
			mu[tmp]=-mu[i];

		}
	}
	for(int i=1;i<=n;i++)
		sum[i]=sum[i-1]+mu[i];

	for(int i=1;i<=n;i++)//预处理h(x)
	{
		for(int l=1,r;l<=i;l=r+1)
		{
			r=min(i,get(i,l));
			h[i]+=(r-l+1)*(i/l);
		}
	}
}

int main()
{
	init(N-10);//预处理h(x),mu(x)
	int t;
	scanf("%d",&t);
	while(t--)
	{
		int n,m;
		scanf("%d%d",&n,&m);
		ll res=0;
		int nn=min(n,m);
		for(int l=1,r;l<=nn;l=r+1)
		{
			r=min(nn,min(get(n,l),get(m,l)));
			res+=(ll)(sum[r]-sum[l-1])*h[n/l]*h[m/l];
		}
		printf("%lld\n",res);
	}
	return 0;
}
```
