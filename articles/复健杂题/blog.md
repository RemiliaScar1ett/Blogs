---
title: "复健杂题"
slug: legacy-b6fd93f24711
tree:
  - "题解"
tags:
  - "旧文迁移"
date: 2026-08-15
---
## P9118 [春季测试 2023] 幂次

[link](https://www.luogu.com.cn/problem/P9118)

首先我们想到，对于一个确定的 $i$ 我们可以求得有多少个 $a$ 满足 $a^i\le n$ ：它应当是满足 $a^i\le n$ 的最大的 $a_{max}$。设 $g(i)$ 代表对应的 $a_{max}$。

对于 $g(i)$，$i=1$ 时直接就是 $n$，$i\ge 2$ 时可以二分。

接下来要求所有 $i\ge k$ 满足 $a_i=x\le n$ 的 $x$ 的个数。

直接将 $g(i)$ 全部相加是不对的，因为 $g(i)$ 中部分数能被 $g(2i),\ g(3i),\ g(4i)\dots$ 表示，我们需要将这一部分减去。注意由于 $1^{+\infty}=1$ 所以我们将 $1$ 特殊判断，在算 $g(i)$ 的时候将对应的 $a_{max}$ 减 $1$ 即可。最后的答案再加一个 $1$ 即可。

时间复杂度约为 $O(\max\{(63-k)k\log n\ ,\ 1\} )$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

bool calc(ll a,ll k,ll n)//a^k<=n?
{
	for(int i=1;i<=k;i++) n/=a;
	if(n) return 1;
	else return 0;
}

ll n,k;
ll arr[110];

ll func(ll k)
{
	ll ans=0;
	ll l=1,r=n;
	while(l<=r)
	{
		ll mid=(l+r)/2;
		if(calc(mid,k,n)) l=mid+1,ans=mid;
		else r=mid-1;
	}
	return ans;
}
int main()
{
	cin>>n>>k;
	if(k==1)
	{
		cout<<n;
		return 0;
	}

	ll cnt=1;
	for(int i=63;i>=k;i--)
	{
		arr[i]=func(i)-1;//减去1
		for(int j=i+i;j<=64;j+=i)
			arr[i]-=arr[j];
		cnt+=arr[i];
	}
	cout<<cnt;
	return 0;
}
```

---

## CF3D  Least Cost Bracket Sequence

#### 题面翻译

给一个序列，序列里面会有左括号、问号、右括号。对于一个‘？’而言，可以将其替换为一个‘（’，也可以替换成一个‘）’，但是都有相应的代价。问：如何替换使得代价最小。前提是替换之后的序列中，括号是匹配的。如果不能替换为一个括号匹配的序列则输出 $-1$。

### 解析

首先考虑能否成功匹配。

我们可以先假设所有的 `?` 都是 `)`，遍历字符串并记录一个 $cnt$ 代表当前位置之前有多少的 `?`，然后正常地做括号匹配。具体地，我们维护一个 $x$，遇到 `(` $+1$，遇到 `)` 就 $-1$。当 $x$ 为负数时，证明我们需要前面的一个 `?` 换成 `(` 来补全。

设第 $i$ 个 `?` 换成 `(` 的代价为 $a_i$，换成 `)` 的代价为 $b_i$。那么从 `)` 换成 `(` 的代价为 $-b_i+a_i$ 。

现在我们要求代价最小值，那么我们可以有一个优先队列维护一下前面的 `?` ，按照代价从小到大排序即可。

```
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;
typedef pair<ll,ll> PII;
#define x_  first
#define y_ second

const int N=1e5+10;

char s[N];
ll a1[N],a2[N];
priority_queue<PII,vector<PII>,greater<PII>> q;

int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0); cout.tie(0);
	cin>>s;
	ll n=strlen(s),m=0;
	for(int i=0;i<n;i++)
	{
		int x,y;
		if(s[i]=='?')
		{
			++m;
			cin>>a1[i]>>a2[i];
		}
	}
	ll ans=0,val=0;bool flag=1;
	for(int i=0;i<n;i++)
	{
		if(s[i]=='?') q.push({a1[i]-a2[i],i});
		if(s[i]=='(') ans++;
		else if(s[i]==')'||s[i]=='?') ans--,s[i]=')';
		val+=a2[i];
		while(ans<0)
		{
			if(q.empty())
			{
				flag=0;
				break;
			}
			else
			{
				ans+=2;
				val+=q.top().x_;
				s[q.top().y_]='(';
				q.pop();
			}
		}
	}
	if(ans!=0) flag=0;
	if(!flag) cout<<-1;
	else cout<<val<<"\n"<<s;
	return 0;
}
```

### P3723 [AH2017/HNOI2017] 礼物

我们将 $c$ 加进差异值的式子里面计算

$$
\begin{aligned}
&\quad\sum_{i=1}^n(x_i+c-y_i)^2\\
&=\sum_{i=1}^n(x_i^2+c^2+y_i^2-2x_iy_i+2x_ic-2y_ic)\\
&=nc^2+2c\sum_{i=1}^n(x_i-y_i)+\sum_{i=1}^n(x_i^2+y_i^2)-2\sum_{i=1}^nx_iy_i
\end{aligned}
$$

观察到这是一个开口向下的二次函数，要让差异值最小肯定是让 $c=-\frac{\sum_{i=1}^n(x_i-y_i)}{n}$。

然后还有一个问题是求 $\sum_{i=1}^nx_iy_i$ 的最大值，考虑如何快速计算 $\sum_{i=1}^nx_iy_i$

我们将 $x$ 数组倒置 $z_{i}=x_{n-i+1}$ 那么上式等于 $\sum_{i=1}^nz_{n-i+1}y_i$ 即 $z$ 和 $y$ 的卷积。可以使用 fft 计算。

考虑找的是最大化的一个排列，我们可以将 $z$ 倍增，然后和 $y$ 卷，卷积之后的数组在 $n+1\sim 2n$ 项处做最大值即可。

最后答案应该是:

$$
ans=-\frac{[\sum_{i=1}^n(x_i-y_i)]^2}n-2\sum_{i=1}^nx_iy_i+\sum_{i=1}^n(x_i^2+y_i^2)
$$

但是注意这里的 $c$ 是整数所以我们需要代入对称轴附近的两个整数值进行比较，然后再加剩下的项。

### 『NOIp2023』A 词典

一个单词内的字母任意交换，可以使得单词可以被变成它的任意一个字母排列。

对于一个单词 $w_i$ 我们贪心地想，将这个单词变成字符序最小的排列，将其他的单词全部变成最大的排列，然后如果与有比这个单词小的就不行。

在实现上我们只需要比较当前最小排列的单词 $w_i$ 和一个最大排列的单词 $w_j$ 的第一个字母即可。假设第一个字母分别是 $min_i$ 和 $max_j$ ，那么如果 $min_i\ge max_j$ 就是不行的。大于的情况不必要多说。对于等于的情况在 $w_j$ 的下一个字母一定是 $\le max_j$ 的，而 $w_i$ 的下一个字母一定是 $\ge min_i$ 的，又因为题目保证两个单词字母集合一定不相同，所以一定存在一个位置，两个位置最多只有一边还和前面相等。

小常数 $n^2$ 能够通过该题。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=3010;

int n,m,tot=0;
char s[N];
int maxx[N],minn[N];

int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0); cout.tie(0);
	cin>>n>>m;
	for(int i=1;i<=n;i++)
	{
		cin>>s;
		maxx[i]=(int)s[0]-'a',minn[i]=(int)s[0]-'a';
		for(int j=0;j<m;j++)
		{
			maxx[i]=max(maxx[i],s[j]-'a');
			minn[i]=min(minn[i],s[j]-'a');
		}
	}

	for(int i=1;i<=n;i++)
	{
		int flag=1;
		for(int j=1;j<=n;j++)
		{
			if(j!=i&&minn[i]>=maxx[j])
			{
				flag=0;
				break;
			}
		}
		cout<<flag;
	}
	return 0;
}
```

