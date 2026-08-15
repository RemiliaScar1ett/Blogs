---
title: "扩展KMP"
slug: legacy-2156b91cc11b
tree:
  - "笔记"
  - "其他算法"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## 扩展KMP(Z函数)

本质仍然是尽量应用串内的信息。

---

### Z函数

- **定义**

  一个数的 $z$ 函数 $z(i)$ 表示的是这个字符串和它从 $i$ 开始的后缀的最长匹配长度。

  即： $z(i)=|\ lcp(s,s+i-1)\ |$

  (这里的数组下标从 $1$ 开始)

- **做法**

  暴力求 $O(n^2)$ ，大部分时候不可接受。

  我们可以维护终点为 $r$ 的最大匹配子串 $[l\ ,\ r]$，$z_l$就相当于它的长度。

  当 $i\le r$ 时，$z_i$ 可以直接从 $min(z_{i-l+1}，r-i+1)$ 开始，否则从 $0$ 开始；

  然后继续暴力匹配得到 $z_i$。

  判定 $[i+z_i-1>r]$ 若为真则将区间更新至 $[i\ ,\ i-z_i+1]$。

  注意 $z_1=n$ 单独处理。

  代码实现：

```cpp
void zfunc(char *p,int n)//求解z函数
{
	for(int i=1;i<=n;i++) z[i]=0;
	z[1]=n;
	for(int i=2,l=0,r=0;i<=n;i++)
	{
		if(i<=r) z[i]=min(z[i-l+1],r-i+1);
		while(i+z[i]<=n&&p[i+z[i]]==p[z[i]+1]) z[i]++;//i+z[i]<=字符串长度
		if(i+z[i]-1>r) l=i,r=i+z[i]-1;
	}
}

```

---
### Extend Z函数

- **定义**

   模仿Z函数的定义，我们可以定义一个扩展Z函数：

   对于文本串 $s$ , 和模式串 $p$

   $Exz(i)=|lcp(p,s+i)|$

   也就是 $p$ 与 $s$ 的所有后缀的最长公共前缀长度数组。

- **做法**

   做法也可以模仿Z函数

   仍然是维护 $s$ 的最长匹配子串 $[l\ ,\ r]$ 。$Exz_l$ 即是区间长度。

   首先求解模式串 $p$ 的z函数。

   当 $i\le r$ 时 $Exz_i$ 直接从 $min(z_{i-l+1},r-l+1)$ 开始，否则$Exz_i=0$。

   然后暴力匹配得到 $Exz_i$ 的值。

   判定 $[i+Exz_i-1>r]$ 若为真则将区间更新至 $[i\ ,\ i-Exz_i+1]$。

   过程几乎没什么变化。

```cpp
void extend_Z(char *s,char *p,int n,int m)
{
	zfunc(p,m);
	for(int i=2,l=0,r=0;i<=n;i++)
	{
		if(i<=r) exz[i]=min(z[i-l+1],r-i+1);
		while(i+exz[i]<=n&&s[i+exz[i]]==p[1+exz[i]]) exz[i]++;
		if(i+exz[i]-1>r) l=i.r=i+exz[i]-1;
	}
}

```
---
### 完整代码

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=2e7+10;

char s[N],p[N];//文本串，模式串
int z[N];//z函数针对模式串

void zfunc(char *p,int n)//求解z函数
{
	for(int i=1;i<=n;i++) z[i]=0;
	z[1]=n;
	for(int i=2,l=0,r=0;i<=n;i++)
	{
		if(i<=r) z[i]=min(z[i-l+1],r-i+1);
		while(i+z[i]<=n&&p[i+z[i]]==p[z[i]+1]) z[i]++;//i+z[i]<=字符串长度的边界不能忘
		if(i+z[i]-1>r) l=i,r=i+z[i]-1;
	}
}

int exz[N];

void extend_Z(char *s,char *p,int n,int m)
{
	zfunc(p,m);
	for(int i=1;i<=n;i++) exz[i]=0;
	for(int i=1,l=0,r=0;i<=n;i++)
	{
		if(i<=r) exz[i]=min(z[i-l+1],r-i+1);
		while(i+exz[i]<=n&&s[i+exz[i]]==p[1+exz[i]]) exz[i]++;
		if(i+exz[i]-1>r) l=i,r=i+exz[i]-1;
	}
}

int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0);
	cout.tie(0);

	cin>>s+1>>p+1;
	int lens=strlen(s+1),lenp=strlen(p+1);
	extend_Z(s,p,lens,lenp);
	ll ans=0;
	for(int i=1;i<=lenp;i++)
		ans^=1ll*i*(z[i]+1);
	cout<<ans<<"\n";
	ans=0;
	for(int i=1;i<=lens;i++)
		ans^=1ll*i*(exz[i]+1);
	cout<<ans;
	return 0;

}
```
