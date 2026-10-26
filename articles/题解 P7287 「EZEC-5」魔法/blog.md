---
title: "题解 P7287 「EZEC-5」魔法"
slug: legacy-520b97d99d9c
tree:
  - "题解"
tags:
  - 贪心
date: 2026-08-15
uid: fb892fc9-ef82-48d5-89b6-57607cae300d
dateKind: collected
---
## P7287 「EZEC-5」魔法

~~第一眼会认为是数据结构的题~~

首先我们可以发现，若魔法 2 的操作子段和是正整数，那么它的最高操作次数是 $\log S$ 级别的。当它操作的子段和是负数的时候，它会使得和越来越小。

其次我们发现，对于固定的操作次数，最优解一定是先加再乘。先加可以将后来加的数的贡献最大化，而且一开始可能还需要加操作来弥补负数。但是加操作的次数是 $2S$ 级别的，我们不可能枚举。

不过比较明显 ~~(但容易忽略)~~ 的性质是：若 $x$ 次操作可以达到目标，那么 $x+1$ 次操作也一定可以。换句话说，操作次数具有单调性。而两种操作的代价都是正的，代价的增加与次数的增加成正比。所以我们可以考虑使用二分。

对于乘法操作，枚举次数复杂度就是 $\log s$  级，我们只需要二分加法次数即可。

对于二分的 `check` 函数的设置。现在我们已经猜测了一个加操作的执行次数，需要判断是否有解。这里，可以贪心地得出最大子段和并对其做乘法操作。另外，本题可能爆 `long long` ，请使用一些措施来避免。这里我将其转成了 `__int128`。

完整code :

```cpp
#include <bits/stdc++.h>
using namespace std;
/*
	两个操作都有可二分的性质
	考虑枚举一个，二分另外一个
	由于魔法1最大次数更多，故二分魔法1的次数
*/
typedef long long ll;
const int N=5e6+10;

ll n,a,b,s;
ll arr[N];

bool check(ll mid,ll k)
{
	ll t=0,ans=-1e18;
	for(int i=1;i<=n;i++)
	{
		if(t<0) t=0;
		t+=arr[i]+mid;
		ans=max(t,ans);
	}
	return (__int128)ans*(1LL<<k)>=(__int128)s;
}

int main()
{
	scanf("%lld%lld%lld%lld",&n,&a,&b,&s);
	for(int i=1;i<=n;i++)  scanf("%lld",&arr[i]);
	ll anss=1e18;
	for(ll k=0;k<=40;k++)
	{
		ll l=0,r=1e16,ans=0;
		while(l<=r)
		{
			ll mid=(r-l)/2+l;
			if(check(mid,k)) ans=mid,r=mid-1;
			else l=mid+1;
		}
		anss=min(anss,a*ans+b*k);
	}
	printf("%lld",anss);
	return 0;
}
```
