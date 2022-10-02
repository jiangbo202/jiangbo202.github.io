---
title: "Docker Centos7"
description: 
date: 2022-10-01T17:16:11+08:00
image: docker_centos7/IMG_1870.jpg
math: 
license: 
hidden: false
comments: true
categories:
    - docker
    - centos7
tags:
    - docker
    - centos7
    - ssh
---

#  dockerd搭建centos7并通过ssh访问

**前提**
> 安装好docker并启动

**步骤**
### 下载centos7
命令: `docker pull centos:centos7`

### 启动镜像
命令:  
`docker run -d -p 5001:22 --name MyCentos --privileged=true centos:centos7 /usr/sbin/init`  
> 说明:  
> 1. --privileged=true  让容器内有root的权限   
> 2. 5001端口是通过5001访问容器  
> 3. MyCentos是容器名称，随便起  

![下载和启动](/docker_centos7/搭建centos并进入容器.png)

#### 进入并设置密码
进入容器:  
`docker exec -it MyCentos /bin/bash`  
设置密码:  
`passwd`  

#### ssh服务安装/启动
yum安装:  
`yum install openssh-server -y`  
启动命令:  
`systemctl restart sshd.service`  

> 如果是mac电脑可能会遇到错误:   
> `Failed to get D-Bus connection: No such file or directory`  
  
实测这个方法可解决:  
```
# Stop running Docker
test -z "$(docker ps -q 2>/dev/null)" && osascript -e 'quit app "Docker"'
# Install jq and moreutils so we can merge into the existing json file
brew install jq moreutils
# Add the needed cgroup config to docker settings.json
echo '{"deprecatedCgroupv1": true}' | \
  jq -s '.[0] * .[1]' ~/Library/Group\ Containers/group.com.docker/settings.json - | \
  sponge ~/Library/Group\ Containers/group.com.docker/settings.json
# Restart docker desktop
open --background -a Docker  
```   
> [来源](https://github.com/docker/for-mac/issues/6073#issuecomment-1028933577) 

成功启动后确认22端口是否开启  
`netstat -ntlp `  
![成功启动](/docker_centos7/成功启动后.png) 

#### 修改ssh配置
打开文件:  
`vi /etc/ssh/sshd_config`  
修改(如果是注释的, 则放开注释):   
`UsePAM no`和`PermitRootLogin yes`  
最后重启sshd:  
`systemctl restart sshd.service`  

### 登录验证
退出容器在本地连接:   
`ssh root@192.168.124.5 -p 5001`   
> 其中IP应该是自己本机的IP, 端口是启动容器指定的那个端口  
![成功登录](/docker_centos7/成功登录.png)

### 总结
  