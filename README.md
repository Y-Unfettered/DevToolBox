# DevToolBox

DevToolBox 是一个**个人工具收纳与分享**项目：把你开发的小工具、网上好用的在线工具、优质网站统一归集，形成一个可搜索、可分类的清单页面，方便你分享给朋友和同事。

## 这个项目能做什么？

- 收纳：集中管理你常用的工具与网站（标题、摘要、图标、分类、链接）
- 展示：通过 GitHub Pages 生成一个公开的静态展示页
- 维护：本地后台可编辑内容，一键发布更新静态页数据

## 前后端说明

### 前端（静态展示）

- 使用 GitHub Pages 托管
- 展示内容：工具列表、分类、搜索、统计、底部信息等
- 数据来源：仓库中的 `data/devtoolbox.json`（由后端生成）

### 后端（本地管理）

- 用于编辑工具、分类、设置等信息
- 提供一键发布接口（本地使用）
- **不建议也不允许部署到公网**（只用于本地维护数据）

### 工作流（推荐）

1) 本地运行后端后台，编辑内容  
2) 一键发布 → 生成 JSON → 提交 → 推送  
3) GitHub Pages 自动更新前端页面

## 这种方式的好处

- **无需常驻后端**：Pages 是静态站点，省成本、稳定  
- **更新简单**：改数据 → 一键发布 → 页面自动更新  
- **更安全**：后台只在本地运行，不暴露到公网  
- **便于分享**：一个链接即可展示所有工具

## 如何复刻与运行

### 1. 克隆仓库

```bash
git clone https://github.com/Y-Unfettered/DevToolBox.git
cd DevToolBox
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动后端

```bash
npm run start
```

### 4. 访问地址

- 前端页面：`http://127.0.0.1:3000/`
- 后台管理：`http://127.0.0.1:3000/admin.html`

## 数据修改与一键发布

### 使用方式

1) 在后台修改数据  
2) 点击「一键发布」  
3) 后端会自动完成：导出 JSON → 提交 → 推送  

### 注意事项

- **必须在本机运行**（只允许本地调用）
- **需要 Git 环境**：已安装 Git，并对远程仓库有 push 权限
- **需要 Node 环境**：Node.js 20+（建议）  
- **需要已登录 GitHub**：命令行或凭据已配置

### 这个脚本别人克隆也能用吗？

能用，但必须满足：

- 需要自己 fork 并推送到自己的仓库
- 有 push 权限  
- 本地已配置好 Git 用户名/邮箱和凭据  
- 本地能正常执行 `git push`

否则会发布失败。

## 重要提醒

- **后台不能放网上，只能本地使用**  
- GitHub Pages 只展示静态页面，不包含后台功能  

## 文件结构（主要）

```text
DevToolBox/
├─ data/
│  ├─ devtoolbox.db           # 本地数据库（不提交）
│  └─ devtoolbox.json         # 前端读取的数据（需要提交）
├─ scripts/
│  ├─ export-data.js          # 导出 JSON
│  └─ publish.ps1             # 一键发布脚本
├─ src/
│  ├─ routes/                 # API 路由
│  │  ├─ tools.js
│  │  ├─ categories.js
│  │  ├─ settings.js
│  │  ├─ stats.js
│  │  ├─ export.js
│  │  └─ publish.js
│  ├─ db.js                   # SQLite 初始化
│  ├─ exporter.js             # 导出逻辑
│  └─ server.js               # 服务入口
├─ index.html                 # 前端主页（Pages 使用）
├─ admin.html                 # 后台页面（本地使用）
├─ categories.html
├─ settings.html
├─ stats.html
├─ package.json
└─ README.md
```
