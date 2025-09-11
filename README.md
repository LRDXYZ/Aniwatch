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
├── popular.html # 热门动漫页
├── latest.html # 最新更新页
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
| ├── siderbar.js # 侧边栏逻辑
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
- **动漫分类浏览**：支持按 TV 动画、剧场版等分类浏览。
- **动漫列表**：支持分类、状态筛选与搜索。
- **动漫详情**：展示动漫详细信息、预告片、剧集列表、用户评论。
- **用户系统**：支持注册、登录、登出、信息本地存储。
- **评论互动**：登录用户可在详情页发表评论。
- **响应式设计**：适配 PC 和移动端浏览。
- **本地存储**：用户数据、评论等信息存储于浏览器 LocalStorage。
- **多媒体支持**：背景音乐、视频播放等多媒体功能。

## 技术栈

- HTML5 + CSS3（Bootstrap 5、响应式布局）
- JavaScript（ES6+，模块化结构）
- Bootstrap 5 UI 框架
- Bootstrap Icons 图标库
- Canvas（评分图表等可视化）
- LocalStorage（本地数据存储）

## 快速开始

1. **克隆或下载本项目到本地**(git clone https://github.com/LRDXYZ/Aniwatch.git)
2. **推荐使用 VS Code 并安装 [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) 插件**
3. **右键 `index.html`，选择“Open with Live Server” 启动本地预览**
4. **如需体验完整功能，请在支持 LocalStorage 的现代浏览器中访问**

## 账号体验

- 默认测试账号：
  - 用户名：`123`
  - 密码：`123456`
- 可自行注册新账号体验

## 页面介绍

- **首页 (index.html)**: 展示网站主要内容，包括轮播图、热门推荐和最新更新
- **动漫列表 (list.html)**: 显示所有动漫，支持筛选和搜索功能
- **动漫详情 (detail.html)**: 显示特定动漫的详细信息和评论
- **最新更新 (latest.html)**: 展示最新更新的动漫
- **热门动漫 (popular.html)**: 展示最受欢迎的动漫
- **登录/注册 (login.html / register.html)**: 用户认证页面
- **关于我们 (about.html)**: 网站介绍和联系信息

## 核心特性

### 响应式设计
采用 Bootstrap 5 实现响应式布局，适配各种屏幕尺寸。

### 用户交互
- 用户注册与登录系统
- 评论系统
- 收藏功能
- 评分系统

### 多媒体体验
- 背景音乐播放控制
- 视频播放器
- 动漫预告片展示

### 数据可视化
使用 Canvas 技术展示动漫评分图表。

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 部署

本项目为纯前端项目，可直接部署到任何静态网站托管服务，如：
- GitHub Pages
- Netlify
- Vercel
- Firebase Hosting

## 开发指南

1. 所有页面遵循统一的设计风格和交互模式
2. JavaScript 采用模块化结构，便于维护和扩展
3. CSS 使用 BEM 命名规范，提高代码可读性
4. API 调用统一管理，便于后续扩展

## 版权声明

本项目仅用于学习与交流，动漫资源及图片仅作演示使用，禁止商用。如有侵权请联系删除。

---

**AniWatch 动漫观看网站 © 2025**