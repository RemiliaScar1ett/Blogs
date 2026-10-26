---
title: "杂题记录"
slug: legacy-bafd088c780d
tree:
  - "题解"
tags:
  - 动态规划
  - 贪心
date: 2026-08-15
uid: bf3c3ec5-af75-4bc4-8161-adbda7142538
dateKind: collected
---
## P5851

先设状态 $f(l,r)$ 为吃掉 $[l,r]$ 能得到的最大奶牛重量。

考虑最后一步，$[l,r]$ 我们吃的只剩一个派了，这个派肯定是给体重最大的牛吃最值。设这个派的编号为 $k$，此时它左边的区间 $[l,k-1]$，$[k+1,r]$ 对我们这头牛都无所谓，因为它吃不到。

现在我们的问题是如何确定这样的一头牛。

首先，我们计算的答案在 $l,r$ 之间，考虑到状态的后效性，它吃的派不应该超出这个范围。我们设 $g(l,r,k),\,l\le k\le r$ 为 $[l,r]$ 内能吃到 $k$ 的牛的最大重量。有一个很显然的性质是，当 $k$ 不变，$l,r$ 扩大时，答案只会大不会小，我们考虑扩展区间，每次只需要左或右扩展 $1$ 就可以了。

即：$g(l,r,)$
但是我们现在还找不到 $g$ 的初始状态。

发现上面的过程，其实并没有考虑到一头牛直接一次性将 $l,r$ 吃完的情况。所以若是一头牛能吃掉 $[l,r]$ 中的派，它重量为 $w$，那么我们令所有 $i\in[l,r],\,g(l,r,i)=w$。

最终的状态转移方程：

$$f(l,r)=\max_{l\le k\le r}\{\,f(l,k-1)+f(k+1,r)+g(l,r,k)\,\}$$

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=310,M=44860;

int n,m;
int f[N][N],g[N][N][N];
int W[M];int L[M],R[M];

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=m;i++)
	{
		scanf("%d%d%d",&W[i],&L[i],&R[i]);
		for(int j=L[i];j<=R[i];j++)
			g[L[i]][R[i]][j]=max(g[L[i]][R[i]][j],W[i]);
	}
	for(int len=1;len<=n;len++)
	{
		for(int l=1;l+len-1<=n;l++)
		{
			int r=l+len-1;
			for(int k=l;k<=r;k++)
				g[l][r][k]=max(g[l][r][k],max(g[l+1][r][k],g[l][r-1][k]));
		}
	}
	for(int len=1;len<=n;len++)
	{
		for(int l=1;l+len-1<=n;l++)
		{
			int r=l+len-1;
			for(int k=l;k<r;k++)
				f[l][r]=max(f[l][r],f[l][k]+f[k+1][r]);
			for(int k=l;k<=r;k++)
				f[l][r]=max(f[l][r],f[l][k-1]*(k!=l)+f[k+1][r]*(k!=r)+g[l][r][k]);
		}
	}
	printf("%d",f[1][n]);
	return 0;
}
```

## CF1186C

给两个 01 串 $a,b$，已知 $|a|>|b|$ 。求 $a$ 中有多少个长度为 $|b|$ 的子区间和 $b$ 有偶数个位置不匹配。

我们考虑两个等长 01 串的差异度(即不相同位置个数) $f(b,c)$ 的奇偶性与什么有关。考虑最好的情况，就是两个串中 $1$ 尽量匹配，这样的情况最少会有 $b,c$ 中 $1$ 个数之差个位置 $0$ 匹配 $1$。

再模拟一下样例的情况：

```
01100010
00110   	差异度=2
 00110  	差异度=4
  00110 	差异度=4
   00110	差异度=1
