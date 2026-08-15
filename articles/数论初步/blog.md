---
title: "数论初步"
slug: legacy-6511b52fa3ff
tree:
  - "笔记"
  - "数论"
tags:
  - "旧文迁移"
date: 2026-08-15
---
### 前置知识

1.**唯一分解定理**

也称算术基本定理，任何一个大于 $1$ 的自然数，都可以唯一分解成有限个质数的乘积。即质因数分解。

2.**同余**：

**定义**：设 $m$ 是给定的一个正整数，$a,b$ 是整数，若满足 $m\mid (a-b)$ ，则称 $a$ 与 $b$ 对模 $m$ 同余，记为 $a\equiv b(\mod m)$。这个式子称为 模 $m$ 的同余式。

同余概念又常表达为：

1.$a=b+km,(k\in Z)$

2.$a$ 与$b$ 被 $m$ 除时有相同的余数。

**性质**

1. 同余式可以逐项相加：

若$a_1 \equiv b_1 (\mod m),a_2 \equiv b_2 (\mod m),a_2 \equiv b_2 (\mod m),\dots,a_n \equiv b_n (\mod m)$，则
$$a_1+a_2+\dots+a_n\equiv (b_1+b_2+\dots+b_n)(\mod m)$$

2. 同余式可以移项，需要反号。

若$a+c \equiv b(\mod m)$，则
$$a\equiv b-c(\mod m)$$

3. 同余式可以逐项相乘，类似相加。

4. 同余式每一边边可以加上或减去模 $m$ 的任意倍数。

若 $a\equiv b(\mod m)$ ，则$a\pm km\equiv b(\mod m)$

5. 同余式两边的数如有公约数，此公约数又和模互素，那么就可以把两边的数除以这个公约数。

若 $a\equiv b(\mod m)$ 且$a=a_1d,b=b_1d,gcd(m,d)=1$, 则$a_1\equiv b_1\pmod m$

6. 同余式两边的数和模可以同时乘上一个整数。

若 $a\equiv b\pmod m$ ，则 $ak\equiv bk\pmod {mk}$

7. 同余式两边的数和模可以同时被它们任一公约数除。

若 $a\equiv b\pmod m$ 且$a=a_1d,b=b_1d,m=m_1d$,则$a_1\equiv b_1\pmod {m_1}$

8. 如果同余式对于模m成立，那么它对于m的任意约数相等的模d也成立。

若 $a\equiv b\pmod m$ 且$m=m_1d$ ,则$a\equiv b\pmod d$

9. 如果同余式一边上的数和模能被某个数除尽，则同余式的另一边的数也能被这个数除尽。

若 $a\equiv b\pmod m ,a\mid k,m\mid k,$ 则，$b\mid k$。

10. 同余式一边上的数与模的最大公约数，等于另一边上的数与模的最大公约数。

若 $a\equiv b\pmod m$，则$(a,m)=(b,m)$

---
### 1.求正整数 $N$ 的所有约数和

若正整数 $N$ 在唯一分解定理中：
$$N=p_{1}^{k_1} \cdot p_{2}^{k_2} \cdot p_{3}^{k_3}... \cdot p_{m}^{k_m}$$
则有约数和:
$$sum=\prod_{i=1}^m {(\sum_{j=1}^{k_i} p_i^j)}$$

---
### 2.求正整数 $N$ 的约数个数：

若正整数 $N$ 在唯一分解定理中:
$$N=p_{1}^{k_1} \cdot p_{2}^{k_2} \cdot p_{3}^{k_3}... \cdot p_{m}^{k_m}$$
则其约数个数

$$sum= \prod_{i=1}^m (k_i+1)$$

---

### 3.求出正整数的所有约数

试除法：~~暴力大法好~~
```cpp

void func(int n)//n为要求的数
{
	for(int i=1;i<=n/i;i++)
	{
		if(n%i==0)
		{
			var[++tot]=i;//用var来存储因数
			if(i!=n/i) var[++tot]=n/i;//因数是成对的、但√(n)两个因数一样
		}
	}
	sort(var+1,var+1+tot);//让因数顺序从小到大
}
```