###  P2572 [SCOI2010] 序列操作

线段树。

首先对于一个区间，我们需要存储 $8$ 个量来保证算出答案：$1$ 的个数，$0$ 的个数，最左边连续 $1/0$ 个数，最右边连续 $1/0$ 个数，区间内最长连续 $1/0$ 个数。

可以如下定义一个节点：

```cpp
struct node
{
	int cnt1,cnt0,ls1,ls0,rs1,rs0,ss1,ss0;
	/*1 的个数，0 的个数，最左边连续 1/0 个数，最右边连续 1/0 个数，区间内最长连续 1/0 个数*/
	int lson,rson;//左右节点位置。

#define lnode tree[node].lson
#define rnode tree[node].rson

	void init()
	{
		cnt1=cnt0=ls1=ls0=rs1=rs0=ss1=ss0=lson=rson=0;
	}
	void modf(int x)//区间赋值 x=(1,0)
	{
		int len=(cnt1+cnt0>0)?(cnt1+cnt0):1;
		if(x==1)
		{
			cnt1=ss1=ls1=rs1=len;
			cnt0=ss0=ls0=rs0=0;
		}
		if(x==0)
		{
			cnt1=ss1=ls1=rs1=0;
			cnt0=ss0=ls0=rs0=len;
		}
	}
	void rev()//区间取反
	{
		swap(cnt1,cnt0); swap(ls1,ls0); swap(rs1,rs0); swap(ss1,ss0);
	}
} tree[N<<3];
```

然后对于两个修改操作：区间赋值和区间翻转。

我们设两个 $lazytag$：$tag1$ 和 $tag2$。容易发现区间赋值操作会覆盖掉区间翻转。那么如何解决这个情况呢？

赋值的优先级比区间翻转高，那么我们每次涉及到赋值操作 (包括下推 $lazytag$ ) 的时候就将对应区间的 $tag2$ 清空，这也决定了我们会优先下推 $tag1$。

于是两个修改操作以及 `Pushdown` 函数的代码如下：

```cpp
int tag1[N<<3],tag2[N<<3];//区间赋值(-1,0,1)，区间取反 (0,1)
void push_down(int node,int start,int end)
{
	if(~tag1[node])//赋值
	{
		tag1[lnode]=tag1[rnode]=tag1[node];
		tree[lnode].modf(tag1[node]),tree[rnode].modf(tag1[node]);
		tag2[lnode]=0; tag2[rnode]=0;
		tag1[node]=-1;
	}
	if(tag2[node])//取反/如果一个节点同时有取反和赋值，一定是先赋值再取反
	{
		tag2[lnode]^=1; tag2[rnode]^=1;
		tag2[node]=0;
		tree[lnode].rev(); tree[rnode].rev();
	}
}
void modf0(int node,int start,int end,int l,int r,int x)//赋值
{
	if(l<=start&&end<=r)
	{
		tag1[node]=x;tag2[node]=0;//赋值会把节点的翻转标记覆盖掉
		tree[node].modf(x);
		return ;
	}
	int mid=start+end>>1;
	push_down(node,start,end);
	if(l<=mid) modf0(lnode,start,mid,l,r,x);
	if(r>mid) modf0(rnode,mid+1,end,l,r,x);
	push_up(node,start,end);
}

void modf2(int node,int start,int end,int l,int r)//翻转
{
	if(l<=start&&end<=r)
	{
		tag2[node]^=1;
		tree[node].rev();
		return ;
	}
	int mid=start+end>>1;
	push_down(node,start,end);
	if(l<=mid) modf2(lnode,start,mid,l,r);
	if(r>mid) modf2(rnode,mid+1,end,l,r);
	push_up(node,start,end);
}

```

