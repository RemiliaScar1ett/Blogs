---
title: "P4301 [CQOI2013] 新Nim游戏"
slug: legacy-72dd62855709
tree:
  - "题解"
tags:
  - 线性基
  - 博弈论
date: 2026-08-15
uid: 56bbde27-77ca-4bb2-81ae-8b7113019b56
dateKind: collected
---
## P4301 [CQOI2013] 新Nim游戏

先提一下 Nim 游戏：

>有多堆石子，双方每次可以在一堆里取任意多的火柴，先手必胜当且仅当所有堆的石子数异或和等于 $0$。

我们现在的目标就是拿走几堆火柴，让对面拿走多少堆火柴都没有办法使得异或和为 $0$ (不能一次性拿完)。

或者说，我们要选出一些数组成一个集合，这里面的数不能互相异或和表示出来。我们就能想到线性基了。

我们求放进去的数的和最大的线性基。这样我们把其他的数取走就可以得到最小的方案。我们将火柴堆从大到小排序，动态维护一个线性基，每次试图向里面插入一个数，如果插入成功就将这个数统计到答案，并保留插入结果。最后再拿总数减去即可。

由于我们肯定有必胜策略(一次性拿得只剩一堆)，所以 $-1$ 肯定是没分的。

code:
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e3+10;

int n;
ll arr[N];

bool insert(ll x)
{
	for(int i=63;i>=0;i--)
	{
		if(!(x>>i&1)) continue;
		if(arr[i]) x^=arr[i];
		else
		{
			for(int j=0;j<i;j++)
				if(x>>j&1) x^=arr[i];
			for(int j=i+1;j<n;j++)
				if(arr[j]>>i&1) arr[j]^=x;
			arr[i]=x;
			return 1;
		}
	}
	return 0;
}
ll poi[N];

int main()
{
	scanf("%d",&n);
	ll sum=0;
	for(int i=1;i<=n;i++)
		scanf("%lld",&poi[i]),sum+=poi[i];
	sort(poi+1,poi+1+n,greater<long long>());
	for(int i=1;i<=n;i++)
		if(insert(poi[i])) sum-=poi[i];
	printf("%lld",sum);
}
```