---


### 4.**欧拉函数**

欧拉函数 $\varphi(x)$ 是指 $1-n$ 中与$n$ 互质的数的个数

若在唯一分解定理中，$N=p_{1}^{k_1} \cdot p_{2}^{k_2} \cdot p_{3}^{k_3}... \cdot p_{m}^{k_m}$,

则

$$ \varphi(N)=N (1-\frac1 p_1)(1-\frac1 p_2)......(1-\frac1 p_m), (1)$$


**容斥原理求法**：

1.从 $1-N$ 中去掉 $p_1,p_2,......p_k$ 的所有倍数

$$N - \frac{N}{p_1} - \frac{N}{p_2}-\frac{N}{p_3}-...\frac{N}{p_k}$$

2.加上所有 $p_i \cdot p_j$ 的倍数
$$+ \frac{N}{p_1p_2}+\frac{N}{p_2p_3}+...$$

3.减去所有 $p_i \cdot p_j \cdot p_k$ 的倍数

$$-\frac{N}{p_1p_2p_3}-\frac{N}{p_2p_3p_4}-...$$

4.加上所有 $p_i \cdot p_j \cdot p_k \cdot p_l$

$$+\frac{N}{p_1p_2p_3p_4}+...$$

以此类推$......$

最后得到的式子，恒等变形之后与 $(1)$ 式相同。


**递推(筛法)求欧拉函数：**

由 $(1)$ 式可得如下关系：当 $p_j$ 是 $i$ 的一个质因子时

$$\varphi(i\times p_j)=\varphi(i)\times p_j$$

结合线筛，便可得到以下代码
```cpp
int n;
int primes[N],tot=0;
bool mp[N];
int phi[N];

long long get_eular(int n)
{
	phi[1]=1;
	for(int i=2;i<=n;i++)
	{
		if(!mp[i])
		{
			primes[tot++]=i;
			phi[i]=i-1;
		}
		for(int j=0;primes[j]*i<=n;j++)
		{
			mp[primes[j]*i]=1;
			if(i%primes[j]==0)
			{
				phi[primes[j]*i]=phi[i]*primes[j];//核心递推式
				break;
			}
			phi[primes[j]*i]=phi[i]*(primes[j]-1);//核心递推式
		}
	}
	long long sum=0;//求所有数的欧拉函数和
	for(int i=1;i<=n;i++)
		sum+=phi[i];
	return sum;
}

```

---

### 5.欧拉定理

**若 $a$ 与 $n$ 互质，则 :
$a^{\phi(n)}\equiv 1(\mod n)$**(定理5.1)

由定义不难看出，欧拉定理是费马小定理的扩展。

**简易证明:**

设$1\sim n$中，与$n$互质的数为$a_1,a_2,a_3,a_4...a_{\phi(n)}$。

$\because a$ 与 $n$ 互质

$\therefore aa_1,aa_2,aa_3...aa_{\phi(n)}$ 互质于 $n$

则易得：
$$aa_1 \cdot aa_2 \cdot aa_3 \cdot ... \cdot aa_{\phi(n)}\equiv a_1  \cdot a_2 \cdot a_3 \cdot ... a_{\phi(n)}(\mod n)$$

$$a^{\phi(n)} \cdot (a_1 \cdot a_2 \cdot ... \cdot a_{\phi(n)}) \equiv a_1  \cdot a_2 \cdot a_3 \cdot ... a_{\phi(n)}(\mod n)$$
消去得：
$$a^{\phi(n)}\equiv 1(\mod n)$$

---

### 6.逆元

**定义**：若对任意正整数$a,b$有$\frac{a}{b}\equiv a \cdot x (\mod m)$，则称 $x$ 为 $b$ 的模 $m$ 逆元，简记为$b^{-1}$。

