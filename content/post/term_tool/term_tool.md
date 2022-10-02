---
title: "ssh终端工具(一键跳转或scp文件)"
description: 一键登录/scp上传下载文件/ssh执行命令的工具(go)
date: 2022-10-02T20:57:18+08:00
image: term_tool/IMG_1872.jpg
math: 
license: 
hidden: false
comments: true
categories:
    - 技术
    - golang
    - 2fa
tags:
    - golang
    - ssh
    - scp
    - 2fa
---

#  ssh终端工具(跳转/scp)

**仓库地址**   

* go-ssh-tool [github地址](https://github.com/jiangbo202/go-ssh-tool)
* 优点: 支持谷歌验证码

### 功能展示

#### 使用前

1. 从release下载最新go-ssh-tool.mac(或者go-ssh-tool.linux) 后缀是所使用的环境
2. 下载文件config.yaml(放在上面工具的相同目录)并填入自己的主机信息
3. 可以参考上一篇文章: docker搭建centos7并ssh访问[地址](https://jiangbo202.github.io/p/docker-centos7/) 测试本工具

#### 查看工具说明:   
`./ssh-tool.mac`  

#### 列出来所有主机:   
`./ssh-tool.mac host`  
![查看主机](/term_tool/查看主机清单.png)

#### 登录一个主机:   
`./ssh-tool.mac term -m 1`  
> -m: 主机序号  
![登录主机](/term_tool/登录主机.png)

#### 上传文件:   
`./ssh-tool.mac up -m 1 -f xxxx -d /tmp`  
> -f: 是本地的一个文件  
> -d: 上传到主机的哪个目录
![上传文件](/term_tool/上传文件.png)

#### 下载文件:   
`./ssh-tool.mac down -m 1 -s /root/anaconda-ks.cfg`  
> -s: 服务器上的文件  
> -t: 本地目录，可不传(默认本机)
![下载文件](/term_tool/下载文件.png)

#### 远程执行一个命令:   
`./ssh-tool.mac exe -m 1 -c "cat /etc/redhat-release"`  
> -c: 是命令，若包含空格，用引号引起来 
![执行一个命令](/term_tool/执行一个命令.png)

### 结束

由于工作中频繁登录机器和通过scp拷贝上下文件，为提升效率，做的一个小工具