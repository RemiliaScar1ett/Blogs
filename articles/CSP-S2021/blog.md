---
title: "CSP-S2021"
slug: legacy-e23ebc42e5c6
tree:
  - "题解"
tags:
  - 网络流
  - 动态规划
date: 2026-08-15
uid: d9183843-17cb-4a88-a069-2b3be32013c5
dateKind: collected
---
持续更新

---
## T1

我们将一个区内所有的廊桥编号 $1\sim n$，进来廊桥区域的飞机优先选择编号小的廊桥。发现对于某一个区，它分配到的廊桥增多，不会导致它已有飞机进入的廊桥变化(先到先得)。换句话说，一架飞机只要能够进入一个廊桥，它就一定会进入到那一个编号的廊桥中。

所以，我们可以先预处理每个飞机若是能够进入，会进入到哪一个编号的廊桥中。然后再统计一下即可。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=1e5+10;

int n,m1,m2;
vector<int> disc;

int find(int x)
{
	return (lower_bound(disc.begin(),disc.end(),x)-disc.begin())+1;
}

typedef pair<int,int> PII;
PII a1[N],a2[N];
int t1[N],t2[N],df1[N],df2[N];
#define x_ first
#define y_ second

bool cmp(PII a,PII b)
{
	if(a.y_==b.y_) return a.x_<b.x_;
	return a.y_<b.y_;
}

