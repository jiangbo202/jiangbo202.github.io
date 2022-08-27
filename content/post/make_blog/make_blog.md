---
title: "个人博客搭建"
date: 2022-08-27T15:52:41+08:00
draft: false
description: Github Pages, actions, hugo, hugo-theme-stack
image: personal_blog.jpg
comments: true
categories:
    - 个人博客
---


# 个人博客搭建
>    基于: github Pages  
>    主题: hugo-theme-stack  

## 本地博客(hugo)
### 安装hugo
macOS:
`brew install hugo`
其他环境参考 [hugo官网](https://gohugo.io/)

### 创建博客
使用命令: `hugo new site myblog` 
> myblog是名字任意取  

![结果](blog1.png)

### 设置主题
进入myblog目录
`cd myblog`
初始化git:
`git init`
下载主题hugo-theme-stack
`git submodule add https://github.com/CaiJimmy/hugo-theme-stack/ themes/hugo-theme-stack`
其他方式参考 [hugo-theme-stack文档](https://docs.stack.jimmycai.com/)
> 其他主题到这里选: https://themes.gohugo.io/

拷贝主题自带的配置:
`cp themes/hugo-theme-stack/exampleSite/config.yaml .`
![修改配置](blog2.png)
删除默认配置
`rm config.toml`
本地预览: `hugo server`  
然后浏览器打开 `http://localhost:1313/`
## github部署
### 创建仓库
![如图](blog3.jpeg)

### 添加文件
1. .gitignore
`echo "public" > .gitignore`
2. 创建目录.github/workflows和文件auto-deploy.yml(名字可改)
使用vim或者vscode编辑
*.github/workflows/auto-deploy.yml内容*
```yaml
name: GitHub Page Deploy
on:
  push:
    branches:
      - main
jobs:
  build-deploy:
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout main
        uses: actions/checkout@v3
        with:
          submodules: true
          fetch-depth: 0
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true
      - name: Build Hugo
        run: hugo
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_branch: gh-pages
          publish_dir: ./public
```
> 说明: 以上会监控main分支，如有变化，便触发构建最终发布到gh-pages分支
### 推至github
```
git remote add origin git@github.com:jiangbo202/jiangbo202.github.io.git
git branch -M main
git push -u origin main
注意替换自己的实际仓库地址
```
### 设置github Pages
![如图](blog4.jpeg)

## 结束
浏览器打开 (github用户名).github.io 能看到空白的博客

**代办**  

- [ ] 写新文章 
- [ ] 添加评论 
- [ ]  访问量

