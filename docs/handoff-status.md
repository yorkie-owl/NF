# Handoff Status · 交接状态

## 时间线
- **启动**：2026-04-20
- **Deadline**：2026-04-23（~剩 2 天，用于 demo 打磨 + 部署）
- **GitHub 建仓计划**：2026-04-22（用户负责）
- **Demo 形式**：公网可访问（用户自有服务器）

## 团队
- 4 人全栈团队
- 本仓库所有者负责 **A（用户/认证）+ C（活动锅）**，前后端都完成
- B/D/E/F 由 3 位队友另做；本仓库用 mock client 对接

## 里程碑

| 阶段 | 状态 | 证据 |
|---|---|---|
| PRD + spec + plan | ✅ | `docs/superpowers/specs/` 3 份 + `plans/` 1 份 |
| 技术栈决策 | ✅ | `TEAM-CONTRACT.md` |
| Figma MCP + 16 frames 导出 | ✅ | `figma_exports/` + `docs/figma-integration.md` 对照表 |
| Walking Skeleton | ✅ | commit `4a97325`, `/health` 200 |
| **A 板块后端**（auth / users / preferences / invite-codes / badges） | ✅ | commit `80c3162`, 全端点 curl 通过 |
| **A 板块前端**（6 页 + 共享 UI） | ✅ | commit `f26d020`, 浏览器可点通 |
| **C 板块后端**（activities / events / status / feeds + cron + 状态机） | ✅ | commit `2b44c60`, 14 个 transition 单测 + curl 验证 |
| **C 板块前端**（5 页 + 底栏 + 动画） | ✅ | commit `3b9f293`, 11 路由 HTTP 200 |
| **Simplify 审查**（3 agents + 12 条修复） | ✅ | commit `9ed1dab`, 净减 64 行 |
| **PJR** | ✅ | api + web lint/typecheck/build 全绿；工作区干净 |
| git-merge-to-develop | ⏳ dev 已是目标分支，需 ffwd main（由用户/部署时决定） |
| Playwright E2E（桌面 + 移动） | ⏳ 下一步 |
| 公网部署 | ⏳ 由用户负责 |

## 当前运行状态
- `lin-shi-postgres`（Docker）healthy
- api `http://localhost:3000/health` → 200
- web `http://localhost:3001/*` 11 路由 200

## 种子数据
- `LINSH-TEST` 邀请码，max_uses=999，永远可用
- 测试账号 `frank@example.com / Password123`
- 多个其他 e2e 账号（alice/dave/eve/charlie/harry/ivy/grace）

## git 历史（9 commits on dev）
```
9ed1dab refactor(simplify): apply review findings
3b9f293 feat(web/module-c): implement 5 C pages + bottom nav + animations
2b44c60 feat(module-c): complete activities/events/status/feeds backend
f26d020 feat(web/module-a): implement 6 A-module pages + shared UI kit
80c3162 feat(module-a): complete user/auth/preferences/invite/badges backend
4a97325 feat(skeleton): pnpm monorepo + NestJS api /health + contracts CJS build + docker postgres
39bc81b feat(web): Next.js 15 skeleton with health page
87eabf3 chore: initial docs and specs
```

## 关键决策回顾（见 `docs/superpowers/specs/DECISIONS-2026-04-20.md`）
1. 积分 → credit.score（文案"信用 N"）
2. 头像 ≤ 2 MB，JPEG/PNG/WebP
3. Refresh token localStorage（MVP 锁定）
4. 徽章 Lucide 占位
5. 邀请码分享仅复制文本
6. joinScope 默认 ACQUAINTANCES_ONLY
7. 食材手动输入 fallback（B 未就绪）
8. feed 入口统一从 `/activities` 顶右铃铛跳 `/activities/feed`
9. WAITING 过 startTime 直接 CANCELLED，无宽限

## 风险 & 未尽事项
- **Refresh token 自动轮换**未实装（手动重登；见 simplify 报告次生发现）
- **Chat 真接入**前，`/activities/[id]` 的"去聊这锅"/`feed` 的聊天 preview 走 mock/空态
- **Avatar 存储**用本地 `apps/api/uploads/`，demo 上线前改走对象存储需改 UPLOADS_PUBLIC_URL
- **ActivityFeeds 分页性能**：当前加载全量再分页，真 chat 上线后需要改为 SQL 下推 + 批量 RPC（见 efficiency 报告）

## 下一步
1. Playwright E2E 桌面 + 移动双视口（Phase 7）
2. 交付报告（Phase 8）
3. 用户部署到自有服务器
