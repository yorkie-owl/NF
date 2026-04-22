# 邻食 (Neighbor Food) V3-demo

邻食是一个社区化的食材共享与邻里互助平台。本项目采用 Monorepo 架构开发。

## 🏗️ 项目架构 & 模块说明

本项目主要分为以下核心模块：

### 1. [apps/web](./apps/web) - 前端门户
- **框架**: Next.js 15+
- **职责**: 用户交互界面、手机端适配、冰箱管理视觉落地（B 板块）。
- **主要技术**: React, Tailwind CSS, Framer Motion, TanStack Query.

### 2. [apps/api](./apps/api) - 后端服务
- **框架**: NestJS
- **职责**: 提供 RESTful API 接口、身份验证、数据库交互（PostgreSQL）、定时任务。
- **主要技术**: TypeORM, Passport, Zod (nestjs-zod).

### 3. [packages/contracts](./packages/contracts) - 共享契约
- **职责**: 定义前后端共用的 Zod Schema、类型定义 (Types) 和业务契约。
- **作用**: 确保前后端数据格式强一致性，减少字段命名冲突。

---

## 🛠️ 本地开发指南

1. **环境准备**:
   - 确保安装了 Node.js (>=22.0.0) 和 pnpm (>=9.0.0)。
2. **安装依赖**:
   ```bash
   pnpm install
   ```
3. **配置文件**:
   - 复制 `.env.example` 到 `apps/api/.env`
   - 复制 `apps/web/.env.example` 到 `apps/web/.env.local`
4. **启动开发服务**:
   - 前端: `pnpm dev:web` (默认端口 3000)
   - 后端: `pnpm dev:api` (默认端口 3001)
5. **数据库**:
   - 可运行 `pnpm db:up` 启动 Docker 版 PostgreSQL。

---

## 📅 分工说明

- **当前工作区焦点**: **B 板块** — 冰箱主视觉、内页视觉（如：拍照识图、食材管理）。
- **协作规范**: 所有接口定义必须基于 `packages/contracts` 中的 Schema。

详细文档请参考 [TEAM-CONTRACT.md](./TEAM-CONTRACT.md) 和 [docs/teammate-handoff.md](./docs/teammate-handoff.md)。