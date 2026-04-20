# Decisions Log · 2026-04-20

用户 2026-04-20 明确"依旧你看着来，按照我的开发原则走就好了，我只想看最终成品"，以下 9 项默认提案生效。

## A 板块
1. **积分数据源** → 用 `CreditClient.getUserCredit(userId).score`。UI 文案改为"信用 {score}"。Figma 的 "128 积分" 解读为静态设计稿，真实现按 credit 展示。
2. **头像上传规格** → ≤ 2 MB；MIME ∈ `image/jpeg` / `image/png` / `image/webp`；后端校验落在 `UsersController.uploadAvatar`。已写入 TEAM-CONTRACT §5.4。
3. **Refresh token 存储** → MVP 锁定 `localStorage`（key: `lin-shi.refresh`）；公网上线前升级为 httpOnly Cookie（留一个 TODO 注释在 auth service 出口处即可）。
4. **"家常菜" 等 Figma chip 文案** → 不扩展 `CuisineEnum`。前端维护 `CuisineLabel` 中文映射表在 `apps/web/src/lib/enum-labels.ts`。
5. **徽章 SVG 资源** → Figma 未提供，用 Lucide 图标 + 渐变背景占位：
   - `taste_master` → `lucide-react/Sparkles` + `gradient-invite`
   - `healthy_life` → `lucide-react/Leaf` + `linear-gradient(135deg, #A7F3D0, #34D399)`
   - `warm_host` → `lucide-react/Flame` + `gradient-cta`
   - `punctual_diner` → `lucide-react/Clock` + `linear-gradient(135deg, #DBEAFE, #3B82F6)`
   `u_badges.icon_url` seed 时置 `NULL`，前端按 code 渲染。
6. **邀请码分享** → MVP 只复制文本 `"用我的邀请码 LINSH-XXXX 加入邻食吧～"` 到剪贴板 + toast。公网域名定了再升级为带 URL 的 deep link。

## C 板块
7. **`ListActivitiesQuerySchema` 微调** → 已追加 `scope: 'mine'|'all'`（默认 `all`）、`minParticipants`、`maxParticipants`。已写入 TEAM-CONTRACT §6.3。
8. **`joinScope` 默认值** → 起锅表单初值 `ACQUAINTANCES_ONLY`（熟人扩展）。
9. **B 未就绪时起锅食材** → 允许用户手动输入食材名（`string[]`），创建活动时以 `manualIngredients` 字段传给后端；后端落地在 `a_activity_manual_ingredients` 表（text 字段）。B 接上后前端切换到冰箱 chip 多选，手动输入降级为 fallback。

### B 未就绪 fallback 的 schema 微调
```sql
CREATE TABLE a_activity_manual_ingredients (
  activity_id  UUID NOT NULL REFERENCES a_activities(id) ON DELETE CASCADE,
  name         VARCHAR(50) NOT NULL,
  added_by     UUID NOT NULL REFERENCES u_users(id),
  added_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (activity_id, name)
);
```
`CreateActivityRequestSchema` 追加：
```ts
ingredientIds: z.array(z.string().uuid()).max(20).default([]),
manualIngredients: z.array(z.string().min(1).max(50)).max(20).default([]),  // NEW
```

## 其余未明确决定但自主锁定
- **feed 入口位置** → 底栏"近期活动"tab 直接是 `/activities/feed`；`/activities`（我的锅列表）通过右上角的"我的锅"副 tab 或顶部切换进入。统一入口减少信息架构分叉。
- **WAITING 到期宽限** → 不加。到 startTime 直接 CANCELLED。
- **COMPLETED 在 feed 保留** → 7 天。
- **轮询策略** → React Query 10s + `document.visibilitychange` 离开页面暂停，回来立即 refetch。

## 上述改动汇总
- `TEAM-CONTRACT.md` §5.4（avatar 上传限制）
- `TEAM-CONTRACT.md` §6.3（ListActivitiesQuerySchema 扩展）
- `packages/contracts/src/activities/create-activity.ts`（`manualIngredients`）
- 新增 `a_activity_manual_ingredients` 表（C 板块迁移）
- `apps/web/src/lib/enum-labels.ts`（新建 CuisineLabel / DietaryLabel 映射）