priority_queue<int,vector<int>,greater<int>> cha;//廊桥分配器
priority_queue<PII,vector<PII>,greater<PII>> in;//在港飞机
int main()
{
	scanf("%d%d%d",&n,&m1,&m2);
	for(int i=1;i<=m1;i++)
	{
		int x,y;
		scanf("%d%d",&x,&y);
		a1[i]={x,y}; disc.push_back(x),disc.push_back(y);
	}
	for(int i=1;i<=m2;i++)
	{
		int x,y;
		scanf("%d%d",&x,&y);
		a2[i]={x,y}; disc.push_back(x),disc.push_back(y);
	}
	sort(disc.begin(),disc.end());
	disc.erase(unique(disc.begin(),disc.end()),disc.end());
	for(int i=1;i<=m1;i++)
		a1[i].x_=find(a1[i].x_), a1[i].y_=find(a1[i].y_);
	for(int i=1;i<=m2;i++)
		a2[i].x_=find(a2[i].x_), a2[i].y_=find(a2[i].y_);//离散化一下

	sort(a1+1,a1+1+m1), sort(a2+1,a2+1+m2);//时序排序

	for(int i=1;i<=n;i++) cha.push(i);//初始的所有廊桥全是空的
	for(int i=1;i<=m1;i++)
	{
		while(in.size()&&in.top().x_<a1[i].x_)
		{
			cha.push(t1[in.top().y_]);//归还廊桥
			in.pop();
		}
		if(cha.size())
		{
			t1[i]=cha.top(); cha.pop();
			in.push({a1[i].y_,i});
		}
		else t1[i]=-1;
	}
	while(in.size()) in.pop();
	while(cha.size()) cha.pop();
	for(int i=1;i<=n;i++) cha.push(i);//初始的所有廊桥全是空的
	for(int i=1;i<=m2;i++)
	{
		while(in.size()&&in.top().x_<a2[i].x_)
		{
			cha.push(t2[in.top().y_]);//归还廊桥
			in.pop();
		}
		if(cha.size())
		{
			t2[i]=cha.top(); cha.pop();
			in.push({a2[i].y_,i});
		}
		else t2[i]=-1;
	}
	for(int i=1;i<=m1;i++) if(t1[i]!=-1) df1[t1[i]]++;
	for(int i=1;i<=m2;i++) if(t2[i]!=-1) df2[t2[i]]++;
	for(int i=1;i<=n;i++) df1[i]+=df1[i-1];//n->m1，100->95
	for(int i=1;i<=n;i++) df2[i]+=df2[i-1];//n->m2，100->95
	int ans=0;
	for(int i=0;i<=n;i++)
		ans=max(df1[i]+df2[n-i],ans);
	printf("%d",ans);
	return 0;
}
```
---

## T2

括号序列，考虑区间 DP

首先按照经验我们可以先设状态 $f(l,r)$ 为使 $[l,r]$ 合法的总方案数量。然后我们发现，它表示的状态集合非常复杂，我们无法分析它的来源。

所以我们考虑细化状态。

读题，手玩一会后，我们发现一些比较关键的形式：

1. `***` ，即完全由 `*` 组成的序列。
1. `(...)`，即一个串两头直接括起来。
1. `(...)**(...)**(...)`，即左边以括号开头，右边以括号结尾。上一种情况是这种情况的一个子情况
1. `***(...)**(...)`，即左边有一段 `*` 右边以括号结束。
1. `(...)**(...)***`，上面情况的镜像。
1. `***(...)**(...)***`，即两边都是 `*` 。第一种情况是这种情况的子情况。

这几种状态有的是合法序列，有的是合法序列去掉一部分。先形成上面的形式是形成一个合法序列的必要路径。

所以我们改写状态：设 $f(i,j,k)$ 为区间 $[i,j]$ 形成第 $k$ 类序列的方案总数。

然后我们分类讨论，考虑一个方案如何构造：

- $k=1$

	特判，这是一种最基础的形态。

- $k=2$

	我们加上外面括号的时候，里面可以只有 `*`，可以是 `*()`，也可以是 `()*` 以及 `()*()`，但不能是 `**()**`。

	所以方案数是上面提到的几种可行情况的总和。

	即 $f(l,r,2)=(\,f(l+1,r-1,1)+f(l+1,r-1,3)+f(l+1,r-1,4)+f(l+1,r-1,5)\,)[l,r\text{ 括号匹配}]$

- $k=3$

	考虑把这样一个括号序列拆成两部分，左边一部分是以括号序列开头，结尾可以以 `*` 或 `(..)` 结尾。而右边接上一个括号序列。即左边形态 $3,5$ 接上右边一个形态 $2$。同时还要算上当前区间的 $k=2$。

	为什么不考虑利用 $5,4$ ？因为两段 `*` 直接拼在一起，我们不好判断是否连续超过 $k$ 个 `*`。

	所以： $f(l,r,3)=f(l,r,2)+\sum\limits_{p=l}^{r-1}(\,f(l,p,3)+f(l,p,5)\,)f(p+1,r,2)$

- $k=4$

	左边以 `*` 开头，结尾无要求，符合条件有形态 $4,6$，右边要求一个括号结尾，为形态 $2$。

	$f(l,r,4)=\sum\limits_{p=l}^{r-1}(\,f(l,p,4)+f(l,p,6)\,)f(p+1,r,2)$

- $k=5$

	左边以括号序列开头结尾，右边由一串 `*` 组成。

	$f(l,r,5)=\sum\limits_{p=l}^{r-1}f(l,p,3)f(p+1,r,1)$

- $k=6$

	左边由一个 `*()` 形式开头，右边跟一串 `*`。同时要加上全是 `*` 的。

	$f(l,r,6)=f(l,r,1)+\sum\limits_{p=l}^{r-1}f(l,p,4)f(p+1,r,1)$

我们设边界状态为 $f(i,i-1,1)=1$。答案要求的是 $f(1,n,3)$。

复杂度 $O(n^3)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int mod=1e9+7,N=510;

ll f[N][N][6];
char str[N];
int n,k;

bool match(int x,int y)//括号匹配
{
	if(x>y) x^=y^=x^=y;
	return (str[x]=='('||str[x]=='?')&&(str[y]==')'||str[y]=='?');
}


int main()
{
	scanf("%d%d",&n,&k);
	cin>>(str+1);
	for(int i=1;i<=n;i++) f[i][i-1][1]=1;
	for(int len=1;len<=n;len++)
	{
		for(int l=1;l+len-1<=n;l++)
		{
			int r=l+len-1;
			if(len<=k) f[l][r][1]=f[l][r-1][1]&&(str[r]=='*'||str[r]=='?');
			if(len>=2)
			{
				if(match(l,r)) f[l][r][2]=(f[l+1][r-1][1]+f[l+1][r-1][3]+f[l+1][r-1][4]+f[l+1][r-1][5])%mod;
				for(int p=l;p<r;p++)
				{
					f[l][r][3]=(f[l][r][3]+(f[l][p][3]+f[l][p][5])*f[p+1][r][2]%mod)%mod;
					f[l][r][4]=(f[l][r][4]+(f[l][p][4]+f[l][p][6])*f[p+1][r][2]%mod)%mod;
					f[l][r][5]=(f[l][r][5]+f[l][p][3]*f[p+1][r][1]%mod)%mod;
					f[l][r][6]=(f[l][r][6]+f[l][p][4]*f[p+1][r][1]%mod)%mod;
				}
			}
			f[l][r][3]=(f[l][r][3]+f[l][r][2])%mod;
			f[l][r][6]=(f[l][r][6]+f[l][r][1])%mod;
		}
	}
	printf("%lld",f[1][n][3]);
	return 0;
}
```
```cpp
```

---

## T3

考虑构造的过程。我们可以近似地看做将一个序列分成两个栈，设剖分位置为 $p$，第一个栈栈顶为 $1$，栈底为 $p$，第二个栈栈顶为 $2n$，栈底为 $p+1$。

