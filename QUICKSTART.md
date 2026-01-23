# Jack Wiki - Quick Start Guide

## 快速启动（3分钟上手）

### Step 1: 准备环境

确保已安装 Docker 和 Docker Compose。

### Step 2: 克隆并配置

```bash
cd /Users/jinzexu/workspace_codes/practise/jack-wiki

# 配置后端环境变量
cd jack-wiki-backend
cp .env.example .env

# 编辑 .env，至少配置一个 AI API Key:
# GOOGLE_API_KEY="your_gemini_key"
# 或 ANTHROPIC_API_KEY="your_claude_key"
# 或 OPENAI_API_KEY="your_openai_key"

# 配置前端环境变量
cd ../jack-wiki-frontend
cp .env.example .env
```

### Step 3: 启动服务

```bash
# 返回项目根目录
cd ..

# 启动 PostgreSQL 和 Redis
docker-compose up -d

# 等待数据库启动（约10秒）
sleep 10
```

### Step 4: 初始化数据库

```bash
cd jack-wiki-backend

# 如果有 Bun（推荐）:
bun install
bun run db:push
bun run db:seed

# 如果使用 Node.js + pnpm:
pnpm install
pnpm db:push
pnpm db:seed
```

### Step 5: 启动开发服务器

**终端 1 - 后端:**
```bash
cd jack-wiki-backend
bun run dev  # 或 pnpm dev
# 🚀 Backend running on http://localhost:8000
```

**终端 2 - 前端:**
```bash
cd jack-wiki-frontend
bun install  # 或 pnpm install
bun run dev  # 或 pnpm dev
# ▲ Next.js running on http://localhost:3000
```

### Step 6: 开始使用

打开浏览器访问: **http://localhost:3000**

1. 点击 "New Chat" 创建新对话
2. 选择 AI 模型（Gemini/Claude/GPT）
3. 选择 AI 角色（可选）
4. 开始聊天！

---

## 可用的 AI 角色

### 哲学家
- **亚里士多德** - 逻辑分析，实践智慧
- **尼采** - 批判传统，超人哲学
- **康德** - 理性批判，道德律令
- **加缪** - 荒诞哲学，反抗精神

### 心理学家
- **弗洛伊德** - 精神分析，潜意识
- **阿德勒** - 个体心理，自卑超越

### 思想家
- **毛泽东** - 实践论，矛盾分析
- **鲁迅** - 批判现实，犀利文风

### 投资家
- **巴菲特** - 价值投资，护城河
- **芒格** - 多元思维，心智模型
- **段永平** - 本分，平常心

### 特殊角色
- **周媛** - 幽默风趣（"X形身材"梗）

---

## 常见问题

### Q: 启动时报错 "Database connection failed"

A: 检查 Docker 容器是否正常运行:
```bash
docker-compose ps
```

如果 postgres 未运行，重启:
```bash
docker-compose restart postgres
```

### Q: AI 响应报错

A: 检查 API Key 是否正确配置在 `.env` 文件中，并且有足够的配额。

### Q: 前端无法连接后端

A: 
1. 确保后端已启动并运行在 8000 端口
2. 检查前端 `.env` 中的 `NEXT_PUBLIC_API_URL` 是否正确

### Q: 想使用 Bun 但没有安装

A: 安装 Bun（推荐）:
```bash
curl -fsSL https://bun.sh/install | bash
```

或者使用 Node.js + pnpm 也可以正常运行。

---

## 下一步

- 📖 阅读[架构文档](jack-wiki-backend/docs/ARCHITECTURE.md)了解系统设计
- 🔌 查看[API文档](jack-wiki-backend/docs/API.md)了解接口使用
- 💻 参考[开发指南](jack-wiki-backend/docs/DEVELOPMENT.md)开始开发
- 🚀 查看[README.md](README.md)了解完整功能

---

## 技术支持

遇到问题？
1. 查看 [DEVELOPMENT.md](jack-wiki-backend/docs/DEVELOPMENT.md) 中的 "Common Issues" 部分
2. 检查后端日志（终端输出）
3. 使用浏览器开发者工具查看前端错误

---

**Enjoy chatting with AI personas!** 🎉
