---
title: "P4570 [BJWC2011]元素"
slug: legacy-22fae6150b42
tree:
  - "题解"
tags:
  - 线性基
date: 2026-08-15
uid: cf01f538-46da-47c5-b33e-474aaf21eb5f
dateKind: collected
---
## P4570 [BJWC2011]元素

求选中数的权值和最大的线性基。

首先读题，我们知道这是让我们选出一个集合，使得集合内的元素之间不能互相异或得到。我们立刻可以想到利用线性基。

线性基有这样的一个性质：

> 子空间 $T$ 的任意两个基底 $B_1,B_2$ 一定等价且维数相同。

这意思是说，线性基元素个数不会变，所以我们的目标肯定是最大化我们放进去构造线性基的各个数的权值。考虑直接按照权值排序，然后动态维护线性基，每次试图插入一个数，若成功则选择这个数并保留插入结果。容易证明这样一定能构造出最大方案。

对于动态维护线性基，我们试图向线性基里面插入一个 $x$。插入的过程实际上是高斯—约旦消元的过程。我们相当于要维护一个类对角矩阵(每一位的 $1$ 最多只在一个向量中出现)，对于 $x$ 从高到低的某一位非 $0$ 二进制位 $i$：

- 若 $a_i\ne 0$

    我们执行 $x=x\oplus a_i$ 将这一位抵消。若 $x$ 被完全消为 $0$ ，证明 $x$ 可以被当前的线性基表示，不能插入。

- 若 $a_i=0$

    意味着我们可以插入 $x$，此时我们需要枚举 $i$ 之前与之后的位置，维护类对角矩阵

code:

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e5+10;

ll arr[N];
bool insert(ll x)//动态维护线性基
{
	for(int i=63;i>=0;i--)
	{
		if(!(x>>i&1)) continue;//x的这一位是 0 ，跳过
		if(arr[i]) x^=arr[i];//ai!=0,消去这一位
		else //发现某一位x是1，但是却没有这一位
		{
			for(int j=0;j<i;j++)
				if(x>>j&1) x^=arr[j];
			for(int j=i+1;j<=63;j++)
				if(arr[j]>>i&1) arr[j]^=x;//将之前/之后的位置全部消去，维护成类对角矩阵
			arr[i]=x;
			return 1;
		}
	}
	return 0;//插入失败，证明 x 在插入前的线性基生成的子空间中
}

int n;
struct node
{
	int mag; ll num=0;
	bool operator<(const node &x) const{
		return mag>x.mag;
	}
} poi[N];

int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0); cout.tie(0);
	cin>>n;
	for(int i=1;i<=n;i++)
		cin>>poi[i].num>>poi[i].mag;
	sort(poi+1,poi+1+n);
	ll ans=0,cnt=0;
	for(int i=1;i<=n;i++)
	{
		bool flag=insert(poi[i].num);
		if(flag) ans+=poi[i].mag,cnt++;
		if(cnt>=64) break;//绝对不可能再选了
	}
	printf("%lld",ans);
	return 0;
}
```
