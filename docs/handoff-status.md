# Handoff Status（会话交接状态）

## 时间与进度

- **今天**：2026-04-20
- **Deadline**：约 3 天（2026-04-23 前后，黑客松闭幕）
- **GitHub 仓库**：后天（2026-04-22）由用户建好，在此之前本地开发（`E:\Agent program\邻食\`）
- **Demo 形式**：**需要公网可访问**（用户有自有服务器，部署环节会上线 demo）

## 团队上下文

- 4 人全栈团队
- 本仓库所有者负责 **A（用户/认证）+ C（活动锅）**，前端 + 后端 + 联调都自己搞
- 另外 3 人分工**未告知本仓库**，按"队友未交付"处理：B/D/E/F 全部 mock

## 用户明确过的"开发原则/工作流"

全部在 `TEAM-CONTRACT.md` §3 和 §11-§13，不要跳过它们去做任何实质开发。要点回顾：

- 5 条硬规则：单一职责 / 最简代码（不做向后兼容）/ 类型严格（no any）/ KISS / 文档置信度
- 所有 API 配置走 `.env`
- 所有实质开发**在 Worktree 里执行**
- 完成流程：代码 → `simplify` → `project-review:pjr`（lint + build + 逻辑）→ `git-merge-to-develop`（到 dev 分支）→ Playwright E2E（桌面 + 移动，逐按钮点通）
- 涉及前端时，加载 `ui-ux-pro-max:ui-ux-pro-max` 和 `frontend-logic-design:frontend-logic-design` 辅助
- Skills 找不到**必须停下来报错**，不许自作主张跳过

## 当前状态（Milestone 视图）

| 阶段 | 状态 |
|---|---|
| 读 PRD + 理解项目 | ✅ 完成，见 `TEAM-CONTRACT.md` §1 |
| 确定板块 A+C 归属 + 完整范围 | ✅ 完成，见 `TEAM-CONTRACT.md` §5/§6 |
| 确定技术栈 + Monorepo 结构 + 代码规范 + 工作流 SOP | ✅ 完成，见 `TEAM-CONTRACT.md` §1-§4, §11-§13 |
| A+C 详细设计（表结构/API/状态机/事件） | ✅ 完成，见 `TEAM-CONTRACT.md` §5/§6 |
| 对 B/D/E/F 接口契约 | ✅ 完成，见 `TEAM-CONTRACT.md` §7 |
| Figma MCP 配置 | ✅ 完成（Framelink `figma-developer-mcp` + Personal Access Token） |
| **Figma 文件连通验证** | ⏳ 新会话里调 `/mcp` 确认 connected |
| A 模块 design doc (spec) | ❌ 待写（基于 TEAM-CONTRACT §5 + Figma 稿） |
| A 模块 implementation plan | ❌ 待写 |
| A 模块 Worktree + 实现 | ❌ 待做 |
| A 模块 simplify + pjr + merge + Playwright | ❌ 待做 |
| C 模块 spec + plan + 实现 + 验收 | ❌ 待做 |

## 下一个 Claude Code 会话（新窗口）要做的事

**按顺序：**

1. **读 `CLAUDE.md`**（会自动加载）+ **`TEAM-CONTRACT.md`**（真相源）
2. **跑 `/mcp`** 确认 `figma` / `playwright` 状态为 `connected`
   - 如果没连上 → 查 `docs/figma-integration.md` 故障排查章节
3. **使用 `ToolSearch` 查 `mcp__figma__*`** 以加载 Figma MCP 工具的 schema
4. **调 `get_figma_data(file_key="sVwVM1yIkQApx7J1STcbyh", depth=2)`** 列出所有 Page/Frame
5. **识别 A 和 C 对应的 frame**，填回 `docs/figma-integration.md` 的对照表
6. **为 A 模块写 spec**：`docs/superpowers/specs/2026-04-20-module-a-user-auth-design.md`
   - 技术栈细节 **全部已在 TEAM-CONTRACT §5 锁定**，spec 只需补：
     - Figma 稿对应的前端组件拆解 + 路由
     - 页面内交互状态（加载/空态/错误态 文案）
     - 验收 checklist（Playwright 会走的步骤）
     - 实现顺序建议（先 contracts → entities → service → controller → 前端）
7. **写完 spec 让用户验收**
8. **用户批准后**：writing-plans → using-git-worktrees → 实现 → simplify → pjr → git-merge-to-develop → Playwright E2E
9. **A 完成验收**后对 C 重复（基于 TEAM-CONTRACT §6）

## 遗留问题

- 队友具体分工不明：按 mock 策略推进，B/D/E/F 的真接口接入时机看队友节奏
- Figma 稿张数未数：重连 MCP 后确认
- 用户自有服务器的部署规格（OS/Node 版本/反代）未告知：需要用户在部署前补信息

## 敏感信息位置（不要 commit）

- Figma Personal Access Token：`C:\Users\Jayden park\.claude.json` 的 `mcpServers.figma.args[2]`
- 后端 `.env`（JWT secret、DB password 等）：`apps/api/.env`
- 前端 `.env.local`：`apps/web/.env.local`
