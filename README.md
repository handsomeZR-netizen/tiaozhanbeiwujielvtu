<div align="center">

# 🌏 无界旅图 | Boundless Lens

**AI 驱动的文化旅行平台**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5.2-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)

[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)](CONTRIBUTING.md)
[![Code Style](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge)](https://prettier.io/)

</div>

---

## 🚀 项目简介

**无界旅图（Boundless Lens）** 是一个融合前沿 AI 技术与深度文化洞察的智能旅行平台，致力于重新定义旅行探索体验。

### 核心功能

- 🗺️ **地图图鉴** - AI 驱动的城市探索与 POI 智能推荐
- 📸 **海报工作台** - AI 生成精美旅行海报，多风格定制
- 🎭 **文化识别** - 多模态 AI 识别文化艺术品，深度解读
- 🧭 **行程规划** - 智能生成个性化旅行计划
- 🌐 **社区广场** - 分享与发现旅行故事

---

## ✨ 特性矩阵

```mermaid
graph LR
    A[用户输入] --> B[AI 引擎]
    B --> C[地图图鉴]
    B --> D[海报生成]
    B --> E[行程规划]
    B --> F[文化识别]
    C --> G[沉浸式体验]
    D --> G
    E --> G
    F --> G
```

| 功能模块 | 描述 | 状态 |
|---------|------|------|
| 🗺️ **地图图鉴** | 交互式地图 + AI POI 发现 | ✅ 已上线 |
| 📸 **海报工作台** | AI 生成旅行海报，支持多种风格 | ✅ 已上线 |
| 🎭 **文化识别** | 多模态 AI 识别文化艺术品 | ✅ 已上线 |
| 🧭 **行程规划** | 智能旅行规划与推荐 | ✅ 已上线 |
| 🌐 **社区广场** | 旅行爱好者社交平台 | ✅ 已上线 |
| 🎬 **片场剧本** | 叙事驱动的地点故事生成 | 🚧 测试中 |

---

## 🛠️ 技术栈

### 前端技术
![React](https://img.shields.io/badge/-React_19-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/-Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Framer Motion](https://img.shields.io/badge/-Framer_Motion-0055FF?style=flat-square&logo=framer&logoColor=white)

### 后端技术
![Fastify](https://img.shields.io/badge/-Fastify-000000?style=flat-square&logo=fastify&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/-PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Node.js](https://img.shields.io/badge/-Node.js-339933?style=flat-square&logo=node.js&logoColor=white)

### AI 服务
![DeepSeek](https://img.shields.io/badge/-DeepSeek-FF6B6B?style=flat-square)
![Doubao](https://img.shields.io/badge/-豆包_AI-4A90E2?style=flat-square)
![Gemini](https://img.shields.io/badge/-Google_Gemini-4285F4?style=flat-square&logo=google&logoColor=white)

### 基础设施
![Railway](https://img.shields.io/badge/-Railway-0B0D0E?style=flat-square&logo=railway&logoColor=white)
![Vercel](https://img.shields.io/badge/-Vercel-000000?style=flat-square&logo=vercel&logoColor=white)
![AMap](https://img.shields.io/badge/-高德地图_API-00A870?style=flat-square)

---

## 📦 项目结构

```
boundless-lens/
├── 📱 src/                    # 前端源码
│   ├── app/                   # 应用容器与路由
│   ├── features/              # 功能模块
│   │   ├── atlas/            # 地图图鉴
│   │   ├── diary/            # 海报工作台
│   │   ├── itinerary/        # 行程规划器
│   │   ├── studio/           # 文化识别
│   │   ├── community/        # 社区广场
│   │   └── showcase/         # 产品展示页
│   └── shared/               # 共享模块
│       ├── components/       # 可复用组件
│       ├── lib/              # 核心库
│       └── types/            # TypeScript 类型
│
├── 🔧 server/                 # 后端 API
│   ├── src/
│   │   ├── routes/           # API 路由
│   │   ├── services/         # 业务逻辑
│   │   │   ├── amap.ts       # 地图服务
│   │   │   ├── deepseek.ts   # 文本 AI
│   │   │   ├── doubao.ts     # 图片/视频 AI
│   │   │   └── itineraryGenerator.ts
│   │   └── utils/            # 工具函数
│   └── scripts/              # 实用脚本
│
└── 🎨 public/                 # 静态资源
    ├── demo-images/          # 演示图库
    └── showcase/             # 展示页背景
```

---

## 🚀 快速开始

### 环境要求

![Node.js](https://img.shields.io/badge/Node.js-≥18.0-339933?style=flat-square&logo=node.js)
![npm](https://img.shields.io/badge/npm-≥9.0-CB3837?style=flat-square&logo=npm)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-≥14.0-4169E1?style=flat-square&logo=postgresql)

### 安装依赖

```bash
# 克隆仓库
git clone https://github.com/handsomeZR-netizen/tiaozhanbeiwujielvtu.git
cd tiaozhanbeiwujielvtu

# 安装前端依赖
npm install

# 安装后端依赖
cd server
npm install
```

### 配置环境变量

#### 前端 `.env.local`
```env
VITE_AMAP_KEY=你的高德地图key
VITE_AMAP_SECURITY_CODE=你的安全密钥
GEMINI_API_KEY=你的Gemini密钥
```

#### 后端 `server/.env`
```env
PORT=8787
HOST=localhost
DATABASE_URL=postgresql://user:password@localhost:5432/boundless_lens
ARK_API_KEY=你的豆包密钥
AMAP_WEB_SERVICE_KEY=你的高德地图密钥
DEEPSEEK_API_KEY=你的DeepSeek密钥
```

### 启动开发服务器

```bash
# 终端 1：启动前端开发服务器
npm run dev

# 终端 2：启动后端服务器
cd server
npm run dev
```

访问 `http://localhost:5173` 🎉

---

## 🧪 测试

```bash
# 前端测试
npm test                    # 运行所有测试
npm run test:watch         # 监听模式
npm run test:coverage      # 覆盖率报告

# 后端测试
cd server
npm test                   # 运行所有测试
npm run test:properties    # 基于属性的测试
npm run test:unit          # 单元测试
```

![Vitest](https://img.shields.io/badge/-Vitest-6E9F18?style=flat-square&logo=vitest&logoColor=white)
![Testing Library](https://img.shields.io/badge/-Testing_Library-E33332?style=flat-square&logo=testing-library&logoColor=white)

---

## 📚 API 文档

### 核心接口

| 接口路径 | 方法 | 描述 |
|---------|------|------|
| `/api/itineraries` | POST | 生成 AI 旅行行程 |
| `/api/posters` | POST | 创建 AI 海报 |
| `/api/culture/analyze` | POST | 识别文化艺术品 |
| `/api/story/generate` | POST | 生成地点故事剧本 |
| `/api/amap/search` | GET | 搜索 POI |

完整 API 文档：[`server/API.md`](server/API.md)

---

## 🚢 部署指南

### 前端部署（Vercel）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/handsomeZR-netizen/tiaozhanbeiwujielvtu)

```bash
npm run build
# 将 dist/ 目录部署到 Vercel
```

### 后端部署（Railway）

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

详细部署指南请参考：[`docs/DEPLOY_RAILWAY.md`](docs/DEPLOY_RAILWAY.md)

**关键配置：**
- Root Directory: `server`
- Build Command: `npm run build`
- Start Command: `npm run start`
- 环境变量：`PORT`, `HOST=0.0.0.0`, `DATABASE_URL` 等

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！请查看 [贡献指南](CONTRIBUTING.md)。

```bash
# Fork 本仓库
# 创建你的特性分支
git checkout -b feature/amazing-feature

# 提交你的更改
git commit -m 'feat: 添加某个很棒的功能'

# 推送到分支
git push origin feature/amazing-feature

# 提交 Pull Request
```

### 提交规范

我们遵循 [约定式提交](https://www.conventionalcommits.org/zh-hans/)：

- `feat:` 新功能
- `fix:` 修复 Bug
- `docs:` 文档更新
- `style:` 代码格式
- `refactor:` 代码重构
- `test:` 测试相关
- `chore:` 构建/工具链

---

## 📊 项目统计

![GitHub stars](https://img.shields.io/github/stars/handsomeZR-netizen/tiaozhanbeiwujielvtu?style=social)
![GitHub forks](https://img.shields.io/github/forks/handsomeZR-netizen/tiaozhanbeiwujielvtu?style=social)
![GitHub watchers](https://img.shields.io/github/watchers/handsomeZR-netizen/tiaozhanbeiwujielvtu?style=social)

![GitHub issues](https://img.shields.io/github/issues/handsomeZR-netizen/tiaozhanbeiwujielvtu?style=flat-square)
![GitHub pull requests](https://img.shields.io/github/issues-pr/handsomeZR-netizen/tiaozhanbeiwujielvtu?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/handsomeZR-netizen/tiaozhanbeiwujielvtu?style=flat-square)

---

## � 开源协议

本项目采用 MIT 协议 - 详见 [LICENSE](LICENSE) 文件

---

## 🙏 致谢

- [React](https://react.dev/) - UI 框架
- [Fastify](https://fastify.dev/) - 后端框架
- [高德地图](https://lbs.amap.com/) - 地图服务
- [DeepSeek](https://www.deepseek.com/) - AI 文本生成
- [豆包](https://www.volcengine.com/) - AI 图片/视频生成
- [Railway](https://railway.app/) - 后端托管
- [Vercel](https://vercel.com/) - 前端托管

---

## � 联系方式

- **作者**：HandsomeZR
- **邮箱**：1516924835@qq.com
- **GitHub**：[@handsomeZR-netizen](https://github.com/handsomeZR-netizen)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！**

用 ❤️ 打造 by 无界旅图团队

[⬆ 返回顶部](#-无界旅图--boundless-lens)

</div>
