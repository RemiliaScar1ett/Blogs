---
title: "莫比乌斯函数"
slug: legacy-4eccc900f1da
tree:
  - "笔记"
  - "数论"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## 莫比乌斯函数(Möbius)


### 定义

定义莫比乌斯函数 $μ(x), x\in N^+$ ：

当 $x=p_1^{d_1}\cdot p_2^{d_2}\cdots p_k^{d_k}$ (唯一分解定理) 时，有：

$$
μ(x)=
\begin{cases}
0 & \exists\ d_i>1  \\
1 & k\text{是偶数}\\
-1 & k\text{是奇数}
\end{cases}
$$

显然，这是个数论函数。

### 性质

-  **$n\ne 0$时，$n$ 的所有因子的莫比乌斯函数值和为 $0$**

    $$\sum_{d|n}\mu (x)=
    \begin{cases}
    1 & n=1\\
    0 & n>1
    \end{cases}$$

    证明：

    1. $n=1$ 时显然成立。

    2. $n>1$ 时有：
        $$n=p_1^{d_1}\cdot p_2^{d_2}\cdots p_k^{d_k}$$

        $$\because \mu (d) \ne 0 \Rightarrow d=p_1p_2 p_3 \cdots p_t$$

        $$\text{故质因子个数为r的因子只有$C_k^r$个}$$

        $$\therefore \sum_{d|n}\mu (x)=C_k^0-C_k^1+C_k^2+\cdots+(-1)^kC_k^k=\sum_{i=0}^k(-1)^iC_k^i$$

        $$\because (x+y)^n=\sum_{i=0}^nC_n^ix^iy^{n-i}  \text{(二项式定理)}$$

        $$\text{将$x=1,y=-1$代入得证：} \sum_{i=0}^n(-1)^nC_n^i=0$$

- **莫比乌斯函数是积性函数**

    对任意 $n \in Z^+$ 有：
    $$\sum_{d|n} \frac{\mu (d)}{d}=\frac{\varphi(n)}{n}$$

    代入莫比乌斯反演公式 ~~(我也不会)~~ 即可。
### 应用

这个函数可用来解决如下问题：

与某个数 $N$ 互质的数的个数：

设 $S_p$ 表示$1 - n$ 中 $p$ 的倍数的个数。

则根据容斥原理，所求转化为如下式子：$N-S_2-S_3-\cdots +S_{2,3}+S_{2,5}+\cdots -S_{2,3,5}\cdots$

通过观察，每一个 $S$ 代表的集合的数的莫比乌斯函数就是这个 $S$ 的系数。

莫比乌斯函数可以利用筛法求出。

---

### 例题：破译密码

达达正在破解一段密码，他需要回答很多类似的问题：

对于给定的整数$a,b$和$d$，有多少正整数对$x,y$，满足$x<=a，y<=b$，并且$gcd(x,y)=d$。

作为达达的同学，达达希望得到你的帮助。

#### 输入格式
第一行包含一个正整数 $n$ ，表示一共有n组询问。

接下来 $n$ 行，每行表示一个询问，每行三个正整数，分别为 $a,b,d$ 。

#### 输出格式
对于每组询问，输出一个正整数，表示满足条件的整数对数。

#### 数据范围
$1≤n≤50000,
1≤d≤a,b≤50000$

---

#### 解析

考虑对于每一个询问如何做。

对于一组$1\leq x\leq a,1\le y\le b$

$gcd(x,y)=d\Rightarrow gcd(x^{\prime},y^{\prime})=1$
其中 $x^{\prime}=\frac{x}{d}\ ,\ y^{\prime}=\frac{y}{d}\ ,\ x^{\prime}\in[1,\lfloor\frac{a}{d}\rfloor],y^{\prime}\in[1,\lfloor\frac{b}{d}\rfloor]$

问题转化为：有多少对 $x^{\prime},y^{\prime}$ 互质。

可以考虑容斥定理：

$$Ans=a^{\prime}b^{\prime}-\lfloor\frac{a^{\prime}}{2}\rfloor\lfloor\frac{b^{\prime}}{2}\rfloor+\lfloor\frac{a^{\prime}}{3}\rfloor\lfloor\frac{b^{\prime}}{3}\rfloor-\lfloor\frac{a^{\prime}}{5}\rfloor\lfloor\frac{b^{\prime}}{5}\rfloor\cdots+\lfloor\frac{a^{\prime}}{6}\rfloor\lfloor\frac{b^{\prime}}{6}\rfloor+\cdots$$

记 $\lfloor\frac{a^{\prime}}{i}\rfloor\lfloor\frac{b^{\prime}}{i}\rfloor=S_i$

上面的式子很熟悉了，我们还可以继续化得下面的式子：

$$Ans=\sum_{i=1}^{min(a^{\prime},b^{\prime})}\lfloor\frac{a^{\prime}}{i}\rfloor\lfloor\frac{b^{\prime}}{i}\rfloor\cdot\mu (i)$$

直接做的话是 $O(n^2)$ 的。

考虑对于 $\lfloor\frac{a^{\prime}}{i}\rfloor$ ，有 $\lfloor\frac{a^{\prime}}{1}\rfloor，\lfloor\frac{a^{\prime}}{2}\rfloor，\cdots ，\lfloor\frac{a^{\prime}}{a^{\prime}}\rfloor$ 共 $a^{\prime}$ 项，但是不同的数只有 $2\sqrt{a^{\prime}}$ 个。 于是可以考虑 $O(\sqrt{n})$ 分块 , 复杂度变为 $O(n\sqrt{n})$ 可以接受。

