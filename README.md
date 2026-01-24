# Jack Wiki - 个人AI知识库

一个功能强大的个人AI知识库系统，集成多个AI模型（Gemini/Claude/ChatGPT），支持智能对话、AI角色扮演和知识管理。

## 技术栈

### 后端
- **运行时**: Bun 1.1+
- **框架**: Elysia (高性能Web框架)
- **API**: tRPC (端到端类型安全)
- **架构**: Clean Architecture
- **ORM**: Drizzle ORM
- **数据库**: PostgreSQL 15+ with pgvector
- **AI框架**: LangChain (混合模式)
- **缓存**: Upstash Redis
- **文件存储**: Cloudflare R2

### 前端
- **框架**: Next.js 15 (App Router)
- **UI库**: shadcn/ui + Tailwind CSS
- **API通信**: tRPC Client
- **状态管理**: Zustand

## 快速开始

> 💡 **推荐方式**：项目已配置一键启动脚本，可直接在根目录运行！

### 方式 1：一键启动（最简单）

```bash
# 首次使用（自动安装依赖、启动数据库、初始化数据）
./setup.sh

# 之后每次启动（同时启动前后端）
./dev.sh
```

### 方式 2：npm scripts

```bash
npm run setup    # 首次
npm run dev      # 启动
```

### 方式 3：Makefile

```bash
make setup       # 首次
make dev         # 启动
```

---

### 方式 4：手动启动

如果你想分步骤手动控制，可以按以下方式：

#### 前置要求

1. **安装Bun** (推荐，用于后端高性能运行):
```bash
curl -fsSL https://bun.sh/install | bash
```

如果没有Bun，也可以使用Node.js 20+和pnpm：
```bash
# 安装pnpm
npm install -g pnpm
```

2. **启动基础设施** (PostgreSQL + Redis):
```bash
docker-compose up -d
```

#### 后端开发

```bash
cd jack-wiki-backend

# 安装依赖
bun install  # 或 pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的API密钥

# 数据库初始化
bun run db:push
bun run db:seed

# 启动开发服务器
bun run dev  # 运行在 http://localhost:8000
```

#### 前端开发

```bash
cd jack-wiki-frontend

# 安装依赖
bun install  # 或 pnpm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
bun run dev  # 运行在 http://localhost:3000
```

## 项目结构

### 后端 (Clean Architecture)

```
jack-wiki-backend/
├── src/
│   ├── core/                   # 核心业务层
│   │   ├── entities/           # 业务实体
│   │   ├── repositories/       # 仓储接口
│   │   └── use-cases/          # 业务用例
│   ├── infrastructure/         # 基础设施层
│   │   ├── database/           # Drizzle ORM
│   │   ├── ai/                 # LangChain集成
│   │   └── repositories/       # 仓储实现
│   ├── presentation/           # 表现层
│   │   ├── trpc/               # tRPC路由
│   │   ├── websocket/          # WebSocket
│   │   └── middleware/         # 中间件
│   └── shared/                 # 共享代码
│       ├── types/              # 类型定义
│       ├── schemas/            # Zod验证
│       └── utils/              # 工具函数
└── docs/                       # 技术文档
```

### 前端

```
jack-wiki-frontend/
├── app/                        # Next.js App Router
│   ├── chat/                   # 聊天页面
│   ├── about/                  # 个人主页
│   └── resume/                 # 简历页面
├── components/                 # React组件
│   ├── chat/                   # 聊天相关组件
│   ├── ui/                     # shadcn/ui组件
│   └── layout/                 # 布局组件
└── lib/                        # 工具库
    ├── api.ts                  # tRPC客户端
    └── utils.ts                # 工具函数
```

## 核心功能

### MVP1 (当前版本)
- ✅ 多模型AI对话 (Gemini/Claude/ChatGPT)
- ✅ 12个AI角色扮演（哲学家、心理学家、投资家等）
- ✅ 流式响应
- ✅ 对话历史管理
- ✅ 现代化聊天界面

### MVP2 (规划中)
- 📄 文档上传和向量化
- 🔍 智能知识检索 (RAG)
- 📚 知识库管理

### MVP3 (规划中)
- 👤 个人展示页面
- 📝 简历集成
- 🤖 AI助手自我介绍

### MVP4 (规划中)
- 👥 多用户支持
- 🔐 认证系统
- ⚙️ 自定义配置

## AI角色列表

系统预配置了12个AI角色：

**哲学家**: 亚里士多德、尼采、康德、加缪  
**心理学家**: 弗洛伊德、阿德勒  
**思想家**: 毛泽东、鲁迅  
**投资家**: 巴菲特、芒格、段永平  
**特殊角色**: 周媛（X形身材梗）

## 技术文档

详细技术文档请查看：
- [架构设计文档](jack-wiki-backend/docs/ARCHITECTURE.md)
- [API接口文档](jack-wiki-backend/docs/API.md)
- [数据库设计](jack-wiki-backend/docs/DATABASE.md)
- [开发指南](jack-wiki-backend/docs/DEVELOPMENT.md)

## 性能特点

- **极致性能**: Bun + Elysia组合，性能远超Node.js + Express
- **类型安全**: 端到端TypeScript类型推导
- **Clean Architecture**: 高度解耦，易于测试和维护
- **流式响应**: 实时AI回复体验

## 环境变量

### 后端

```env
# 数据库
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jack_wiki"

# AI模型API密钥
GOOGLE_API_KEY="your_google_api_key"
ANTHROPIC_API_KEY="your_anthropic_api_key"
OPENAI_API_KEY="your_openai_api_key"

# 可选：Upstash Redis
UPSTASH_REDIS_REST_URL="your_upstash_url"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

### 前端

```env
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

## 部署

### Docker Compose
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Vercel (前端)
前端可直接部署到Vercel，后端部署到支持Bun的平台（Railway/Render等）。

## 开发命令

### 后端
```bash
bun run dev          # 开发服务器
bun run build        # 构建生产版本
bun run db:push      # 推送数据库schema
bun run db:seed      # 填充种子数据
bun run lint         # 代码检查
bun run format       # 代码格式化
bun test            # 运行测试
```

### 前端
```bash
bun run dev          # 开发服务器
bun run build        # 构建生产版本
bun run lint         # 代码检查
bun run format       # 代码格式化
```

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT

---

**Made with ❤️ by Jack**
