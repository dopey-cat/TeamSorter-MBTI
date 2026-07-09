# TeamSorter-MBTI

> 基于 MBTI 人格类型与 WCPA 能力模型的团队人员智能匹配系统

## ✨ 功能特性

### 🧠 MBTI 人格测试
- 支持完整的 16 种 MBTI 人格类型测试
- 详细的人格类型描述、优势分析和发展建议
- 测试结果自动保存与管理

### 🎯 WCPA 8维能力测评
- **创新能力** - 创造性思维与问题解决能力
- **逻辑思维** - 分析推理与判断能力
- **沟通表达** - 信息传递与说服能力
- **团队协作** - 合作共事与协同能力
- **领导力** - 组织协调与决策能力
- **执行力** - 任务推进与完成能力
- **学习能力** - 知识获取与应用能力
- **抗压能力** - 压力应对与心理调适能力
- 可视化能力雷达图展示

### 🔗 岗位匹配评估
- 16 种人格类型与岗位的智能匹配
- 自定义个人能力得分与岗位要求阈值
- 综合匹配度计算与可视化展示

### 📋 任务匹配模块
- 基于 MBTI 类型和能力维度的人员任务智能分配
- 支持多人同时匹配，自动计算匹配度
- 匹配结果导入个人档案功能

## 🛠️ 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Vue Router 4 |
| UI 组件库 | Element Plus |
| 图表库 | ECharts + vue-echarts |
| 后端框架 | Node.js + Express 5 |
| 数据存储 | 内存数据库 (store.js) |
| 构建工具 | Vue CLI 5 |

## 📁 项目结构

```
TeamSorter-MBTI/
├── public/                 # 静态资源
├── server/                 # 后端服务
│   ├── data/               # 测试数据文件
│   ├── models/             # 数据模型
│   ├── routes/             # API 路由
│   │   └── mbtiRoutes.js   # MBTI 相关 API
│   ├── store.js            # 内存数据库
│   ├── index.js            # 服务入口
│   └── package.json        # 后端依赖
├── src/                    # 前端代码
│   ├── assets/             # 静态资源
│   ├── router/             # 路由配置
│   ├── views/              # 页面组件
│   │   ├── MbtiPage.vue    # MBTI 主页面
│   │   ├── MbtiTest.vue    # MBTI 测试
│   │   ├── WcpaTest.vue    # WCPA 能力测评
│   │   └── TaskMatch.vue   # 任务匹配
│   ├── App.vue             # 根组件
│   └── main.js             # 入口文件
├── start.bat               # Windows 启动脚本
├── package.json            # 前端依赖
└── vue.config.js           # Vue CLI 配置
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- npm >= 9.0.0

### 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install
```

### 启动开发服务器

```bash
# 方式一：分别启动（推荐）
# 终端1 - 启动后端服务
cd server && node index.js

# 终端2 - 启动前端服务
npm run serve

# 方式二：同时启动
npm run dev
```

### 访问地址
- 前端页面: http://localhost:8080
- 后端 API: http://localhost:3000

## 📝 路由说明

| 路径 | 功能 | 描述 |
|------|------|------|
| `/` | 首页 | 重定向到 MBTI 主页面 |
| `/mbti` | MBTI 主页面 | MBTI-WCPA 岗位匹配评估 |
| `/test` | MBTI 测试 | 16 型人格测试 |
| `/wcpa-test` | WCPA 测评 | 8维能力测评 |
| `/task-match` | 任务匹配 | 人员任务智能分配 |

## 🔌 API 接口

### MBTI 相关接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/mbti/types` | 获取所有 MBTI 类型 |
| POST | `/api/mbti/seed` | 初始化 MBTI 数据 |
| POST | `/api/mbti/match` | 人格匹配 |
| GET | `/api/mbti/records` | 获取测试记录 |
| POST | `/api/mbti/records` | 创建测试记录 |

### 能力测评接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/mbti/wcpa` | 获取 WCPA 测试题目 |
| POST | `/api/mbti/evaluate` | 能力评估匹配 |

### 任务匹配接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/mbti/tasks` | 获取任务列表 |
| POST | `/api/mbti/tasks` | 创建任务 |
| POST | `/api/mbti/task-match` | 任务人员匹配 |

## 📊 数据模型

### MBTI 人格类型
- **type**: 类型代码 (如 INTJ)
- **title**: 类型名称 (如 建筑师)
- **keywords**: 关键词
- **dimensions**: 四维维度值
- **strengths**: 优势
- **advice**: 发展建议
- **description**: 详细描述

### WCPA 能力维度
- **创新能力** (innovation)
- **逻辑思维** (logic)
- **沟通表达** (communication)
- **团队协作** (teamwork)
- **领导力** (leadership)
- **执行力** (execution)
- **学习能力** (learning)
- **抗压能力** (stressResistance)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！详见 [CONTRIBUTING](CONTRIBUTING.md)