下面解释一下为什么只有 $2\sqrt{a^{\prime}}$ 个分段：

令 $A(x)=\lfloor\frac{a^{\prime}}{x}\rfloor$

将序列分为两部分：$A(1) \sim A(\sqrt{a^{\prime}})\ ,\ A(\sqrt{a^{\prime}}+1) \sim A(a^{\prime})$

对于左边，显然有且只有 $\sqrt{n}$ 个取值。

对于右边，观察得知分母是恒大于 $\sqrt{a^{\prime}}$ 的，则整个项的值是恒小于 $\sqrt{a^{\prime}}$ 的，总共 $\sqrt{a^{\prime}}$ 个不同取值。

两边相加，得证。

然后是另外一个问题，怎么去求每一段。

这里定义：$g(x)$ 为 $\lfloor\frac{a^{\prime}}{x}\rfloor=k$ 时 $x$ 能够取到的最大整数。

即 $\lfloor\frac{a^{\prime}}{x}\rfloor=\lfloor\frac{a^{\prime}}{g(x)}\rfloor$ 且 $\lfloor\frac{a^{\prime}}{x}\rfloor > \lfloor\frac{a^{\prime}}{g(x)+1}\rfloor$

对于这个函数有这样一个很经典的公式 $g(x)=\Big\lfloor\frac{a^{\prime}}{\lfloor\frac{a^{\prime}}{x}\rfloor}\Big\rfloor$

这其实就是整除分块，在数论这一章我们将经常遇到。

 下面给出正确性证明(下面的 $a$ 其实是上面的 $a^{\prime}$)：

 $$\because g(x)=\Big\lfloor\frac{a}{\lfloor\frac{a}{x}\rfloor}\Big\rfloor$$

 $$ \therefore g(x) \geq \Big\lfloor\frac{a}{\frac{a}{x}}\Big\rfloor = x$$

 $$\therefore \lfloor \frac{a}{g(x)} \rfloor \leq \lfloor \frac{a}{x} \rfloor$$

 $$\because \Bigg\lfloor \frac{a}{\frac{a}{\lfloor\frac{a}{x}\rfloor}} \Bigg\rfloor \geq \lfloor \frac{a}{x} \rfloor\Rightarrow \Bigg\lfloor \frac{a}{\Big\lfloor\frac{a}{\lfloor\frac{a}{x}\rfloor}\Big\rfloor} \Bigg\rfloor \geq \lfloor \frac{a}{x} \rfloor$$

 $$\therefore \lfloor \frac{a}{g(x)} \rfloor \geq \lfloor \frac{a}{x} \rfloor $$

 $$\text{故 $\lfloor \frac{a}{g(x)} \rfloor = \lfloor \frac{a}{x} \rfloor$ 成立}$$

 $$\text{设 $a=kx+r , 0\leq r \leq x$ (带余除法)}$$

 $$\text{代入 $\lfloor\frac{a}{x}\rfloor > \lfloor\frac{a}{g(x)+1}\rfloor$ 得：} k>\Big\lfloor\frac{a}{\lfloor\frac{a}{k}\rfloor+1}\Big\rfloor$$

 $$k(\lfloor\frac{a}{k}\rfloor+1)>a$$

 $$\text{再设$a=pk+q,0\leq q < k$}$$

 $$\text{代入得：} k(p+1)>pk+q\Rightarrow k>q,\text{满足要求}$$

 $$\text{故 $\lfloor\frac{a}{x}\rfloor > \lfloor\frac{a}{g(x)+1}\rfloor$ 成立}$$

 有了这个结果，整个问题就简单多了。

code：
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=5e4+10;

int primes[N],cnt;
bool mp[N];
int mob[N],sum_[N];//莫比乌斯函数，前缀和

void init(int n)//线筛求莫比乌斯函数
{
	mob[1]=1;
	for(int i=2; i<=n; i++)
	{
		if(!mp[i])
		{
			primes[cnt++]=i;
			mob[i]=-1;//质数有两个一次质因子
		}
		for(int j=0; primes[j]*i<=n; j++)
		{
			int tmp=primes[j]*i;
			mp[tmp]=1;
			if(i%primes[j]==0)
			{
				mob[tmp]=0;//tmp有二次质因子
				break;
			}
			mob[tmp]=mob[i]*-1;//多了一个质因子
		}
	}

	for(int i=1; i<=n; i++) //前缀和
	{
		sum_[i]=sum_[i-1]+mob[i];
	}
}

int main()
{
	init(5e4);

	int n;
	scanf("%d",&n);
	for(int i=1; i<=n; i++)
	{
		int a,b,d;
		scanf("%d%d%d",&a,&b,&d);
		a/=d,b/=d;//问题转化
		int mina=min(a,b);

		ll res=0;
		for(int l=1,r; l<=mina; l=r+1) //分块
		{
			r=min(mina,min(a/(a/l),b/(b/l)));//每次只往后面跳一个较小的值
			res+=(sum_[r]-sum_[l-1])*(ll)(a/l)*(b/l);//核心式子
		}

		printf("%lld\n",res);
	}
	return 0;
}
```