然后是查询操作，第一个自不必说，对于第二个操作，一个节点的答案应该有以下三部分中选择：左子节点的最大连续段长度，右子节点的最大连续段长度，跨越两个子节点的最大连续段。

实现：
```cpp
int query2(int node,int start,int end,int l,int r)
{
	if(r<start||l>end) return 0;
	if(l<=start&&end<=r) return tree[node].ss1;
	int mid=(start+end)>>1;
	push_down(node,start,end);
	int ans=0;
	if(l<=mid) ans=max(ans,query2(lnode,start,mid,l,r));
	if(r>mid) ans=max(ans,query2(rnode,mid+1,end,l,r));
	if(l<=mid&&r>mid&&lnode&&rnode)
		ans=max(ans,min(tree[lnode].rs1,mid-l+1)+min(tree[rnode].ls1,r-mid));//区间内最大与区间间最大
	push_up(node,start,end);
	return ans;
}
```

完整代码
```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=2e5+10;

int n,m;
int arr[N];

struct node
{
	int cnt1,cnt0,ls1,ls0,rs1,rs0,ss1,ss0;
	/*1 的个数，0 的个数，最左边连续 1/0 个数，最右边连续 1/0 个数，区间内最长连续 1/0 个数*/
	int lson,rson;//左右节点位置。

#define lnode tree[node].lson
#define rnode tree[node].rson

	void init()
	{
		cnt1=cnt0=ls1=ls0=rs1=rs0=ss1=ss0=lson=rson=0;
	}
	void modf(int x)//区间赋值 x=(1,0)
	{
		int len=(cnt1+cnt0>0)?(cnt1+cnt0):1;
		if(x==1)
		{
			cnt1=ss1=ls1=rs1=len;
			cnt0=ss0=ls0=rs0=0;
		}
		if(x==0)
		{
			cnt1=ss1=ls1=rs1=0;
			cnt0=ss0=ls0=rs0=len;
		}
	}
	void rev()//区间取反
	{
		swap(cnt1,cnt0); swap(ls1,ls0); swap(rs1,rs0); swap(ss1,ss0);
	}
} tree[N<<3];
int ntot=0,root=0;

int tag1[N<<3],tag2[N<<3];//区间赋值(-1,0,1)，区间取反 (0,1)


void push_up(int node,int start,int end)
{
	int mid=(start+end)>>1;
	int llen=mid-start+1,rlen=end-mid;
	tree[node].cnt0=tree[lnode].cnt0+tree[rnode].cnt0;
	tree[node].cnt1=tree[lnode].cnt1+tree[rnode].cnt1;
	tree[node].ls0=(tree[lnode].ls0<llen?tree[lnode].ls0:llen+tree[rnode].ls0);
	tree[node].ls1=(tree[lnode].ls1<llen?tree[lnode].ls1:llen+tree[rnode].ls1);
	tree[node].rs0=(tree[rnode].rs0<rlen?tree[rnode].rs0:rlen+tree[lnode].rs0);
	tree[node].rs1=(tree[rnode].rs1<rlen?tree[rnode].rs1:rlen+tree[lnode].rs1);
	tree[node].ss1=max(tree[lnode].rs1+tree[rnode].ls1,max(tree[lnode].ss1,tree[rnode].ss1));
	tree[node].ss0=max(tree[lnode].rs0+tree[rnode].ls0,max(tree[lnode].ss0,tree[rnode].ss0));
}

void push_down(int node,int start,int end)
{
	if(~tag1[node])//赋值
	{
		tag1[lnode]=tag1[rnode]=tag1[node];
		tree[lnode].modf(tag1[node]),tree[rnode].modf(tag1[node]);
		tag2[lnode]=0; tag2[rnode]=0;
		tag1[node]=-1;
	}
	if(tag2[node])//取反/如果一个节点同时有取反和赋值，一定是先赋值再取反
	{
		tag2[lnode]^=1; tag2[rnode]^=1;
		tag2[node]=0;
		tree[lnode].rev(); tree[rnode].rev();
	}
}

void build(int &node,int start,int end)
{
	if(!node)
	{
		node=++ntot;
		tag1[ntot]=-1;
		tree[ntot].init();
		tag1[node]=-1;
	}
	if(start==end)
	{
		tree[node].modf(arr[start]);
		return ;
	}
	int mid=(start+end)>>1;
	build(lnode,start,mid);
	build(rnode,mid+1,end);
	push_up(node,start,end);
	return ;
}

void modf0(int node,int start,int end,int l,int r,int x)//赋值
{
	if(l<=start&&end<=r)
	{
		tag1[node]=x;tag2[node]=0;//赋值会把节点的翻转标记覆盖掉
		tree[node].modf(x);
		return ;
	}
	int mid=start+end>>1;
	push_down(node,start,end);
	if(l<=mid) modf0(lnode,start,mid,l,r,x);
	if(r>mid) modf0(rnode,mid+1,end,l,r,x);
	push_up(node,start,end);
}

void modf2(int node,int start,int end,int l,int r)//翻转
{
	if(l<=start&&end<=r)
	{
		tag2[node]^=1;
		tree[node].rev();
		return ;
	}
	int mid=start+end>>1;
	push_down(node,start,end);
	if(l<=mid) modf2(lnode,start,mid,l,r);
	if(r>mid) modf2(rnode,mid+1,end,l,r);
	push_up(node,start,end);
}

int query1(int node,int start,int end,int l,int r)
{
	if(r<start||l>end) return 0;
	if(l<=start&&end<=r) return tree[node].cnt1;
	int mid=start+end>>1;
	push_down(node,start,end);
	int sum=0;
	if(l<=mid) sum+=query1(lnode,start,mid,l,r);
	if(r>mid) sum+=query1(rnode,mid+1,end,l,r);
	push_up(node,start,end);
	return sum;
}

int query2(int node,int start,int end,int l,int r)
{
	if(r<start||l>end) return 0;
	if(l<=start&&end<=r) return tree[node].ss1;
	int mid=(start+end)>>1;
	push_down(node,start,end);
	int ans=0;
	if(l<=mid) ans=max(ans,query2(lnode,start,mid,l,r));
	if(r>mid) ans=max(ans,query2(rnode,mid+1,end,l,r));
	if(l<=mid&&r>mid&&lnode&&rnode)
		ans=max(ans,min(tree[lnode].rs1,mid-l+1)+min(tree[rnode].ls1,r-mid));//区间内最大与区间间最大
	push_up(node,start,end);
	return ans;
}

#undef lnode
#undef rnode

void pos()
{
	for(int i=1;i<=n;i++)
		printf("%d ",query1(root,1,n,i,i));
	printf("\n");
}

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=n;i++) scanf("%d",&arr[i]);
	build(root,1,n);
	for(int i=1;i<=m;i++)
	{
		int x,l,r;
		scanf("%d%d%d",&x,&l,&r);
		l++,r++;
		if(x==0) modf0(root,1,n,l,r,0);
		if(x==1) modf0(root,1,n,l,r,1);
		if(x==2) modf2(root,1,n,l,r);
		if(x==3) printf("%d\n",query1(root,1,n,l,r));
		if(x==4) printf("%d\n",query2(root,1,n,l,r));
	}
	return 0;
}

```



