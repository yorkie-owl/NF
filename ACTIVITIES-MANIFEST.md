# Activities Integration Manifest

本目录按 `DATA-FLOW.md` 和 `TEAM-CONTRACT.md` 的规范整理，用于将 Activities/C 板块合并回完整项目。

> 最后更新：2026-04-22

---

## 命名规则

- 保留 Next.js App Router 必需文件名：`page.tsx`、`layout.tsx`。
- 通过完整目录路径区分页面，不把 `page.tsx` 改成自定义文件名。
- hooks 使用 `use-<domain>.ts` 命名。
- activity 专属组件放在 `apps/web/src/components/activities/`。
- shared UI 放在 `apps/web/src/components/common/`（本包不包含，参考 profile 包）。
- contracts 放在 `packages/contracts/src/<domain>/`。

---

## 页面路由映射

| 规范路由 | 文件路径 | DATA-FLOW §2 对应 | API |
|---|---|---|---|
| `/activities` | `apps/web/src/app/(protected)/activities/page.tsx` | §2.2 列表入口 | `GET /activities?scope=mine` |
| `/activities/discover` | `apps/web/src/app/(protected)/activities/discover/page.tsx` | §2.2 全部活动 | `GET /activities?scope=all` |
| `/activities/new` | `apps/web/src/app/(protected)/activities/new/page.tsx` | §2.1 起锅创建 | `POST /activities` |
| `/activities/[id]` | `apps/web/src/app/(protected)/activities/[id]/page.tsx` | §2.2 活动详情 | `GET /activities/:id` |
| `/activities/feed` | `apps/web/src/app/(protected)/activities/feed/page.tsx` | §2.6 消息中心 | `GET /activity-feeds` |

---

## 前端文件

### Routes

- `apps/web/src/app/(protected)/layout.tsx` ← **已更新**：底部 pb 从 `pb-28` 改为 `pb-[176px]`，修复 dome 遮挡
- `apps/web/src/app/(protected)/activities/page.tsx` ← **已更新**：返回按钮 + 独立滚动区域，防止卡片与导航栏重叠
- `apps/web/src/app/(protected)/activities/discover/page.tsx`
- `apps/web/src/app/(protected)/activities/new/page.tsx`
- `apps/web/src/app/(protected)/activities/[id]/page.tsx`
- `apps/web/src/app/(protected)/activities/feed/page.tsx`
- `apps/web/src/app/globals.css`

### Hooks

- `apps/web/src/hooks/use-activities.ts` ← **已更新**：内含 demo mock 数据（`DEMO_ACCESS_TOKEN` 时返回本地假数据）
- `apps/web/src/hooks/use-activity.ts`
- `apps/web/src/hooks/use-activity-events.ts`
- `apps/web/src/hooks/use-activity-feeds.ts`
- `apps/web/src/hooks/use-cancel-activity.ts`
- `apps/web/src/hooks/use-create-activity.ts`
- `apps/web/src/hooks/use-join-activity.ts`
- `apps/web/src/hooks/use-leave-activity.ts`
- `apps/web/src/hooks/use-mark-feed-read.ts`

### Activity Components

- `apps/web/src/components/activities/ActivityCard.tsx`
- `apps/web/src/components/activities/ActivityEventItem.tsx`
- `apps/web/src/components/activities/ActivityStatusBanner.tsx`
- `apps/web/src/components/activities/ActivityStatusChip.tsx`
- `apps/web/src/components/activities/CreateActivityForm.tsx`
- `apps/web/src/components/activities/FeedItem.tsx`
- `apps/web/src/components/activities/IngredientBadge.tsx`
- `apps/web/src/components/activities/JoinScopeSelector.tsx`
- `apps/web/src/components/activities/ParticipantRow.tsx`
- `apps/web/src/components/activities/TimeQuickPicker.tsx`

### Motion / Nav / UI Dependencies

- `apps/web/src/components/motion/presets.ts`
- `apps/web/src/components/nav/BottomNav.tsx` ← **已更新**：`bottom: -10px` 圆弧下沉
- `apps/web/src/components/nav/PotButton.tsx`
- `apps/web/src/components/nav/bottom-nav-bg.svg`
- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/chip.tsx`
- `apps/web/src/components/ui/sheet.tsx`

### Shared Lib

- `apps/web/src/lib/activity-status-label.ts`
- `apps/web/src/lib/api.ts`
- `apps/web/src/lib/auth.ts`
- `apps/web/src/lib/cn.ts`
- `apps/web/src/lib/relative-time.ts`
- `apps/web/src/lib/time-quick-picker.ts`
- `apps/web/src/lib/visibility-pause.ts`
- `apps/web/src/lib/toast.ts`
- `apps/web/src/lib/env.ts`

---

## Contracts

- `packages/contracts/src/activities/activity.ts`
- `packages/contracts/src/activities/create-activity.ts`
- `packages/contracts/src/activities/list-activities.ts`
- `packages/contracts/src/activity-events/activity-event.ts`
- `packages/contracts/src/activity-feeds/activity-feed.ts`
- `packages/contracts/src/common/error.ts`
- `packages/contracts/src/common/pagination.ts`
- `packages/contracts/src/enums.ts`

---

## 集成说明

### ⚠️ 合并注意项

| 文件 | 合并策略 |
|---|---|
| `layout.tsx` | 本版将 `pb-28` → `pb-[176px]`，若目标项目已有此文件，需手动合并 padding 改动 |
| `use-activities.ts` | 内含 demo mock 数据块（`DEMO_ACCESS_TOKEN` 判断），**正式上线前需移除** |
| `lib/auth.ts` | 与 profile 包相同，以最新版本覆盖即可 |
| `BottomNav.tsx` | 本版 `bottom: -10px`，若 profile 包版本不同，以本版为准 |
| `globals.css` | 合并时逐条对比颜色 token，不可整文件覆盖 |

### ✅ 与 DATA-FLOW.md 对齐确认

| DATA-FLOW 条目 | 状态 |
|---|---|
| `GET /activities` 列表（§2.2） | ✅ `use-activities.ts` 已实现 |
| `POST /activities` 创建（§2.1） | ✅ `use-create-activity.ts` + `CreateActivityForm.tsx` |
| `GET /activities/:id` 详情（§2.2） | ✅ `use-activity.ts` |
| `POST /activities/:id/join`（§2.2） | ✅ `use-join-activity.ts` |
| 加入后 `chatRoomId !== null` → 「去聊这锅」（§2.2） | ✅ `[id]/page.tsx` 读 `activity.chatRoomId` 切换按钮 |
| 活动消息中心 `GET /activity-feeds`（§2.6） | ✅ `use-activity-feeds.ts` |
| `/activities/discover`（全部活动）路由 | ✅ 已实现 |
| 底部导航 `NAV_ROUTES` 包含两个 tab 页 | ✅ `/activities` 和 `/activities/discover` |

### ⚠️ 待联调项（与 DATA-FLOW.md 问题对齐）

- **问题2**：`[id]/page.tsx` 的「去聊这锅」需联调 C 板块真实 API 替换 mock `chatRoomId`
- **问题3**：`chatRoomId` 目前为 UUID，待 E 板块 `POST /chat/rooms` 上线后验证
- **demo mock**：`use-activities.ts` 中的 `MOCK_ACTIVITIES` 在对接真实 API 后需删除