**变形**：$b \cdot b^{-1}\equiv 1(\mod m)$

可利用扩展欧几里得算法解线性同余方程来求逆元。

若$m$为质数时，满足费马小定理：

$$b^{m-1}\equiv 1(\mod m)$$

$$\Rightarrow b \cdot b^{m-2}\equiv 1(\mod m)$$

**即对于任意正整数 $b$ ，其模任意不整除 $b$ 的质数 $m$ 的乘法逆元是 $b^{m-2}$。**(定理6.1)

对于模数为质数的情况，可使用快速幂来求逆元。
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

ll fpow(int a,int k,int p)
{
	int res=1;
	while(k)
	{
		if(k&1) res=(ll)res*a%p;
		k>>=1;
		a=(ll)a*a%p;
	}
	return res;
}

int main()
{
	int n;
	scanf("%d",&n);
	while(n--)
	{
		int a,k,p;
		scanf("%d%d",&a,&p);

		int res=fpow(a,p-2,p);
		if(a%p) printf("%d\n",res);
		else puts("impossible");//整除
	}
	return 0;
}
```

---
### 7.裴蜀定理

对于任意一对正整数 $a,b$ ，一定存在整数 $x,y$ 使得 $ax+by=gcd(a,b)$。(定理7.1)

构造性证明：扩展欧几里得算法
```cpp
int exgcd(int a,int b,int &x,int &y)
{
	if(!b)
	{
		x=1,y=0;
		return a;
	}
	int d=exgcd(b,a%b,y,x);
	y-=a/b*x;
	return d;
}
```
---

### 8.求解线性同余方程

对于线性同余方程$ax\equiv b(\mod m)$

$\exists y\in Z,st:ax=my+b$

$\Rightarrow ax-my=b$;
令$y^{\prime}=-y$

则$ax+my^{\prime}=b$

不难看出可以使用扩欧解此方程

当$(a,b)\mid b$时，无解；

当$(a,b)\nmid b$时，有解。

**code**:
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

ll exgcd(int a,int b,int &x,int &y)
{
	if(!b)
	{
		x=1;y=0;
		return a;
	}
	int d=exgcd(b,a%b,y,x);
	y-=a/b*x;
	return d;
}

int main()
{
	int n;
	scanf("%d",&n);
	while(n--)
	{
		int a,b,m;//输入a,b,m
		scanf("%d%d%d",&a,&b,&m);
		int x, y;
		x=(x%m+m)%m;//转化为最小正整数解
		int d=exgcd(a,m,x,y);
		if(b%d) puts("impossible");
		else printf("%lld\n",(ll)x*(b/d)%m);
	}

	return 0;
}
```
---

### 9.高斯消元解线性方程组

对于方程：
$$
\begin{cases}
a_{1_1}x_1+a_{1_2}x_2+ \cdots +a_{1_n}x_n=b_1\\
a_{2_1}x_1+a_{2_2}x_2+ \cdots +a_{2_n}x_n=b_2\\
\vdots\\
a_{n_1}x_1+a_{n_2}x_2+ \cdots +a_{n_n}x_n=b_n\\
\end{cases}
$$

其系数矩阵为
$$
\begin{bmatrix}
a_{1_1}&a_{1_2}&\dots&a_{1_n}&b_1\\
a_{2_1}&a_{2_2}&\dots&a_{2_n}&b_2\\
\vdots&\vdots&&\vdots&\vdots\\
a_{n_1}&a_{n_2}&\dots&a_{n_n}&b_n\\
\end{bmatrix}
$$

通过初等行列变换，转换为上三角形式：
$$
\begin{cases}
a_{1_1}x_1+a_{1_2}x_2+ \cdots +a_{1_n}x_n=b_1\\
a_{2_2}x_2+ \cdots +a_{2_n}x_n=b_2\\
\vdots\\
x_n=b_n\\
\end{cases}
$$