首先我们发现，由于第一步一定是从两边栈顶中取一个数，那么序列中这个数的另外一个相等的数一定在栈底；假设我们从左边开始取出来的，那么可以先找到 $p\ st:a_p=a_1$ ，它就是一个合法分割点。

由于 $a_p$ 碍事，而且反正它都是最后一个取出来，我们把它从栈中拿出来。现在我们的问题变成了：

有两个栈 $A,B$ ：

$A:top=a_2,bott=a_{p-1},\quad B:top=a_{2n},bott=a_{p+1}$，

要从这两个栈中弹出一个序列，得到一个回文序列。

这个子问题与原问题非常相似。我们可以重复上面的类似步骤。

总之，这个问题可以按如下方法解决：

- 首先找到一个既存在于 $A,B$ 的栈顶，同时能够存在于 $A,B$ 栈底的元素，如果 $A,B$ 的栈顶都有这样的元素，优先选择 $A$ 栈顶的元素。若找不到，则无解。

- 栈中删掉这两个元素，继续。

- $A,B$ 均为空，退出。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=1e6+10;

int n,arr[N];
char nw[N], ans[N];

deque<int> A,B;

void work()
{
	int tmp=2;
	while(1)
	{
		if(A.empty()&&B.empty()) return ;
		else if(B.empty())//如果有一个是空的情况
		{
			if(A.back()!=A.front())
			{
				nw[1]=127;//无解
				return ;
			}
			nw[tmp]='L';
			nw[(n<<1)-tmp+1]='L';
			A.pop_front();
			A.pop_back();
		}
		else if(A.empty())
		{
			if(B.back()!=B.front())
			{
				nw[1]=127;//无解
				return ;
			}
			nw[tmp]='R';
			nw[(n<<1)-tmp+1]='R';
			B.pop_front();
			B.pop_back();
		}
		else//两个都不为空
		{
			if(A.front()==A.back()&&A.size()>1)
			{
				nw[tmp]='L';
				nw[(n<<1)-tmp+1]='L';
				A.pop_back();
				A.pop_front();
			}
			else if(A.back()==B.front())
			{
				nw[tmp]='L';
				nw[(n<<1)-tmp+1]='R';
				A.pop_back();
				B.pop_front();
			}
			else if(B.back()==A.front())
			{
				nw[tmp]='R';
				nw[(n<<1)-tmp+1]='L';
				B.pop_back();
				A.pop_front();
			}
			else if(B.back()==B.front()&&B.size()>1)
			{
				nw[tmp]='R';
				nw[(n<<1)-tmp+1]='R';
				B.pop_front();
				B.pop_back();
			}
			else
			{
				nw[1]=127;//无解
				return ;
			}
		}
		tmp++;
	}
}

bool cmp()//比较，判断是否更新答案
{
	int id=1;
	while(id<=(n<<1)&&ans[id]==nw[id]) id++;
	return id<=(n<<1)&&nw[id]<ans[id];
}

int main()
{
//	freopen("palin2.in","r",stdin);
//	freopen("wa.out","w",stdout);
	int T;
	scanf("%d",&T);
	while(T--)
	{
		scanf("%d",&n);
		for(int i=1; i<=(n<<1); i++)
			scanf("%d",&arr[i]);
		ans[1]='Y';
		A.clear(); B.clear();
		int pos=2;
		while(pos<=(n<<1)&&arr[pos]!=arr[1]) ++pos;//寻找和 a(1) 相等的位置
		for(int i=pos-1; i>=2; i--)
			A.push_back(arr[i]);
		for(int i=pos+1; i<=(n<<1); i++) //入队
			B.push_back(arr[i]);
		nw[1]='L'; nw[(n<<1)]='L';
		work();
		if(cmp())
		{
			for(int i=1; i<=(n<<1); i++)
				ans[i]=nw[i];
		}

		A.clear();B.clear();
		pos=1;
		while(pos<(n<<1)&&arr[pos]!=arr[(n<<1)]) ++pos;//寻找和 a(2n) 相等的位置
		for(int i=pos-1; i>=1; i--)
			A.push_back(arr[i]);
		for(int i=pos+1; i<(n<<1); i++) //入队
			B.push_back(arr[i]);
		nw[1]='R'; nw[(n<<1)]='L';
		work();
		if(cmp())
		{
			for(int i=1; i<=(n<<1); i++)
				ans[i]=nw[i];
		}
		if(ans[1]!='L'&&ans[1]!='R')
			printf("-1");
		else  for(int i=1; i<=(n<<1); i++) printf("%c",ans[i]);
		printf("\n");
	}
	return 0;
}
```

---

## T4

这题目，很网络流。

先开特殊性质：$k\le 2$：

$k<2$ 时候我们很容易得出最小值为 $0$。

$k=2$ 时，我们发现在最优方案中，整个图一定被分成了一个黑色联通块和一个白色联通块。