###  P2501 [HAOI2006] 数字序列 解析

先看第一问。

我们考虑什么样的数需要保留。首先选定一个数 $a_i$ 作为基准，考虑在它后面的某个数 $a_j$，那么只有当 $a_j-a_i\ge i-j$ 时才有可能保留。那么我们构建一个新的数列 $b_i=a_i-i$ ，它的最长不下降子序列元素个数就是我们最多保留的数。

对于第二问，首先我们可以知道，原问题等价于把 $b$ 数组改得单调不降。

我们首先考虑 $b$ 的最长上升子序列中的两个相邻元素 $b_j,b_i(j\le i)$。

修改前 $b_i$ 和 $b_j$ 之间的数字一定 $\not\in [b_j,b_i]$，而合法的序列一定在 $[b_j,b_i]$ 内。首先我们可以想到把在外面的数全部移到最近的边界上，最优解一定是在这个基础上构造出来的。

然后我们考虑怎样继续构造是最优的。实际上，最优的解的形态肯定是以一个 $k\in[j,i]$ 为分界点，$b_{x\le k}=b_j,\ b_{x>k}=b_i$ 的一个情况。

为什么呢？我们先假设有一部分连续子序列夹在中间

对于只有一个元素的情况是显然的，把它移到靠近初始位置的那个 $b$ 更优秀。

对于多个元素，我们考虑对于这个子段向两边移动的代价。《容易发现》我们总是可以无偿甚至减少代价地将其转移到某种上文所述的最优解的情况。

于是我们设 $h(i)$ 为 $[1,i]$ 区间内的修改代价最小值。那么转移方程如下：

$$
h(i)=\underset{f(i)=f(j)+1}{\min}\{\ h(j)+w(j+1,i-1)\}
$$

其中

$$w(l,r)=\underset{l\le k\le r}{\min}\{\sum_{i=l}^k|b_i-b_l|+\sum_{i=k+1}^r|b_i-b_r|\}$$

#### 一些实现上的小细节

可以在做第一问的时候就用 vector 预处理出状态转移：即存一下所有长度为 $i$ 的子序列末尾。

由于 LCS 的前后可能还有元素要处理，所以添加 $b_0=-\infty,b_{n+1}=+\infty$。

记得开 `long long` 以及枚举间断点 $k$ 的时候只能枚举到 $i-1$
```cpp
#include<bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=4e4+10;
const ll inf=0x3f3f3f3f;

int n;
ll a[N],b[N],h[N];
int g[N],f[N];
vector<int> vec[N];

ll pre[N],suf[N];
void init(int l,int r)
{
	if(l>r) return ;
	pre[l]=0,suf[r-1]=0;
	for(int i=l+1;i<=r-1;i++) pre[i]=pre[i-1]+abs(b[i]-b[l]);
	for(int i=r-1;i>=l;i--) suf[i]=suf[i+1]+abs(b[i+1]-b[r]);

}

int main()
{
	scanf("%d",&n);
	for(int i=1;i<=n;i++) scanf("%lld",&a[i]);
	for(int i=1;i<=n;i++) b[i]=a[i]-(ll)i;
	int tot=1;
	g[tot]=b[1];f[1]=1;vec[1].push_back(1); b[n+1]=inf;
	for(int i=2;i<=n+1;i++)//最长不下降
	{
		if(b[i]>=g[tot])
		{
			g[++tot]=b[i];
			vec[tot].push_back(i);
			f[i]=tot;
		}
		else
		{
			int l=upper_bound(g+1,g+1+tot,b[i])-g;
			g[l]=b[i]; vec[l].push_back(i);
			f[i]=l;
		}
	}
	printf("%d\n",n-tot+1);
	b[0]=-inf;
	memset(h,0x3f3f3f3f,sizeof h);
	h[0]=0; vec[0].push_back(0);
	for(int i=1;i<=n+1;i++)
	{
		for(int p=0;p<vec[f[i]-1].size();p++)
		{
			int j=vec[f[i]-1][p];
			if(j>i||b[j]>b[i]) continue;
			init(j,i);
			for(int k=j;k<i;k++)
			{
				h[i]=min(h[i],h[j]+pre[k]+suf[k]);
			}
		}
	}
	printf("%lld",h[n+1]);
	return 0;
}
```


