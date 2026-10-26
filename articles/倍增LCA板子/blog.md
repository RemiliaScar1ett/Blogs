---
title: "倍增LCA板子"
slug: legacy-74605c3e505c
tree:
  - "笔记"
  - "图论"
tags:
  - 图论
  - 树上算法
date: 2026-08-15
uid: 3ad9db55-8738-4a66-a744-83e4a799e05a
dateKind: collected
---
```cpp
#include <bits/stdc++.h>
using namespace std;
int fa[2000005][35];//结点i的第2^j级祖先
int dpt[2000010];
int head[2000010];
int ver[2000010];
int nxt[2000010];
int lg[2000010];//预处理一下log(i)+1
int tot=0;
int n,m,s;

void refer()
{
	for(int i=1;i<=n;i++)
	{
		lg[i]=lg[i-1]+(1<<lg[i-1]==i);
	}
}
void dfs(int x,int f)
{
	fa[x][0]=f; //结点的第1级祖先就是他的父节点
	dpt[x]=dpt[f]+1; /*记录结点深度*/
	int t=lg[dpt[x]];
	for(int i=1;i<=t;i++)
	{
		fa[x][i]=fa[fa[x][i-1]][i-1];//x的2^i级祖先=x的2^(i-1)级祖先的2^(i-1)级祖先
	}
	for(int i=head[x];i;i=nxt[i])
	{
		int y=ver[i];
		if(y==f) continue;
		dfs(y,x);//继续向下
	}
}
int latest_common_ancestors(int x,int y)
{
	if(dpt[x]<dpt[y]) swap(x,y);//将x点设为深度较深的点
	while(dpt[x]>dpt[y])
	{
		x=fa[x][lg[dpt[x]-dpt[y]]-1];
	}
	if(x==y) return y;//x跳上来发现就是y，那y就肯定是LCA
	for(int k=lg[dpt[x]]-1;k>=0;k--) //向上
	{
		if(fa[x][k]!=fa[y][k])//因为我们只跳到公共祖先的下一层所以x,y肯定不相等 ，判定他们的父节点是否相等不相等就继续往下;
		{
			x=fa[x][k],y=fa[y][k];
		}
	}
	return fa[x][0];//返回的是父节点
}
void add(int x,int y)
{
	ver[++tot]=y;
	nxt[tot]=head[x];
	head[x]=tot;
}
int main()
{
////	freopen("answer.txt","w",stdout);
	scanf("%d%d%d",&n,&m,&s);
	refer();//预处理log2(i)+1;
	for(int i=1;i<n;i++)
	{
		int x,y;
		scanf("%d%d",&x,&y);
		add(x,y);
		add(y,x);
	}
	dfs(s,s);
	for(int i=1;i<=m;i++)
	{
		int a,b;
		scanf("%d%d",&a,&b);
		printf("%d\n",latest_common_ancestors(a,b));
	}
	return 0;
}
```
