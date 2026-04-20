# CLAUDE.md — 邻食

你好，Claude Code 会话。读两份文件就够了：

1. **`TEAM-CONTRACT.md`** — 项目技术契约（技术栈、A+C 板块详细设计、B/D/E/F 集成契约、工作流、SOP）。为 CC 消费而写，密集技术细节。
2. **`docs/handoff-status.md`** — 会话级交接状态（进度、下一步动作）。

---

## 快速导航

| 你在找 | 去 |
|---|---|
| 技术栈版本 | TEAM-CONTRACT §1 |
| 目录布局 | TEAM-CONTRACT §2 |
| 5 条开发原则 / `.env` 规则 | TEAM-CONTRACT §3 |
| JWT / 错误响应 / 分页 / 事件总线基础设施 | TEAM-CONTRACT §4 |
| **A 板块设计**（用户/认证/偏好/邀请码/徽章） | TEAM-CONTRACT §5 |
| **C 板块设计**（活动锅 / 状态机 / 定时任务） | TEAM-CONTRACT §6 |
| 对 B/D/E/F 板块的接口契约（其他 CC 会话读这） | TEAM-CONTRACT §7 |
| Mock client 实现规范 | TEAM-CONTRACT §8 |
| 前端集成约定（api client、useMe、表单） | TEAM-CONTRACT §9 |
| Walking Skeleton 跑通定义 | TEAM-CONTRACT §10 |
| Skills + 手动 fallback | TEAM-CONTRACT §11 |
| MR checklist | TEAM-CONTRACT §12 |
| git 工作流 | TEAM-CONTRACT §13 |
| 当前进度 | TEAM-CONTRACT §14 + docs/handoff-status.md |
| Figma MCP 使用（仅 A+C 维护者） | docs/figma-integration.md |

---

## 硬规则摘录

- 禁止 `any` / `@ts-ignore`
- 所有 API key / URL / secret 走 `.env`，代码不得硬编码
- 不做向后兼容，破坏性更新即可
- 跨模块字段必须走 `packages/contracts` 的 zod schema
- 每次交付流程：worktree → 实现 → simplify → pjr → git-merge-to-develop → Playwright E2E（桌面 + 移动）
- 缺 skill 不要瞎猜，停下来告诉用户

---

## 你现在做的第一件事

按 `docs/handoff-status.md` 的"下一个 CC 会话要做的事"推进。大致：

1. `/mcp` 确认 `figma` / `playwright` connected
2. 读 TEAM-CONTRACT §5（A 板块详细设计）
3. 参照 TEAM-CONTRACT §5 起草 `docs/superpowers/specs/2026-04-20-module-a-user-auth-design.md`
4. 让用户验收 spec
5. 通过后：writing-plans → worktree → 实现 → simplify → pjr → merge → Playwright
6. A 完成后，对 C 重复（基于 TEAM-CONTRACT §6）

**别自行扩展功能；别改 TEAM-CONTRACT 里已定的设计（除非用户要求）；不确定就查 TEAM-CONTRACT 或问用户。**