###  『NOIP2023』B 三值逻辑

对变量的操作分为两种：

1. 直接赋值：将 $TFU$ 三个值直接赋给某个变量。
2. 间接赋值：将某个变量的值(取反后)再赋给某个变量。

考虑直接找某个变量的来源。假设 $x_i$ 来源于 $x_j$ ，则意味着 $x_i$ 的最终值和 $x_j$ 的初始值相等。那么由于题目要求初始值和最终值相等，所以就是他们的初始值相等。

先假设所有操作只有 $U$ 和 $+$ 两种方式。那么我们可以 $x_i$ 和 $x_j$ 放在一个集合。如果一个变量被赋成了 $U$ 那么所有的变量都是 $U$。这个过程可以使用并查集实现，可以给 $U$ 建一个虚拟节点来处理被 $U$ 直接复制的操作。

再考虑把 $+-$ 操作都加上。我们会发现另一种情况：要求 $x_i=\neg\ x_i$ 的情况，这也是要赋值为 $U$ 的。我们可以拆点，一个点表示 $x_i$ 一个点表示 $\neg x_i$。同时在记录来源的时候记录下是否取反。算完之后检查一下所有的 $i$ 有没有 $x_i=\neg x_i$ 的情况即可。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=2e5+10;
const int U=N-3,T=N-4;

int pa[N],pre[N];

void init()
{
	for(int i=1;i<=N-10;i++)
		pa[i]=i;
}
int find(int x)
{
	int xx=x;
	while(xx!=pa[xx]) xx=pa[xx];
	while(x!=xx)
	{
		int tmp=pa[x];
		pa[x]=xx; x=tmp;
	}
	return xx;
}

void merge(int x,int y)
{
	int xx=find(x),yy=find(y);
	if(xx==yy) return ;
	pa[xx]=yy;
}

bool check(int x,int y)
{
	return find(x)==find(y);
}

int n,m;
void solve()
{
	init();
	cin>>n>>m;
	for(int i=1;i<=n;i++) pre[i]=i;
	for(int i=1;i<=m;i++)
	{
		char v;
		cin>>v;
		if(v=='+'||v=='-')
		{
			int x,y;
			cin>>x>>y;
			pre[x]=pre[y]*(v=='-'?-1:1);
		}
		else
		{
			int x;
			cin>>x;
			pre[x]=(v=='U'?U:T);
		}
	}
	for(int i=1;i<=n;i++)
	{
		if(abs(pre[i])==U) merge(i,n+i);//i拆点:i,i+n
		else if(abs(pre[i])==T) continue;
		else if(pre[i]>0)
		{
			merge(i,pre[i]);
			merge(i+n,pre[i]+n);
		}
		else if(pre[i]<0)
		{
			int tmp=abs(pre[i]);
			merge(i,tmp+n);
			merge(i+n,tmp);
		}
	}
	int ans=0;
	for(int i=1;i<=n;i++)
		ans+=check(i,i+n);
	cout<<ans<<"\n";
}

int main()
{
	ios::sync_with_stdio(0);
	cin.tie(0); cout.tie(0);
	int c,t;
	cin>>c>>t;
	while(t--) solve();
	return 0;
}
```

###  P4316 绿豆蛙的归宿

期望 Dp 入门。

设状态 $f(i)$ 为从点 $i$ 走到 $n$ 的期望值。状态转移方程：

$$
f(i)=\frac1{oud_i}\sum_{(i,j)\in E}f(j)+w(i,j)
$$

其中 $oud_i$ 为点 $i$ 的出度，$w(i,j)$ 是边 $(i,j)$ 的边权。

初始值 $f(n)=0$，拓补排序倒着走即可。


###  P1073 [NOIP2009 提高组] 最优贸易

我们试图找到一条路径，最大化 $w_i-w_j,\ (i\ge j)$。

考虑取一个分界点 $k$，然后问题就是使得 $1\to k$ 的路径上点权最小值和 $k\to n$ 的路径上的点权最大值差值最大。

现在关键在于求 $1\to k$ 的点权最小值和 $k\to n$ 路径的点权最大值。我们可以利用类似于 SPFA 的方法来求。对于 $k\to n$ 建反图跑 $n\to k$ 即可。

```cpp
#include <bits/stdc++.h>
using namespace std;

const int N=1e5+10,M=5e5+10;

int ver[M<<1],nxt[M<<1],head[N],tot=0;
void add(int x,int y)
{
	ver[++tot]=y; nxt[tot]=head[x]; head[x]=tot;
}
int ver2[M<<1],nxt2[M<<1],head2[N],tot2=0;//反图
void add2(int x,int y)
{
	ver2[++tot2]=y; nxt2[tot2]=head2[x]; head2[x]=tot2;
}
int n,m;
int poi[N];
int dis1[N],dis2[N],vis[N];
queue<int> q;
void spfa1()//寻找 1—k 的最小值
{
	memset(dis1,0x3f,sizeof dis1);
	dis1[1]=poi[1];
	q.push(1);
	while(!q.empty())
	{
		int x=q.front();
		q.pop();
		for(int i=head[x];i;i=nxt[i])
		{
			int y=ver[i];
			if(dis1[y]>min(dis1[x],poi[y]))
			{
				dis1[y]=min(dis1[x],poi[y]);
				q.push(y);
			}
		}
	}
}

