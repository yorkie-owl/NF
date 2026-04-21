# 与队友（A+C）联调清单

heckson 仓库当前实现 **B 板块**（`GET /ingredients` 等 §7.1 形状 + 冰箱 UI）。**A（认证）与 C（活动）由其他主线实现**。

## 队友 A 需要提供

- 可用的 **`Authorization: Bearer <accessToken>`** 校验；B 生产路径应关闭 `INGREDIENTS_DEV_BYPASS_AUTH` 并在 `GET /ingredients` 上要求 JWT，从 token 解析 `userId`（与契约 §7.1 一致）。
- **`GET /me`** 等 Walking Skeleton 端点，供前端全局鉴权（本仓库若只做冰箱可先不接登录页）。

## 环境变量

| 位置 | 变量 | 说明 |
|------|------|------|
| 前端 | `NEXT_PUBLIC_API_URL` | 指向队友部署的 API 或本地 `:3000` |
| API | `CORS_ORIGIN` | 必须包含前端源，例如 `http://localhost:3001` |
| API | `INGREDIENTS_DEV_BYPASS_AUTH` | 本地 `true` 可无 JWT 用 `userId` query；联调生产改为 `false` |

## B 后端后续

- 将 `i_ingredients` 表与 TypeORM migration 接入，替换 `IngredientsService` 内 mock。
- `POST /ingredients/recognize` 接真实识图服务。

## 契约

仍以根目录 [TEAM-CONTRACT.md](../TEAM-CONTRACT.md) 为准；冲突时先对齐契约再改代码。
