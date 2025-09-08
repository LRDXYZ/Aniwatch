# AniWatch 动漫观看网站

AniWatch 是一个为动漫爱好者打造的现代化动漫资源分享与在线观看平台，支持用户注册、登录、动漫浏览、详情查看、评论互动等功能。项目基于 HTML5、CSS3、JavaScript（ES6+）开发，界面美观，体验流畅，适合前端课程设计或个人学习参考。

## 目录结构
AniWatch/
├── index.html # 首页
├── list.html # 动漫列表页
├── detail.html # 详情页
├── login.html # 登录页
├── register.html # 注册页
├── about.html # 关于页
├── README.md # 项目说明文档
├── .gitignore # Git忽略文件
├── .github/ # GitHub配置
│ └── workflows/
│ └── deploy.yml # 部署工作流
├── css/ # 样式文件
│ ├── base.css # 基础样式
│ ├── common.css # 公共组件样式
│ └── page/ # 页面样式
│ ├── index.css
│ ├── list.css
│ ├── detail.css
│ ├── login.css
│ └── about.css
├── js/ # JavaScript文件
│ ├── common.js # 公共工具函数
│ ├── dom.js # DOM操作封装
│ └── page/ # 页面逻辑
│ ├── index.js
│ ├── list.js
│ ├── detail.js
│ ├── login.js
│ └── register.js
└── assets/ # 静态资源
├── images/ # 图片资源
│ ├── banner/ # 横幅图片
│ ├── poster/ # 动漫海报
│ └── avatar/ # 用户头像
├── icons/ # 图标资源
└── media/ # 多媒体资源
├── audio/ # 音频文件
└── video/ # 视频文件
## 主要功能

- **首页推荐**：展示热门动漫、最新更新、轮播图等。
- **动漫列表**：支持分类、状态筛选与搜索。
- **动漫详情**：展示动漫详细信息、预告片、剧集列表、用户评论。
- **用户系统**：支持注册、登录、登出、信息本地存储。
- **评论互动**：登录用户可在详情页发表评论。
- **响应式设计**：适配 PC 和移动端浏览。
- **本地存储**：用户数据、评论等信息存储于浏览器 LocalStorage。

## 技术栈

- HTML5 + CSS3（Bootstrap 5、响应式布局）
- JavaScript（ES6+，模块化结构）
- Canvas（评分图表等可视化）
- LocalStorage（本地数据存储）

## 快速开始

1. **克隆或下载本项目到本地**
2. **推荐使用 VS Code 并安装 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 插件**
3. **右键 `index.html`，选择“Open with Live Server” 启动本地预览**
4. **如需体验完整功能，请在支持 LocalStorage 的现代浏览器中访问**

## 账号体验

- 默认测试账号：
  - 用户名：`testuser`
  - 密码：`123456`
- 可自行注册新账号体验

## 预览截图


## 版权声明

本项目仅用于学习与交流，动漫资源及图片仅作演示使用，禁止商用。如有侵权请联系删除。

---

**AniWatch 动漫观看网站 © 2025**