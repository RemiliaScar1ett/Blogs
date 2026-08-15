---
title: "P3857 [TJOI2008]彩灯"
slug: legacy-081e64069882
tree:
  - "题解"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## P3857 [TJOI2008]彩灯

前置知识：[『模板』线性基](https://www.luogu.com.cn/problem/P3812) ，[线性基初步](https://www.cnblogs.com/IzayoiMiku/p/15213150.html)

线性基求张成出的子空间元素个数。

首先细读题目，我们发现对于每一盏被控制的灯，按下一次开关的操作相当于对其状态异或 $1$。我们可以考虑将问题转化成有 $m$ 个非负整数 ，我们选取其中几个异或起来，求它们的方案数。异或是一种二进制不进位加法运算，自然而然的可以想到线性基。

现在假设我们已经求出了线性基向量组 $S=\{\boldsymbol{x_1},\boldsymbol{x_2},\boldsymbol{x_3},\dots \boldsymbol{x_k}\}$，所在的线性空间为 $V$。

本题我们要求：$|T|,T=\{a_1\boldsymbol{x_1}+a_2\boldsymbol{x_2}+\dots a_k\boldsymbol{x_k}|a_i\in[0,1]\land a_i\in N\ \}$。

**先说结论：答案是所有** $a_i$ **取值种数的乘积。即** $2^k$。

我们定义向量的基坐标：若 $\boldsymbol{\alpha}\in V$ ，$\boldsymbol{x_1},\boldsymbol{x_2},\boldsymbol{x_3},\dots \boldsymbol{x_k}$ 是线性空间 $V$ 的一个基且 $\boldsymbol{\alpha}=a_1\boldsymbol{x_1}+a_2\boldsymbol{x_2}+\dots a_k\boldsymbol{x_k},a_i\in R$ ，那么我们就称 $(a_1,a_2,a_3,\dots,a_k)$ 为这个向量在这个基下的坐标。

立刻能猜到，线性基张成的子空间元素数与坐标的一组 $(a_1,a_2,\dots,a_k)$ 的取值一一对应。

对一一对应性进行验证：

假设一个向量 $\boldsymbol{\alpha}\in V$ 在线性基 $\{\boldsymbol{x_1},\boldsymbol{x_2},\boldsymbol{x_3},\dots \boldsymbol{x_k}\}$ 下有两个不同坐标 $(a_1,a_2,\dots,a_k)$ ，$(b_1,b_2,b_3,\dots,b_k)$。

那么
 $$\boldsymbol{\alpha}=a_1\boldsymbol{x_1}+a_2\boldsymbol{x_2}+\dots a_k\boldsymbol{x_k}=b_1\boldsymbol{x_1}+b_2\boldsymbol{x_2}+\dots b_k\boldsymbol{x_k}$$

把两种线性表示相减：

$$(a_1-b_1)\boldsymbol{x_1}+(a_2-b_2)\boldsymbol{x_2}+\dots (a_k-b_k)\boldsymbol{x_k}=0$$

进行分类讨论：

-   $\forall\ i\in [1,k],\ a_i-b_i=0$

    可得 $a_1=b_1,a_2=b_2\dots a_k=b_k$

    与题设“两个不同坐标”矛盾。

-   $\exists\ i\in [1,k],\ a_i-b_i\ne 0$。

    不妨设 $a_i-b_i\ne 0$ ，移项：

    $$(a_1-b_1)\boldsymbol{x_1}+(a_2-b_2)\boldsymbol{x_2}+\dots (a_{i-1}-b_{i-1})\boldsymbol{x_{i-1}}+(a_{i+1}-b_{i+1})\boldsymbol{x_{i+1}} \dots (a_k-b_k)\boldsymbol{x_k}=(a_i-b_i)\boldsymbol{x_i}$$

    与 “$\{\boldsymbol{x_1},\boldsymbol{x_2},\boldsymbol{x_3},\dots \boldsymbol{x_k}\}$ 是线性基”矛盾。

故基坐标与子空间中的向量一一对应。

由计数原理，线性基可以线性表示的向量个数为所有 $a_i$ 取值个数的乘积，本题即为 $2^k$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e3+10;

int n,m;
ll arr[N];

ll fpow(int k,int mod)
{
	ll a=2,res=1;
	while(k)
	{
		if(k&1) res=res*a%mod;
		a=a*a; k>>=1;
	}
	return (res%mod+mod)%mod;
}

int main()
{
	scanf("%d%d",&m,&n);
	for(int i=0;i<n;i++)
	{
		char s[N];
		scanf("%s",s+1);
		for(int j=m;j>=1;j--)
		{
			arr[i]<<=1;
			if(s[j]=='O') arr[i]+=1;
		}
	}
	int k=0;
	for(int i=63;i>=0;i--)
	{
		for(int j=k;j<n;j++)
			if(arr[j]>>i&1)
			{
				swap(arr[j],arr[k]);
				break;
			}
		if(!(arr[k]>>i&1)) continue;
		for(int j=0;j<n;j++)
			if(j!=k&&(arr[j]>>i&1))
				arr[j]^=arr[k];
		k++;
		if(k==n) break;
	}
	printf("%lld",fpow(k,2008));
	return 0;
}
```