```

我们发现，两个等长串的差异度奇偶性似乎与两串 $1$ 的个数奇偶性有关。如果两个串中 $1$ 个数都是偶数，那么它们 $1$ 的个数差是偶数，也就是说有且仅可能有偶数个 $1$ 对应 $0$。不会出现两串中有奇数个位置一边是 $0$ 另一边是 $1$ 的情况。

我们对样例扩展，将 $b$ 串改成 `00010` ，再次模拟：

```
01100010
00010   	差异度=3
 00010  	差异度=3
  00010 	差异度=3
   00010	差异度=0
```

我们发现，当两边 $1$ 个数差值为奇数时，一定是不匹配且差异度一定为奇数，因为一定要有奇数个 $1$ 对应到 $0$；同时，两边都是奇数的情况下也满足条件，因为听他们的差值是偶数。

综上，我们发现当两个等长串中 $1$ 的个数同时是奇数或偶数时是满足条件的。我们只需要统计出 $a$ 中 $1$ 的个数的前缀和以及 $b$ 中 $1$ 的个数，然后暴力枚举 $a$ 的子区间直接判定即可。

判定两边是否是同奇偶用加法用减法均可。

```cpp
#include <bits/stdc++.h>
using namespace std;

void setIO(string _namein,string _nameout)
{
	if(_namein!="")  freopen(_namein.c_str(),"r",stdin);
	if(_nameout!="") freopen(_nameout.c_str(),"w",stdout);
}

const int N=1e6+10;
string a,b;
int arr[N],pat=0;