void spfa2()
{
	while(!q.empty()) q.pop();
	memset(dis2,-0x3f3f3f3f,sizeof dis2);
	dis2[n]=poi[n];
	q.push(n);
	while(!q.empty())
	{
		int x=q.front();
		q.pop();
		for(int i=head2[x];i;i=nxt2[i])
		{
			int y=ver2[i];
			if(dis2[y]<max(poi[y],dis2[x]))
			{
				dis2[y]=max(poi[y],dis2[x]);
				q.push(y);
			}
		}
	}
}

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=n;i++) scanf("%d",&poi[i]);
	for(int i=1;i<=m;i++)
	{
		int x,y,p;
		scanf("%d%d%d",&x,&y,&p);
		if(p==1) add(x,y),add2(y,x);
		if(p==2) add(x,y),add(y,x),add2(x,y),add2(y,x);
	}
	spfa1(); spfa2();
	int ans=0;
	for(int k=1;k<=n;k++)
		ans=max(ans,dis2[k]-dis1[k]);
	printf("%d",ans);
	return 0;
}
```

###  P2047 [NOI2007] 社交网络

$n\le 100$

核心要点是 Floyd 算法在求全源最短路的时候就利用了“中转点”的想法。

我们可以在 $f(i,j)\le f(i,k)+f(k,j)$ 的时候多记录一个 $i$ 到 $j$ 的最短路数目 $g(i,j)=g(i,k)\times g(k,j)$ 。

显然 $g(i,k)\times g(k,j)$ 表示经过 $k$ 的 $i\to j$ 的最短路数目。

注意当 $f(i,j)=f(i,k)+f(k,j)$ 的时候是 $g(i,j)=g(i,j)+g(i,k)\times g(k,j)$

最后对于每一个 $k$，我们枚举 $i,j$，答案:
$$
ans_k=\sum_{i\ne j\ne k,f(i,j)=f(i,k)+f(k,j) }\frac{g(i,k)\times g(k,j)}{g(i,j)}
$$

### P3870 [TJOI2009] 开关

没什么好说的，区间维护取反，同时维护区间内 $0$ 和 $1$ 的数量，取反的时候就交换。

###  P1253 扶苏的问题

关键问题在于区间赋值会把区间加覆盖掉。所以我们要考虑 lazytag 的下传问题。

区间赋值的优先度较高，那么我们先下传区间赋值，顺便把子节点的区间加 tag 清除掉。最后再下传当前节点的区间加 tag。

在进行区间赋值的时候，打上 lazytag 的同时也要清除区间加的 tag。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e6+10;
const ll INF=1e18+10;

int n,m;
ll poi[N];
ll tree[N<<2],tag1[N<<2],tag2[N<<2];//区间赋值，区间加

#define lnode node<<1
#define rnode node<<1|1
#define DEFMID int mid=(start+end)>>1

void push_up(int node)
{
	tree[node]=max(tree[lnode],tree[rnode]);
}

void push_down(int node,int start,int end)
{
	DEFMID;
	if(tag1[node]!=INF)
	{
		tree[lnode]=tree[rnode]=tag1[node];
		tag1[lnode]=tag1[rnode]=tag1[node];
		tag2[lnode]=tag2[rnode]=0;
		tag1[node]=INF;
	}
	if(tag2[node]!=0)
	{
		tree[lnode]+=tag2[node]; tree[rnode]+=tag2[node];
		tag2[lnode]+=tag2[node]; tag2[rnode]+=tag2[node];
		tag2[node]=0;
	}
}

void build(int node,int start,int end)
{
	tag1[node]=INF;
	if(start==end)
	{
		tree[node]=poi[start];
		return ;
	}
	DEFMID;
	build(lnode,start,mid); build(rnode,mid+1,end);
	push_up(node);
}

void modf1(int node,int start,int end,int l,int r,ll x)
{
	if(l<=start&&end<=r)
	{
		tree[node]=x;
		tag1[node]=x; tag2[node]=0;
		return ;
	}
	DEFMID; push_down(node,start,end);
	if(l<=mid) modf1(lnode,start,mid,l,r,x);
	if(r>mid) modf1(rnode,mid+1,end,l,r,x);
	push_up(node);
}

void modf2(int node,int start,int end,int l,int r,ll x)
{
	if(l<=start&&end<=r)
	{
		tree[node]+=x;
		tag2[node]+=x;
		return ;
	}
	DEFMID; push_down(node,start,end);
	if(l<=mid) modf2(lnode,start,mid,l,r,x);
	if(r>mid) modf2(rnode,mid+1,end,l,r,x);
	push_up(node);
}

ll query(int node,int start,int end,int l,int r)
{
	if(end<l||start>r) return -INF;
	if(l<=start&&end<=r) return tree[node];
	DEFMID; push_down(node,start,end);
	ll ans=-INF;
	if(l<=mid) ans=max(ans,query(lnode,start,mid,l,r));
	if(r>mid) ans=max(ans,query(rnode,mid+1,end,l,r));
	push_up(node);
	return ans;
}

int main()
{
	scanf("%d%d",&n,&m);
	for(int i=1;i<=n;i++) scanf("%lld",&poi[i]);
	build(1,1,n);
	for(int i=1;i<=m;i++)
	{
		int op,l,r;
		scanf("%d%d%d",&op,&l,&r);
		if(op==1)
		{
			ll x;
			scanf("%lld",&x);
			modf1(1,1,n,l,r,x);
		}
		if(op==2)
		{
			ll x;
			scanf("%lld",&x);
			modf2(1,1,n,l,r,x);
		}
		if(op==3)
		{
			ll ans=query(1,1,n,l,r);
			printf("%lld\n",ans);
		}
	}
	return 0;
}
```

