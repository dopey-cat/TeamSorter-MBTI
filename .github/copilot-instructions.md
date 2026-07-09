# Copilot Instructions for AI Coding Agents

## 项目架构概览
- 前端：基于 Vue.js，主入口为 `src/main.js`，页面和组件位于 `src/views/` 和 `src/components/`。
- 后端：Node.js/Express 服务端代码在 `server/`，入口为 `server/index.js`，数据模型在 `server/models/`，路由在 `server/routes/`。
- 管理后台：`src/admin/` 下有独立的管理页面和路由。

## 关键开发流程
- 安装依赖：`npm install`
- 启动开发服务器（前端）：`npm run serve`
- 构建生产包：`npm run build`
- 代码检查：`npm run lint`
- 后端启动：进入 `server/` 目录，运行 `node index.js` 或 `npm start`（如有定义）

## 重要约定与模式
- Vue 路由集中管理于 `src/router/index.js` 和 `src/admin/router.js`。
- 组件按功能拆分，页面级组件在 `views/`，可复用组件在 `components/`。
- 后端模型（如 `App.js`, `User.js`）为 Mongoose Schema，路由与模型解耦。
- 前后端通过 RESTful API 通信，接口定义在 `server/routes/`。
- 管理后台与主站前端分离，路由和视图独立。

## 集成与依赖
- 前端依赖见 `package.json`，后端依赖见 `server/package.json`。
- 配置文件：根目录下有 `vue.config.js`、`babel.config.js`、`jsconfig.json`。
- 静态资源放在 `public/`，入口 HTML 为 `public/index.html`。

## 典型开发示例
- 新增前端页面：在 `src/views/` 新建 Vue 文件，并在 `src/router/index.js` 注册路由。
- 新增后端接口：在 `server/routes/` 新建路由文件，挂载到 `server/index.js`。
- 新增数据模型：在 `server/models/` 新建 JS 文件，导出 Mongoose Schema。

## 其他说明
- 详细开发命令和配置见 `README.md`。
- 遵循现有目录结构和分层，保持前后端解耦。
- 参考已有文件风格和命名，保持一致性。