当转化后为完美阶梯形时，有唯一解

否则：无解$(\text{非0}=0)$或有无穷多组解$(0=0)$

**高斯消元步骤:**

枚举每一列c：

1.找到绝对值最大的一行，将这一行与顶行交换位置，这行不再移动。

2.等式两边同除，将该行第一个数变为 $1$。

3.通过等式之间加减，将当前列下面的所有数消为$0$。

重复至最后一列，然后回代求解。

**code:**
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=110;
const double eps=1e-6;//精度限制

int n;
double a[N][N];

int gauss()
{
	int c,r;//c表示在枚举哪一列，r表示在枚举哪一行
	for(c=0,r=0;c<n;c++)
	{
		int t=r;
		for(int i=r;i<n;i++)
		{
			if(fabs(a[i][c])>fabs(a[t][c]))//定位
				t=i;
		}

		if(fabs(a[t][c])<eps) continue;

		for(int i=c;i<=n;i++)	swap(a[t][i],a[r][i]);//交换
		for(int i=n;i>=c;i--)	a[r][i]/=a[r][c];//同除
		for(int i=r+1;i<n;i++)
		{
			if(fabs(a[i][c])>eps)
			{
				for(int j=n;j>=c;j--)
					a[i][j]-=a[r][j]*a[i][c];//相加减
			}
		}
		r++;
	}

	for(int i=n-1;i>=0;i--)//回溯求解
	{
		for(int j=i+1;j<n;j++)
		{
			a[i][n]-=a[i][j]*a[j][n];
		}
	}

	if(r<n)
	{
		for(int i=r;i<n;i++)
		{
			if(fabs(a[i][n])>eps)
				return 2;//无解
			return 1;//有无穷多组解
		}
	}

	return 0;//有唯一解
}

int main()
{
	cin>>n;
	for(int i=0;i<n;i++)
	{
		for(int j=0;j<n+1;j++)
		{
			cin>>a[i][j];
		}
	}
	int t=gauss();
	if(t==0)//有唯一解
	{
		for(int i=0;i<n;i++) printf("%.2lf\n",a[i][n]);
	}
	else if(t==1)puts("Infinite group solutions");
	else puts("No solution");

	return 0;
}
```
---
### 10.求组合数的方式

组合数定义：在$a$个元素中选取$b$个元素无序组合的所有方案数，记做$C_n^m$或$C(n,m)$。

求组合数的公式：
$$ C_a^ b= \frac{a\times (a-1)\times (a-2)\times \cdots \times (a-b+1)}{1\times 2\times 3\times \cdots \times b} =\frac{a!}{b!(a-b)!}$$

#### 1.递推预处理

要求有模数 $m$ 以防爆数据类型

由定义出发，我们很容易得到以下递推式：

$$C_a^b=C_{a-1}^b+C_{a-1}^{b-1}$$

code:
```cpp
#include <bits/stdc++.h>
using namespace std;
const int N=2010;
const int mod=1e9+7;

int c[N][N];

void init()
{
	for(int i=0;i<N;i++)
	{
		for(int j=0;j<N;j++)
		{
			if(!j) c[i][j]=1;
			else c[i][j]=(c[i-1][j]+c[i-1][j-1])%mod;
		}
	}
}
```

#### 2.预处理阶乘

要求模一个数 $m$

由定义$C_a^b==\frac{a!}{b!(a-b)!}$，

我们很容易想到将阶乘以及阶乘模$m$ 的逆元预处理出来

数组$fact[i]=i!,infact[i]=(i!)^{-1}$。

则$C_a^b=fact[a]\times infact[a-b] \mod m$。

code:
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=100010,mod=1e9+7;

ll fact[N],infact[N];//阶乘与阶乘的逆元

ll fpow(int a,int k,int p)
{
	ll res=1;
	while(k)
	{
		if(k&1) res=(ll)res*a%p;
		a=(ll)a*a%p;
		k>>=1;
	}
	return res;
}

int main()
{
	fact[0]=infact[0]=1;
	for(int i=1;i<N;i++)
	{
		fact[i]=(ll)fact[i-1]*i%mod;
		infact[i]=(ll)infact[i-1]*fpow(i,mod-2,mod)%mod; //快速幂求逆元
	}
	int n;
	scanf("%d",&n);
	while(n--)
	{
		int a,b;
		scanf("%d%d",&a,&b);
		ll ans=(ll)fact[a]*infact[b]%mod*infact[a-b]%mod;
		printf("%lld\n",ans);
	}
	return 0;
}

```