###  P1593 因子和

#### 题目描述

输入两个整数 $a$ 和 $b$，求 $a^b$ 的因子和。

由于结果太大，只要输出它对 $9901$ 取模的结果。
#### 数据规模与约定

对于全部的测试点，保证 $1 \leq a \leq 5 \times 10^7$，$0 \leq b \leq 5 \times 10^7$。
#### 解析

套公式。设 $n=p^{\alpha_1}_1p^{\alpha_2}_2p^{\alpha_3}_3\cdots p^{\alpha_k}_k$，那么因子个数：
$$
d(n)=\prod_{i=1}^k(1+p_i+p_i^2+\cdots+p_i^{\alpha_i})
$$

括号里面是一个等比数列，所以我们做一下求和得到：
$$
d(n)=\prod_{i=1}^k\frac{p^{\alpha_i+1}-1}{p_i-1}
$$

然后我们考虑直接将题目中的 $a$ 质因数分解，并处理出次数。注意到 $9901$ 是个质数套快速幂和逆元求解上面式子即可。

###  P3601 签到题

我们定义一个函数：$\operatorname{qiandao}(x)$ 为小于等于 $x$ 的数中，与 $x$ **不互质**的数的个数。

这题作为签到题，给出 $l$ 和 $r$，求出：

$$\sum_{i=l}^r \operatorname{qiandao}(i)\bmod 666623333$$

- 对于 $30\%$ 的数据，$l,r\leq 10^3$。
- 对于 $60\%$ 的数据，$l,r\leq 10^7$。
- 对于 $100\%$ 的数据，$1 \leq l \leq r \leq 10^{12}$，$r-l \leq 10^6$。

#### 解析

实际上题目求的是

$$
\sum_{i=l}^r i-\varphi(i)
$$

分离一下就是
$$
\frac{(l+r)(r-l+1)}2-\sum_{i=l}^r\varphi(i)
$$

那么问题就是求这一段欧拉函数 $\varphi(n)$。

首先杜教筛肯定是不行的，$O(n^{\frac23})$ 的复杂度做 $10^{12}$ 的 $l,r$ 已经达到了 $10^8$，杜教筛的常数还非常的大，所以过不去的。

观察到 $r-l\le 10^6$ 我们可以如下考虑，先线筛 $10^6$ 的质因子，然后考虑每个质因子对于某个 $\varphi(i)$ 的贡献。

由于 $\varphi(n)=\prod_{i=1}^k(\frac{p_i-1}{p_i})$。所以质因子 $p_i$ 对于 $\varphi(n)$ 的贡献就是 $\frac{p_i-1}{p_i}$。我们利用类似埃氏筛的思想去更新即可。

但是还需要注意的是，$[l,r]$ 当中的数至多会有一个质因子 $p_{max}> 10^6$。所以我们在筛的时候需要将被筛的数的所有 $<10^6$ 的质因子全部除掉，最后剩下的就是那个大于 $10^6$ 的大质因子。

code:
```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=1e6+10;
const ll mod=666623333;

ll p[N],tot=0;
bool mp[N];
void init(ll n)
{
	for(ll i=2;i<=n;i++)
	{
		if(!mp[i]) p[++tot]=i;
		for(int j=1;i*p[j]<=n;j++)
		{
			ll tmp=(ll)i*p[j];
			mp[tmp]=1;
			if(i%p[j]==0) break;
		}
	}
}

ll phx[N],num[N];

ll infact(ll a)
{
	ll k=mod-2;
	ll res=1;
	while(k)
	{
		if(k&1) res=(res*a)%mod;
		a=(a*a)%mod;
		k>>=1;
	}
	return (res%mod+mod)%mod;
}

int main()
{
	init(N-10);
	ll l,r;
	scanf("%lld%lld",&l,&r);
	for(ll i=l;i<=r;i++) phx[i-l]=num[i-l]=i;
	for(int i=1;i<=tot;i++)
	{
		ll pi=p[i];
		for(ll k=max((l/pi),2ll);k*pi<=r;k++)//枚举倍数
		{
			ll x=k*pi;
			if(x<l||x>r) continue;
			phx[x-l]=phx[x-l]/pi*(pi-1);
			while(num[x-l]%pi==0) num[x-l]/=pi;
		}
	}
	for(ll i=l;i<=r;i++)
	{
		if(num[i-l]>1)
			phx[i-l]=phx[i-l]/num[i-l]*(num[i-l]-1);
	}
	ll ans=0;
	for(ll i=l;i<=r;i++)
		ans=(ans+i-phx[i-l])%mod;
	printf("%lld",(ans%mod+mod)%mod);
	return 0;
}
```

###  P5765 [CQOI2005] 珠宝

有一棵 $n$ 个结点的树，给每个点安排一个正整数编号，使得相邻点具有不同的编号，编号的总和尽量小。

对于 $100\%$ 的数据，$1≤n≤50000$。

首先由四色定理，颜色数量不会大于 $4$。我们考虑树形 dp。

