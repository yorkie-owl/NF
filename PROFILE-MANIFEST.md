# Profile Integration Manifest

本目录按 `DATA-FLOW.md` 和 `TEAM-CONTRACT.md` 的规范整理，用于将 Profile/A 板块合并回完整项目。

## 命名规则

- 保留 Next.js App Router 必需文件名：`page.tsx`、`layout.tsx`。
- 通过完整目录路径区分页面，不把 `page.tsx` 改成自定义文件名。
- hooks 使用 `use-<domain>.ts` 命名。
- shared UI 放在 `apps/web/src/components/common/`。
- contracts 放在 `packages/contracts/src/<domain>/`。
- API 模块放在 `apps/api/src/<domain>/`。

## 页面路由映射

| 规范路由 | 文件路径 | DATA-FLOW/API |
|---|---|---|
| `/profile` | `apps/web/src/app/(protected)/profile/page.tsx` | `GET /me` |
| `/profile/edit` | `apps/web/src/app/(protected)/profile/edit/page.tsx` | `PATCH /me`, `POST /me/avatar` |
| `/preferences/friend` | `apps/web/src/app/(protected)/preferences/friend/page.tsx` | `GET/PUT /me/preferences/friend` |
| `/preferences/food` | `apps/web/src/app/(protected)/preferences/food/page.tsx` | `GET/PUT /me/preferences/food` |
| `/invite` | `apps/web/src/app/(protected)/invite/page.tsx` | `GET /me/invite-code` |

## 前端文件

### Routes

- `apps/web/src/app/(protected)/layout.tsx`
- `apps/web/src/app/(protected)/profile/page.tsx`
- `apps/web/src/app/(protected)/profile/edit/page.tsx`
- `apps/web/src/app/(protected)/preferences/friend/page.tsx`
- `apps/web/src/app/(protected)/preferences/food/page.tsx`
- `apps/web/src/app/(protected)/invite/page.tsx`
- `apps/web/src/app/globals.css`

### Hooks

- `apps/web/src/hooks/use-me.ts`
- `apps/web/src/hooks/use-update-profile.ts`
- `apps/web/src/hooks/use-friend-preferences.ts`
- `apps/web/src/hooks/use-food-preferences.ts`
- `apps/web/src/hooks/use-invite-code.ts`
- `apps/web/src/hooks/use-my-badges.ts`

### Common Components

- `apps/web/src/components/common/ProfileSection.tsx`
- `apps/web/src/components/common/InviteCodeCard.tsx`
- `apps/web/src/components/common/FridgeStickerBadge.tsx`
- `apps/web/src/components/common/EnumChipMultiSelect.tsx`
- `apps/web/src/components/common/TimeSlotPicker.tsx`
- `apps/web/src/components/common/SaveBar.tsx`
- `apps/web/src/components/common/UnsavedChangesDialog.tsx`

### UI/Nav Dependencies

- `apps/web/src/components/ui/button.tsx`
- `apps/web/src/components/ui/chip.tsx`
- `apps/web/src/components/ui/field.tsx`
- `apps/web/src/components/ui/input.tsx`
- `apps/web/src/components/ui/label.tsx`
- `apps/web/src/components/ui/slider.tsx`
- `apps/web/src/components/ui/switch.tsx`
- `apps/web/src/components/nav/BottomNav.tsx`
- `apps/web/src/components/nav/PotButton.tsx`
- `apps/web/src/components/nav/bottom-nav-bg.svg`

### Shared Lib

- `apps/web/src/lib/api.ts`
- `apps/web/src/lib/auth.ts`
- `apps/web/src/lib/env.ts`
- `apps/web/src/lib/cn.ts`
- `apps/web/src/lib/copy.ts`
- `apps/web/src/lib/toast.ts`
- `apps/web/src/lib/enum-labels.ts`
- `apps/web/src/lib/time-slot-presets.ts`
- `apps/web/src/lib/relative-time.ts`

## Contracts

- `packages/contracts/src/auth/current-user.ts`
- `packages/contracts/src/auth/jwt-payload.ts`
- `packages/contracts/src/auth/login.ts`
- `packages/contracts/src/auth/refresh.ts`
- `packages/contracts/src/auth/register.ts`
- `packages/contracts/src/users/user.ts`
- `packages/contracts/src/users/update-profile.ts`
- `packages/contracts/src/preferences/friend-preferences.ts`
- `packages/contracts/src/preferences/food-preferences.ts`
- `packages/contracts/src/invite-codes/invite-code.ts`
- `packages/contracts/src/badges/badge-definition.ts`
- `packages/contracts/src/badges/user-badge.ts`

## API Modules

- `apps/api/src/users/`
- `apps/api/src/preferences/`
- `apps/api/src/invite-codes/`
- `apps/api/src/badges/`

## 集成说明

- 本整合包已移除预览阶段的 demo session 逻辑，`use-me.ts` 和 `use-invite-code.ts` 均按真实 API 调用。
- `/profile`、`/preferences/friend`、`/preferences/food` 使用 `DATA-FLOW.md` 中的 A 板块路由。
- 邀请码 schema 按 `TEAM-CONTRACT.md` 的 8 位邀请码约束整理。
- 若目标项目已有同名 common 组件或 hooks，合并时以本 manifest 的路由/API 映射为准，逐项对照迁移。