int main()
{
	ios::sync_with_stdio(0);
	cin>>a>>b;
	int n=a.length(),m=b.length();
	for(int i=1;i<=n;i++) arr[i]=a[i-1]-'0';
	for(int i=1;i<=m;i++) pat+=b[i-1]-'0';
	for(int i=1;i<=n;i++) arr[i]+=arr[i-1];
	int ans=0;
	for(int l=1;l+m-1<=n;l++)
	{
		int r=l+m-1;
		if((pat-arr[r]+arr[l-1])&1) continue;
		else ans++;
	}
	printf("%d",ans);
	return 0;
}
```

## CF3D

~~什么CSP-S2021 T2~~

考虑贪心，我们先将所有的 `?` 填充成 `)`，然后考虑回去修改。

首先要保证合法，我们设一个计数变量 $top$ 模拟括号匹配的过程。当 `str[i]=='('` 的时候 `top++` ，当 `str[i]==')'` 时 `top--`。当我们发现 $top<0$ 的时候，我们回去找 `?` 来替换成 `(`。想让代价最小，我们就要让每次选到的 `?` 它的替换导致的代价减少最大，可以使用优先队列来维护已有的 `?`。时间复杂度 $O(n\log n)$。

```
#include <bits/stdc++.h>
using namespace std;

void setIO(int _untie=0,string _namein="",string _nameout="")
{
	if(_untie)
	{
		ios::sync_with_stdio(0);
		cin.tie(0); cout.tie(0);
	}
	if(_namein!="")  freopen(_namein.c_str(),"r",stdin);
	if(_nameout!="") freopen(_nameout.c_str(),"w",stdout);
}
typedef long long ll;

const int N=1e6+10;

char str[N];

struct node
{
	int pos;
	ll dlt;//-b+a
	bool operator < (const node& x) const{
		return dlt>x.dlt;//大的排前面
	}
};

priority_queue<node> q;


int main()
{
	cin>>(str+1);
	int n=strlen(str+1);
	int top=0; ll ans=0;
	for(int i=1;i<=n;i++)
	{
		if(str[i]=='(') ++top;
		else
		{
			--top;
			if(str[i]=='?')
			{
				ll x,y;
				scanf("%lld%lld",&x,&y);
				q.push((node){i,-y+x});
				str[i]=')';
				ans+=y;
			}
		}
		if(top<0)//贪心
		{
			if(!q.size())
			{
				ans=-1;
				break;
			}
			else
			{
				top+=2;
				node t=q.top();
				q.pop();
				str[t.pos]='(';
				ans+=t.dlt;
			}
		}
	}
	if(top<0) ans=-1;
	if(ans==-1)	cout<<ans<<"\n";
	else {
		cout<<ans<<'\n'<<(str+1);
	}
	return 0;
}
```

### CF8C

怎么exluogu的随机老是给我随机到喜爱福啊？

题意有点像欧拉环游？$n\le 24$ 果断状压。

设 $f[sta]$ 为已拿点的情况是 $sta$ 的时候的最小距离。

方程非常显然，我们预处理 $i,j$ 两点间的距离：$dis_{i,j}$，每个点 $i$ 到包的距离设为 $dist_i$。

然后枚举 $i,j \not\in sta$，注意允许 $i=j$，方程就是：

$f(sta|(1<<i-1)|(1<<j-1))=\min\{\,f(sta)+dis_{i,j}+dist_i+dist_j\,\}$

把这个方程暴力实现上去，愉快 TLE on 12。毕竟复杂度 $O(n^22^n)$。

考虑优化。

我们发现，拿点行为的顺序和它的价值没有联系。比如我先去拿 $1,2$，再去拿 $3,4$ ，和先去拿 $3,4$ 再去拿 $1,2$ 没有区别。

所以我们考虑让每一个 $sta$ 少更新一些状态。设 $sta$ 的第一个 $0$ 出现在 $p$ 位置，那么我们只让 $sta$ 更新这一个点和另外一点即可更新到所有的情况。

所以我们在第一遍枚举完 $j$ 后直接 $break$ 掉即可。容易证明对于一个非最终态(或者说不全是 $1$ 的态)，它一定至少更新了一种情况。

```cpp
#include <bits/stdc++.h>
using namespace std;

void setIO(string _namein,string _nameout)
{
	if(_namein!="")  freopen(_namein.c_str(),"r",stdin);
	if(_nameout!="") freopen(_nameout.c_str(),"w",stdout);
}

const int N=25;

typedef pair<int,int> PII;
#define x_ first
#define y_ second

int n;
int f[1<<(N-1)],pre[1<<(N-1)];
int dis[N][N],dist[N];
PII pos[N],bag;

int Dis(PII a,PII b)
{
	int aa=(a.x_-b.x_),bb=(a.y_-b.y_);
	return aa*aa+bb*bb;
}

void print(int sta)
{
	if(sta==0) return;
	int diff=pre[sta]^sta;
	for(int i=1;i<=n;i++)
		if((diff>>(i-1))&1) printf("%d ",i);
	printf("0 ");
	print(pre[sta]);
}

int main()
{
	scanf("%d%d",&bag.x_,&bag.y_);
	scanf("%d",&n);
	for(int i=1;i<=n;i++)
	{
		int x,y;
		scanf("%d%d",&x,&y);
		pos[i]={x,y};
		dist[i]=Dis(pos[i],bag);
	}
	for(int i=1;i<=n;i++)
	{
		for(int j=i;j<=n;j++)
			dis[i][j]=dis[j][i]=Dis(pos[i],pos[j]);
	}
	memset(f,0x3f,sizeof f);
	f[0]=0;
	for(int sta=0;sta<(1<<n);sta++)
	{
		for(int i=1;i<=n;i++)
		{
			if((sta>>i-1)&1) continue;
			for(int j=i;j<=n;j++)
			{
				if((sta>>j-1)&1) continue;
				if(f[sta|(1<<i-1)|(1<<j-1)]>f[sta]+dis[i][j]+dist[i]+dist[j])
				{
					f[sta|(1<<i-1)|(1<<j-1)]=f[sta]+dis[i][j]+dist[i]+dist[j];
					pre[sta|(1<<i-1)|(1<<j-1)]=sta;
				}
			}
			break;
		}
	}
	printf("%d\n0 ",f[(1<<n)-1]);
	print((1<<n)-1);
	return 0;
}
```