令 $dp(u,j)$ 为 $i$ 节点染上 $j$ 色，子树内的最小编号和。同时规定 $1$ 为树的根节点，且所有的边方向由根向叶。

$$
dp(u,j)=\min_{(u,v)\in E,\ k\ne j}\{dp(v,k)\}+j。
$$
复杂度 $O(n)$，常数略大。

###  P2569 [SCOI2010] 股票交易

考虑 dp

设状态 $f(i,j)$ 代表第 $i$ 天时持有 $j$ 张股票的最大收益。考虑 $4$ 种情况。

1. 在这天第一次购买：

	$f(i,j)=-ap_i\times j$。

2. 在这天什么也没干

	$f(i,j)=\max\{f(i,j),f(i-1,j)\}$

3. 在这天购买(前面已经进行过买卖操作)

	$$f(i,j)=\max_{x\in[0,i-W-1],k\in[j-as_i,j]}\{f(x,k)-ap_i\times (j-k)\}$$
	考虑到实际上 $i-W-1$ 之前的状态都被 $i-W-1$ 考虑了，方程简化为：
	$$f(i,j)=\max_{k\in[j-as_i,j)}\{f(i-W-1,k)-ap_i\times (j-k)\}$$
4. 在这天卖出(前面已经进行过买卖操作)

	$$f(i,j)=\max_{k\in(j,\min(j+bs_i,maxP)]}\{f(i-W-1,k)-ap_i\times (j-k)\}$$

直接做 DP 时间复杂度 $O(n^3)$ 过不了，我们考虑怎么优化一下。

观察 3,4 方程，我们发现实际上这是一个类似于滑动窗口的问题。可以使用单调队列优化掉枚举 $k$ 的这一维度。时间复杂度 $O(n^2)$。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=2010;

int T,maxP,W;
int ap[N],bp[N],as[N],bs[N];
ll f[N][N];
int q[N];

int main()
{
	scanf("%d%d%d",&T,&maxP,&W);
	for(int i=1;i<=T;i++)
		scanf("%d%d%d%d",ap+i,bp+i,as+i,bs+i);
	memset(f,-0x3f3f3f3f,sizeof f);
	for(int i=1;i<=T;i++)
	{
		for(int j=0;j<=maxP;j++)
		{
			if(j<=as[i]) f[i][j]=-ap[i]*j;//凭空买
			f[i][j]=max(f[i-1][j],f[i][j]);
		}
	}
	for(int i=W+1;i<=T;i++)
	{
		for(int j=0;j<=maxP;j++)
			f[i][j]=max(f[i-1][j],f[i][j]);
		int l=1,r=0;
		for(int j=0;j<=maxP;j++)
		{
			while(l<=r&&q[l]<j-as[i]) l++;
			while(l<=r&&f[i-W-1][q[r]]+q[r]*ap[i]<=f[i-W-1][j]+j*ap[i]) r--;
			q[++r]=j;
			if(l<=r)
				f[i][j]=max(f[i][j],f[i-W-1][q[l]]+q[l]*ap[i]-j*ap[i]);
		}
		l=1,r=0;
		for(int j=maxP;j>=0;j--)
		{
			while(l<=r&&q[l]>j+bs[i]) l++;
			while(l<=r&&f[i-W-1][q[r]]+q[r]*bp[i]<=f[i-W-1][j]+j*bp[i]) r--;
			q[++r]=j;
			if(l<=r)
				f[i][j]=max(f[i][j],f[i-W-1][q[l]]+q[l]*bp[i]-j*bp[i]);
		}
	}
	printf("%d",f[T][0]);
	return 0;
}
```

### P3067 [USACO12OPEN] Balanced Cow Subsets G


折半搜索。

从头搜到尾需要 $3^{n}$ 的时间复杂度，这肯定是不可接受的。

我们把整个数组分成两半来搜索，然后 meet in middle。设 $A,B$ 分别被分成了两部分 $a,b$ 和 $c,d$。那么 $a+b=c+d$。移个项 $a-c=-(b-d)$ 也就是让两部分各自的 $A,B$ 集合作差，差值为相反数。

搜索时记得记录一下当前状态选了哪些数字以及当前的加和有哪些状态，用于去重。

```cpp
#include <bits/stdc++.h>
using namespace std;
typedef long long ll;

const int N=25;

int n;
ll poi[N];
unordered_map<ll,int> mp;
int tot=0;
vector<int> st[(1<<20)+5];
int vis[(1<<20)+5];

void dfs1(int x,ll sum,ll state)
{
	if(x>=n/2+1)
	{
		if(!mp[sum]) mp[sum]=++tot;
		st[mp[sum]].push_back(state);
		return ;
	}
	dfs1(x+1,sum+poi[x],state|(1<<x-1));
	dfs1(x+1,sum-poi[x],state|(1<<x-1));
	dfs1(x+1,sum,state);
}

void dfs2(int x,ll sum,ll state)
{
	if(x>=n+1)
	{
		int sums=mp[sum];
		if(sums)
		{
			for(int i=0;i<st[sums].size();i++)
				vis[st[sums][i]|state]=1;
		}
		return ;
	}
	dfs2(x+1,sum+poi[x],state|(1<<x-1));
	dfs2(x+1,sum-poi[x],state|(1<<x-1));
	dfs2(x+1,sum,state);
}

int main()
{
	scanf("%d",&n);
	for(int i=1;i<=n;i++) scanf("%lld",&poi[i]);
	dfs1(1,0,0);
	dfs2(n/2+1,0,0);
	int ans=0;
	for(int i=1;i<(1<<n);i++)
		ans+=vis[i];
	printf("%d",ans);
	return 0;
}
```