#### 3.$Lucas$定理

要求模一数$p$

**内容：$C_a^b=C_{a\mod p}^{b \mod p}\cdot C_{a/p}^{b/p}(\mod p)$**

code:
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

int p;

int fpow(int a,int k,int p)
{
	int res=1;
	while(k)
	{
		if(k&1) res=(ll) res*a%p;
		a=(ll) a*a%p;
		k>>=1;
	}
	return res;
}

int C(int a,int b)
{
	int res=1;
	for(int i=1,j=a;i<=b;i++,j--)
	{
		res=(ll) res*j%p;
		res=(ll) res*fpow(i,p-2,p)%p;
	}
	return res;
}

int lucas(ll a,ll b)
{
	if(a<p&&b<p) return C(a,b);
	return (ll)C(a%p,b%p)*lucas(a/p,b/p)%p;
}

int main()
{
	int n;
	cin>>n;
	while(n--)
	{
		ll a,b;
		cin>>a>>b>>p;
		cout<<lucas(a,b)<<endl;
	}
	return 0;
}
```

---

### 11.反素数

素数是除 $1$ 以外因数个数最少的数，那么反素数就是因数最多的数。

严格的定义是这样的：

令函数 $g(x)$ 表示正整数 $x$ 的因数个数，显然 $g(x)\in (1,+\infty)$ 。若对于任意 $0 < i <x ,i\in Z$ 都有$g(i)<g(x)$  ,则称 $x$ 为反素数。

在 $2\times 10^9$ 的数据范围下，反素数有以下性质：

- $g(x)\leq 9$

- 每个质因子的次数最大为30

- 若将质因子从左到右从小到大排序，则质因子的次数从左到右依次递减

在 $10^{18}$ 的范围下，反素数的上述性质有些许变化：

- $g(x)\leq 16$

- 每个质因子的次数最大为60

- 第三条不变

根据性质，反素数数据量不大，所以求解反素数的方法是爆搜(((

[P1463 [POI2002][HAOI2007]反素数](https://www.luogu.com.cn/problem/P1463)

code:

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

int primes[110],tot=0;
bool mp[110];//筛100以内质数都够用到1e18范围了

int n;
int maxd,num_;//maxd: 约数个数，num_:反素数本身

void init()
{
	for(int i=2; i<=100; i++)
	{
		if(!mp[i]) primes[tot++]=i;
		for(int j=0; primes[j]*i<100; j++)
		{
			mp[primes[j]*i]=1;
			if(i%primes[j]==0) break;
		}
	}
}

void dfs(int x,int last,int s,int p)//枚举到哪个素数，剩多少次数，当前这个数大小，当前这个数的约数个数
{
	if(s>maxd||s==maxd&&p<num_)//约数个数更多或约数个数相等但当前数更小
	{
		maxd=s;
		num_=p;
	}
	if(x==9) return;//达到素数个数上限
	for(int i=1; i<=last; i++) //枚举次数
	{
		if((ll)p*primes[x]>n) break;//十年OI一场空，不开long long......
		p*=primes[x];
		dfs(x+1,i,s*(i+1),p);
	}
}

int main()
{
	init();
	scanf("%d",&n);
	dfs(0,30,1,1);
	printf("%d",num_);
	return 0;
}
```

(未完待续)
