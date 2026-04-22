# 邻食 · Technical Contract for Claude Code

> 本文件为 Claude Code 消费而写，非人类文档。假设读者是另一个 CC 会话，正在接手 B/D/E/F 中一个板块，需要与 A+C（由**队友**实现的认证与活动锅）无缝集成。**heckson 工作区当前由负责人做 B：冰箱主视觉与内视觉**；A+C 的代码不在本仓库主线。
>
> 格式约定：**具体到可直接落码**——zod schema、TypeORM 实体字段、API path、错误码、事件名称、文件路径、import 语句都以字面量给出。

---

## §0 元数据

- **Project root**: `E:\Agent program\邻食\`
- **Current date**: 2026-04-20
- **Deadline**: 2026-04-23（黑客松闭幕前）
- **GitHub init**: 2026-04-22（后天，本地到远端切换日）
- **Demo**: 公网可访问，用户自有服务器
- **heckson 负责人板块**: B（冰箱主视觉、内视觉 — 食材/拍照识图相关 UI；契约 §7.1）
- **队友负责**（其他仓库或分支）: A（用户/认证）+ C（活动锅）全栈；以及 D（匹配）/ E（聊天）/ F（信用）等各自认领

---

## §1 技术栈（全部锁死，接手 CC 不要改动）

### 运行时与包管理
```
Node.js            22.x LTS         必选；用户本机 22.19.0
pnpm               9.x              通过 corepack enable 启用
pnpm workspaces    原生             不用 Turborepo
```

### 后端（apps/api）
```
NestJS             ^10.4.0
TypeScript         ^5.5.0           strict + noImplicitAny + noUncheckedIndexedAccess + exactOptionalPropertyTypes
TypeORM            ^0.3.20          synchronize: false 强制，全走 migration
PostgreSQL         17               通过 docker-compose 本地起
reflect-metadata   ^0.2.2
class-transformer  ^0.5.1           仅序列化辅助
zod                ^3.23.0          所有 DTO 真相源
nestjs-zod         ^3.0.0           createZodDto / ZodValidationPipe
@nestjs/jwt        ^10.2.0
@nestjs/passport   ^10.0.3
passport           ^0.7.0
passport-jwt       ^4.0.1
argon2             ^0.40.0          密码哈希
pino               ^9.0.0
nestjs-pino        ^4.1.0
@nestjs/swagger    ^7.4.0
@nestjs/schedule   ^4.1.0
@nestjs/event-emitter  ^2.1.1
@nestjs/config     ^3.2.0
```

### 前端（apps/web）
```
Next.js            ^15.0.0          App Router only
React              ^19.0.0
TypeScript         ^5.5.0           同上 strict
TailwindCSS        ^4.0.0
shadcn/ui          最新 registry
Framer Motion      ^11.5.0
@tanstack/react-query  ^5.56.0
react-hook-form    ^7.53.0
@hookform/resolvers ^3.9.0
zod                ^3.23.0          共用 packages/contracts
lucide-react       最新
ky                 ^1.7.0           fetch 轻量 wrapper
```

### 契约（packages/contracts）
```
zod                ^3.23.0
typescript         ^5.5.0
```
纯 TS 包，只 export 类型和 zod schema，无运行时依赖。

### 测试与质量
```
ESLint             ^9.0.0 (flat config)
Prettier           ^3.3.0
Playwright         ^1.48.0           E2E，桌面 + 移动
Husky + lint-staged 可选             commit 前自动 lint
```

### 明确不用
- ❌ Turborepo、Nx（编排）
- ❌ Redis（session / cache）
- ❌ MinIO / S3（文件存储；本地 uploads/ 即可）
- ❌ Prisma
- ❌ Jest / Vitest（不写单元测试，靠 E2E + TS + lint）
- ❌ GraphQL / tRPC
- ❌ Socket.IO（**只有 E 板块需要**，其他板块不能引入依赖）

---

## §2 Monorepo 布局

```
邻食/
├── TEAM-CONTRACT.md                   # ← 本文件
├── CLAUDE.md                           # Claude Code 会话入口
├── 邻食V2.pdf / 邻食V2_utf8.txt         # PRD
├── .env.example                        # docker-compose 环境
├── docker-compose.yml                  # 仅 postgres-17
├── pnpm-workspace.yaml
├── package.json                        # workspace root
├── tsconfig.base.json                  # 共享 tsconfig
├── .gitignore
│
├── apps/
│   ├── api/                            # @lin-shi/api · NestJS
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── config/
│   │   │   │   ├── env.schema.ts       # zod 校验 process.env，启动即 parse
│   │   │   │   ├── config.module.ts
│   │   │   │   └── typeorm.config.ts   # DataSourceOptions
│   │   │   ├── common/
│   │   │   │   ├── filters/
│   │   │   │   │   └── all-exceptions.filter.ts
│   │   │   │   ├── interceptors/
│   │   │   │   │   └── logging.interceptor.ts
│   │   │   │   └── pipes/
│   │   │   │       └── zod-validation.pipe.ts
│   │   │   ├── auth/                   # A
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── guards/
│   │   │   │   │   └── jwt-auth.guard.ts
│   │   │   │   ├── decorators/
│   │   │   │   │   └── current-user.decorator.ts
│   │   │   │   ├── strategies/
│   │   │   │   │   └── jwt.strategy.ts
│   │   │   │   └── entities/
│   │   │   │       └── refresh-token.entity.ts
│   │   │   ├── users/                  # A
│   │   │   │   ├── users.module.ts
│   │   │   │   ├── users.controller.ts
│   │   │   │   ├── users.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── user.entity.ts
│   │   │   ├── preferences/            # A
│   │   │   │   ├── preferences.module.ts
│   │   │   │   ├── preferences.controller.ts
│   │   │   │   ├── preferences.service.ts
│   │   │   │   └── entities/
│   │   │   │       ├── friend-preferences.entity.ts
│   │   │   │       └── food-preferences.entity.ts
│   │   │   ├── invite-codes/           # A
│   │   │   │   ├── invite-codes.module.ts
│   │   │   │   ├── invite-codes.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── invite-code.entity.ts
│   │   │   ├── badges/                 # A
│   │   │   │   ├── badges.module.ts
│   │   │   │   ├── badges.controller.ts
│   │   │   │   ├── badges.service.ts
│   │   │   │   └── entities/
│   │   │   │       ├── badge.entity.ts
│   │   │   │       └── user-badge.entity.ts
│   │   │   ├── activities/             # C
│   │   │   │   ├── activities.module.ts
│   │   │   │   ├── activities.controller.ts
│   │   │   │   ├── activities.service.ts
│   │   │   │   ├── activities.events.ts  # emit 函数集中
│   │   │   │   └── entities/
│   │   │   │       ├── activity.entity.ts
│   │   │   │       ├── activity-participant.entity.ts
│   │   │   │       └── activity-ingredient.entity.ts
│   │   │   ├── activity-events/        # C
│   │   │   │   ├── activity-events.module.ts
│   │   │   │   ├── activity-events.service.ts
│   │   │   │   └── entities/
│   │   │   │       └── activity-event.entity.ts
│   │   │   ├── activity-status/        # C · 状态机 + 定时任务
│   │   │   │   ├── activity-status.module.ts
│   │   │   │   ├── activity-status.service.ts   # transition 函数
│   │   │   │   └── activity-status.scheduler.ts # @Cron 任务
│   │   │   ├── external/               # 对 B/D/E/F 的 client 接口 + mock
│   │   │   │   ├── external.module.ts
│   │   │   │   ├── ingredients.client.ts      # interface + MockImpl
│   │   │   │   ├── matching.client.ts
│   │   │   │   ├── chat.client.ts
│   │   │   │   └── credit.client.ts
│   │   │   ├── ingredients/            # B（队友写；A+C 不碰）
│   │   │   ├── recognition/            # B
│   │   │   ├── matching/               # D
│   │   │   ├── chat/                   # E
│   │   │   └── credit/                 # F
│   │   ├── uploads/                    # gitignored，静态托管 via ServeStaticModule
│   │   ├── migrations/                 # TypeORM migration 文件
│   │   ├── test/
│   │   ├── .env.example
│   │   ├── nest-cli.json
│   │   ├── tsconfig.json               # 继承 tsconfig.base.json
│   │   └── package.json
│   └── web/                            # @lin-shi/web · Next.js
│       ├── src/
│       │   ├── app/
│       │   │   ├── layout.tsx
│       │   │   ├── page.tsx            # 首页（冰箱主视觉，C 的入口）
│       │   │   ├── (auth)/
│       │   │   │   ├── login/page.tsx
│       │   │   │   └── register/page.tsx
│       │   │   └── (protected)/
│       │   │       ├── layout.tsx      # 鉴权守卫 + 顶栏
│       │   │       ├── profile/
│       │   │       │   ├── page.tsx    # 查看
│       │   │       │   └── edit/page.tsx
│       │   │       ├── preferences/
│       │   │       │   ├── friend/page.tsx
│       │   │       │   └── food/page.tsx
│       │   │       ├── invite/page.tsx
│       │   │       ├── fridge/         # B 的页面
│       │   │       ├── activities/     # C
│       │   │       │   ├── page.tsx    # 列表
│       │   │       │   ├── new/page.tsx # 起锅
│       │   │       │   └── [id]/page.tsx # 我的锅
│       │   │       ├── matches/        # D
│       │   │       └── chat/           # E
│       │   ├── components/
│       │   │   ├── ui/                 # shadcn/ui
│       │   │   ├── motion/             # Framer Motion 包装
│       │   │   ├── common/
│       │   │   └── [module-specific]/
│       │   ├── lib/
│       │   │   ├── api.ts              # ky wrapper + token 注入
│       │   │   ├── env.ts              # zod 校验 process.env
│       │   │   └── auth.ts             # JWT 存取
│       │   ├── hooks/
│       │   │   └── use-me.ts           # React Query 的 current user hook
│       │   └── providers/
│       │       └── query-provider.tsx
│       ├── public/
│       ├── next.config.ts
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       └── .env.example
│
├── packages/
│   ├── contracts/                      # @lin-shi/contracts
│   │   ├── src/
│   │   │   ├── index.ts                # re-export 全部
│   │   │   ├── common/
│   │   │   │   ├── error.ts            # ApiError schema
│   │   │   │   ├── pagination.ts       # PaginatedResponseSchema
│   │   │   │   └── id.ts               # UuidSchema helper
│   │   │   ├── enums.ts
│   │   │   ├── auth/
│   │   │   │   ├── jwt-payload.ts
│   │   │   │   ├── register.ts
│   │   │   │   ├── login.ts
│   │   │   │   └── tokens.ts
│   │   │   ├── users/
│   │   │   │   ├── user.ts             # UserPublicSchema, UserPrivateSchema
│   │   │   │   └── update-profile.ts
│   │   │   ├── preferences/
│   │   │   │   ├── friend-preferences.ts
│   │   │   │   └── food-preferences.ts
│   │   │   ├── invite-codes/
│   │   │   │   └── invite-code.ts
│   │   │   ├── badges/
│   │   │   │   ├── badge-definition.ts
│   │   │   │   └── user-badge.ts
│   │   │   ├── activities/
│   │   │   │   ├── activity.ts         # ActivitySchema + ActivityDetailSchema
│   │   │   │   ├── create-activity.ts
│   │   │   │   ├── list-activities.ts  # query schema
│   │   │   │   └── activity-participant.ts
│   │   │   ├── activity-events/
│   │   │   │   └── activity-event.ts
│   │   │   ├── ingredients/            # C mock B 用
│   │   │   │   └── ingredient.ts
│   │   │   ├── chat/                   # C 触发 E 用
│   │   │   │   └── create-room.ts
│   │   │   ├── credit/
│   │   │   │   └── credit.ts
│   │   │   └── events/
│   │   │       ├── activity.events.ts  # activity.* 事件 payload
│   │   │       └── user.events.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── config/                         # @lin-shi/config
│       ├── eslint/
│       │   └── base.mjs
│       ├── tsconfig/
│       │   ├── base.json
│       │   └── nestjs.json
│       └── package.json
│
└── docs/
    ├── figma-integration.md            # A+C 维护者用（Figma MCP 配置）
    └── handoff-status.md               # 会话级交接状态
```

### 包名
- `@lin-shi/api`
- `@lin-shi/web`
- `@lin-shi/contracts`
- `@lin-shi/config`

### pnpm-workspace.yaml
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 根 package.json 脚本
```json
{
  "scripts": {
    "dev:api": "pnpm --filter @lin-shi/api dev",
    "dev:web": "pnpm --filter @lin-shi/web dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint",
    "db:up": "docker compose up -d postgres",
    "db:down": "docker compose down",
    "db:migrate": "pnpm --filter @lin-shi/api migration:run"
  }
}
```

---

## §3 开发原则（5 条硬标准，违反必退回）

1. **单一职责** · 每个 Service/方法一件事；`AuthService` 不查业务数据，`UsersService` 不做密码比对。
2. **最简代码** · 不做向后兼容；不留 legacy 别名、迁移兼容分支、`// removed` 尸体注释。
3. **类型严格** · 禁 `any` / `@ts-ignore`；strict flags 全开；DTO 从 zod 推导不手写 interface。
4. **KISS** · 没用到的抽象不写；三行重复可先放着，第四处才抽；命名直接表达 what-it-does。
5. **文档置信度** · 不确定的 API/DB/JWT 行为 → 查官方 docs，不凭训练记忆下笔。

### `.env` 强制规则
所有 API key / URL / secret 走 `.env`，代码禁硬编码。env 启动期 zod parse，缺项即 exit。不允许 `process.env.XXX ?? 'default'` 式 fallback。

---

## §4 共享基础设施（A+C 实现，其他板块消费）

### §4.1 env schema（后端）

```ts
// apps/api/src/config/env.schema.ts
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().int().positive().default(3000),

  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive(),
  DB_USER: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  DB_NAME: z.string().min(1),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_ACCESS_TTL: z.string().default('15m'),     // jsonwebtoken 格式
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_TTL: z.string().default('7d'),

  UPLOADS_DIR: z.string().default('./uploads'),
  UPLOADS_PUBLIC_URL: z.string().url(),

  // 各板块追加自己的 key 时续在下面，并同步 .env.example
  AI_VISION_API_KEY: z.string().optional(),       // B
  AI_VISION_ENDPOINT: z.string().url().optional(),// B
  RECIPE_API_KEY: z.string().optional(),          // B
  MATCH_LLM_API_KEY: z.string().optional(),       // D
  SOCKET_CORS_ORIGIN: z.string().optional(),      // E

  CORS_ORIGIN: z.string().url(),
});

export type Env = z.infer<typeof envSchema>;
```

### §4.2 env schema（前端）
```ts
// apps/web/src/lib/env.ts
import { z } from 'zod';

const rawEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_UPLOADS_URL: process.env.NEXT_PUBLIC_UPLOADS_URL,
};

export const env = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_UPLOADS_URL: z.string().url(),
}).parse(rawEnv);
```

### §4.3 统一错误响应

```ts
// packages/contracts/src/common/error.ts
import { z } from 'zod';

export const ApiErrorSchema = z.object({
  statusCode: z.number().int(),
  code: z.string(),           // UPPER_SNAKE_CASE
  message: z.string(),
  details: z.record(z.unknown()).optional(),
  requestId: z.string().optional(),
  timestamp: z.string().datetime(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

// 约定错误码空间（避免板块间重名）：
// AUTH_*       A（鉴权）
// USER_*       A（用户）
// PREF_*       A（偏好）
// INVITE_*     A（邀请码）
// BADGE_*      A（徽章）
// ACTIVITY_*   C（活动）
// INGREDIENT_* B
// MATCH_*      D
// CHAT_*       E
// CREDIT_*     F
// COMMON_*     共享
```

后端 `AllExceptionsFilter` 统一转换成这个 shape。禁止裸 throw Error——必须用 `HttpException` 子类或自定义业务异常。

### §4.4 分页响应
```ts
// packages/contracts/src/common/pagination.ts
import { z } from 'zod';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
  sort: z.string().optional(),  // 形如 "-createdAt,name"，- 表示降序
});
export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(item: T) =>
  z.object({
    items: z.array(item),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    pageSize: z.number().int().positive(),
  });
```

### §4.5 JWT Auth Guard（A 提供，其他板块 import）

```ts
// apps/api/src/auth/guards/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

```ts
// apps/api/src/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser as CurrentUserType } from '@lin-shi/contracts';

export const CurrentUser = createParamDecorator(
  (_, ctx: ExecutionContext): CurrentUserType =>
    ctx.switchToHttp().getRequest().user,
);
```

```ts
// packages/contracts/src/auth/current-user.ts
export const CurrentUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
});
export type CurrentUser = z.infer<typeof CurrentUserSchema>;
```

**用法（所有保护端点必须这样写）：**
```ts
@UseGuards(JwtAuthGuard)
@Get('activities')
async list(@CurrentUser() me: CurrentUserType) { ... }
```

### §4.6 事件总线
**选型**：`@nestjs/event-emitter` 2.x（EventEmitter2）。**禁止**引入 Kafka / Redis pubsub / BullMQ。

**事件 key 命名**：`<domain>.<verb-past>`，例 `activity.formed`、`user.registered`。

**payload schema 位置**：`packages/contracts/src/events/<domain>.events.ts`。

**生产示例**：
```ts
import { ACTIVITY_EVENTS, type ActivityFormedEvent } from '@lin-shi/contracts';

this.eventEmitter.emit(ACTIVITY_EVENTS.FORMED, {
  activityId, participantIds, formedAt: new Date().toISOString(),
} satisfies ActivityFormedEvent);
```

**消费示例**：
```ts
import { OnEvent } from '@nestjs/event-emitter';
import { ACTIVITY_EVENTS, type ActivityFormedEvent } from '@lin-shi/contracts';

@OnEvent(ACTIVITY_EVENTS.FORMED)
async handle(payload: ActivityFormedEvent) { ... }
```

---

## §5 A 板块详细设计（队友实现 · heckson 仅消费契约）

### §5.1 数据模型

```sql
-- 所有 A 板块表前缀 u_

CREATE TABLE u_users (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          VARCHAR(255) UNIQUE NOT NULL,
  password_hash  VARCHAR(255) NOT NULL,              -- argon2
  nickname       VARCHAR(20)  NOT NULL,
  avatar_url     VARCHAR(500),
  school         VARCHAR(100),
  city           VARCHAR(50),
  bio            VARCHAR(140),
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  last_login_at  TIMESTAMPTZ
);

CREATE TABLE u_refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES u_users(id) ON DELETE CASCADE,
  token_hash  VARCHAR(255) NOT NULL,                 -- argon2 of refresh token
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON u_refresh_tokens (user_id, revoked_at);

CREATE TABLE u_invite_codes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id      UUID NOT NULL REFERENCES u_users(id) ON DELETE CASCADE,
  code          VARCHAR(12) UNIQUE NOT NULL,         -- crockford base32, 8 位
  consumed_by   UUID REFERENCES u_users(id),
  consumed_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- 每用户拥有且仅拥有 1 张 code（注册时发），用完等于已被他人消费
CREATE UNIQUE INDEX ON u_invite_codes (owner_id);

CREATE TABLE u_friend_preferences (
  user_id          UUID PRIMARY KEY REFERENCES u_users(id) ON DELETE CASCADE,
  accept_strangers BOOLEAN NOT NULL DEFAULT false,
  distance_km      INTEGER NOT NULL DEFAULT 5,       -- 1..50
  time_slots       JSONB   NOT NULL DEFAULT '[]'::JSONB,
                    -- [{ dayOfWeek: 1-7, startHour: 0-23, endHour: 0-23 }]
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE u_food_preferences (
  user_id               UUID PRIMARY KEY REFERENCES u_users(id) ON DELETE CASCADE,
  cuisines              TEXT[]  NOT NULL DEFAULT '{}',   -- 枚举 值见 CuisineEnum
  dietary_restrictions  TEXT[]  NOT NULL DEFAULT '{}',   -- 见 DietaryRestrictionEnum
  cooking_skill         VARCHAR(20) NOT NULL DEFAULT 'BEGINNER',  -- CookingSkillEnum
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE u_badges (
  code         VARCHAR(32) PRIMARY KEY,  -- 'foodie_explorer', 'quick_chef' ...
  name         VARCHAR(50) NOT NULL,
  description  VARCHAR(200),
  icon_url     VARCHAR(500)
);

CREATE TABLE u_user_badges (
  user_id     UUID NOT NULL REFERENCES u_users(id) ON DELETE CASCADE,
  badge_code  VARCHAR(32) NOT NULL REFERENCES u_badges(code),
  earned_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_code)
);
CREATE INDEX ON u_user_badges (user_id);
```

### §5.2 枚举集中（packages/contracts/src/enums.ts）

```ts
export const CuisineEnum = z.enum([
  'SICHUAN', 'CANTONESE', 'JIANGSU', 'ZHEJIANG', 'SHANDONG',
  'FUJIAN', 'HUNAN', 'ANHUI', 'NORTHEASTERN', 'XINJIANG',
  'JAPANESE', 'KOREAN', 'THAI', 'VIETNAMESE',
  'ITALIAN', 'FRENCH', 'AMERICAN', 'MEXICAN', 'INDIAN', 'MIDDLE_EASTERN',
]);
export type Cuisine = z.infer<typeof CuisineEnum>;

export const DietaryRestrictionEnum = z.enum([
  'VEGETARIAN', 'VEGAN', 'HALAL', 'KOSHER',
  'GLUTEN_FREE', 'LACTOSE_FREE', 'NUT_FREE', 'SEAFOOD_FREE',
  'LOW_SPICE', 'LOW_SODIUM',
]);
export type DietaryRestriction = z.infer<typeof DietaryRestrictionEnum>;

export const CookingSkillEnum = z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']);
export type CookingSkill = z.infer<typeof CookingSkillEnum>;

export const ActivityStatusEnum = z.enum([
  'WAITING_FOR_MEMBERS',
  'FORMED',
  'STARTING_SOON',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);
export type ActivityStatus = z.infer<typeof ActivityStatusEnum>;

export const ActivityJoinScopeEnum = z.enum([
  'ACQUAINTANCES_ONLY',   // 熟人扩展
  'STRANGERS_OK',         // 接受陌生人
  'HIGH_TRUST_ONLY',      // 私人住宅场景，仅高信用
]);

export const ActivityEventTypeEnum = z.enum([
  'CREATED', 'JOINED', 'LEFT',
  'FORMED', 'STATUS_CHANGED',
  'INGREDIENT_ADDED', 'INGREDIENT_REMOVED',
  'CANCELLED', 'COMPLETED',
]);
```

### §5.3 zod schema 骨架（auth / users / preferences / invite-codes / badges）

```ts
// packages/contracts/src/auth/register.ts
export const RegisterRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(64),
  nickname: z.string().min(1).max(20),
  inviteCode: z.string().length(8),   // 邀请码
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  accessExpiresAt: z.string().datetime(),
  refreshExpiresAt: z.string().datetime(),
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
```

```ts
// packages/contracts/src/auth/login.ts
export const LoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});
```

```ts
// packages/contracts/src/auth/jwt-payload.ts
export const JwtPayloadSchema = z.object({
  sub: z.string().uuid(),         // userId
  email: z.string().email(),
  iat: z.number(),
  exp: z.number(),
});
```

```ts
// packages/contracts/src/users/user.ts
export const UserPublicSchema = z.object({
  id: z.string().uuid(),
  nickname: z.string(),
  avatarUrl: z.string().url().nullable(),
  school: z.string().nullable(),
  city: z.string().nullable(),
  bio: z.string().nullable(),
  badges: z.array(z.string()),           // badge code 数组
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

export const UserPrivateSchema = UserPublicSchema.extend({
  email: z.string().email(),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
});
export type UserPrivate = z.infer<typeof UserPrivateSchema>;

export const UpdateProfileRequestSchema = z.object({
  nickname: z.string().min(1).max(20).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  school: z.string().max(100).nullable().optional(),
  city: z.string().max(50).nullable().optional(),
  bio: z.string().max(140).nullable().optional(),
});
```

```ts
// packages/contracts/src/preferences/friend-preferences.ts
export const TimeSlotSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),  // 1 = Mon
  startHour: z.number().int().min(0).max(23),
  endHour:   z.number().int().min(0).max(24), // 24 表示跨日结束
});

export const FriendPreferencesSchema = z.object({
  acceptStrangers: z.boolean(),
  distanceKm: z.number().int().min(1).max(50),
  timeSlots: z.array(TimeSlotSchema).max(20),
});
export type FriendPreferences = z.infer<typeof FriendPreferencesSchema>;
```

```ts
// packages/contracts/src/preferences/food-preferences.ts
import { CuisineEnum, DietaryRestrictionEnum, CookingSkillEnum } from '../enums';

export const FoodPreferencesSchema = z.object({
  cuisines: z.array(CuisineEnum).max(10),
  dietaryRestrictions: z.array(DietaryRestrictionEnum).max(10),
  cookingSkill: CookingSkillEnum,
});
export type FoodPreferences = z.infer<typeof FoodPreferencesSchema>;
```

```ts
// packages/contracts/src/invite-codes/invite-code.ts
export const InviteCodeSchema = z.object({
  code: z.string().length(8),
  isConsumed: z.boolean(),
  consumedAt: z.string().datetime().nullable(),
});
```

```ts
// packages/contracts/src/badges/badge-definition.ts
export const BadgeDefinitionSchema = z.object({
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  iconUrl: z.string().url().nullable(),
});

export const UserBadgeSchema = z.object({
  code: z.string(),
  earnedAt: z.string().datetime(),
});
```

### §5.4 API 端点（A 板块完整列表）

| Method | Path | Auth | Request | Response | 错误码 |
|---|---|---|---|---|---|
| POST | `/auth/register` | ✗ | `RegisterRequestSchema` | `AuthTokensSchema + UserPrivateSchema` | `AUTH_EMAIL_TAKEN`, `INVITE_INVALID`, `INVITE_CONSUMED` |
| POST | `/auth/login` | ✗ | `LoginRequestSchema` | `AuthTokensSchema + UserPrivateSchema` | `AUTH_INVALID_CREDENTIALS` |
| POST | `/auth/refresh` | ✗ | `RefreshRequestSchema` | `AuthTokensSchema` | `AUTH_REFRESH_INVALID`, `AUTH_REFRESH_REVOKED` |
| POST | `/auth/logout` | ✓ | `{}` | `{}` | — |
| GET | `/me` | ✓ | — | `UserPrivateSchema` | — |
| PATCH | `/me` | ✓ | `UpdateProfileRequestSchema` | `UserPrivateSchema` | `USER_NICKNAME_INVALID` |
| POST | `/me/avatar` | ✓ | `multipart/form-data` (field: `file`) | `{ avatarUrl: string }` | `USER_AVATAR_TOO_LARGE`, `USER_AVATAR_BAD_FORMAT` |
| GET | `/me/preferences/friend` | ✓ | — | `FriendPreferencesSchema` | — |
| PUT | `/me/preferences/friend` | ✓ | `FriendPreferencesSchema` | `FriendPreferencesSchema` | `PREF_DISTANCE_OUT_OF_RANGE` |
| GET | `/me/preferences/food` | ✓ | — | `FoodPreferencesSchema` | — |
| PUT | `/me/preferences/food` | ✓ | `FoodPreferencesSchema` | `FoodPreferencesSchema` | — |
| GET | `/me/invite-code` | ✓ | — | `InviteCodeSchema` | — |
| GET | `/badges` | ✓ | — | `BadgeDefinitionSchema[]` | — |
| GET | `/me/badges` | ✓ | — | `UserBadgeSchema[]` | — |
| GET | `/users/:id/public` | ✓ | — | `UserPublicSchema` | `USER_NOT_FOUND` |

**Swagger 自动生成**：`@nestjs/swagger` + `@anatine/zod-nestjs`（或 `nestjs-zod` 内置的 `patchNestJsSwagger()`）挂载到 `/api/docs`。

### §5.5 鉴权流程（序列）

**注册**：
```
Client → POST /auth/register { email, password, nickname, inviteCode }
  │
  ├─ zod 校验
  ├─ 查 u_invite_codes WHERE code = inviteCode AND consumed_by IS NULL
  │    否则 throw InviteInvalid / InviteConsumed
  ├─ 查 u_users WHERE email = email，存在则 throw AuthEmailTaken
  ├─ argon2.hash(password) → passwordHash
  ├─ INSERT u_users (..., password_hash)
  ├─ UPDATE u_invite_codes SET consumed_by = :newUserId, consumed_at = NOW() WHERE code = :inviteCode
  ├─ INSERT u_invite_codes (owner_id = newUserId, code = newCrockford32(8))
  ├─ 生成 JWT access + refresh（refresh 的 hash 存 u_refresh_tokens）
  ├─ emit 'user.registered' { userId, registeredAt }
  └─ 返回 { tokens, user }
```

**登录**：
```
Client → POST /auth/login { email, password }
  │
  ├─ 查 u_users WHERE email = email
  ├─ argon2.verify(passwordHash, password)；失败 throw AuthInvalidCredentials
  ├─ UPDATE u_users SET last_login_at = NOW()
  ├─ 生成 tokens，存 refresh hash
  └─ 返回 { tokens, user }
```

**Access token 校验**：由 `JwtStrategy` 完成，校验后把 `{ id, email }` 挂 `req.user`。

**Refresh**：
```
Client → POST /auth/refresh { refreshToken }
  │
  ├─ jwt.verify(refreshToken, JWT_REFRESH_SECRET)
  ├─ 查 u_refresh_tokens WHERE user_id = payload.sub AND token_hash = argon2.hash(refreshToken) AND revoked_at IS NULL
  │    否则 throw AuthRefreshInvalid / AuthRefreshRevoked
  ├─ UPDATE u_refresh_tokens SET revoked_at = NOW() WHERE id = :oldId  -- rotate
  ├─ 生成新 access + refresh 对
  └─ 返回 { tokens }
```

### §5.6 邀请码算法

- 8 字符 Crockford Base32（`0123456789ABCDEFGHJKMNPQRSTVWXYZ`，去掉易混字符 I/L/O/U）
- 冲突时重试（UNIQUE 约束 + INSERT ... ON CONFLICT DO NOTHING + 重试 5 次）
- 每用户恰好 1 张 code，注册成功即发，只能被别人消费 1 次
- 用完后"我的邀请码"接口返回 `{ code, isConsumed: true }`——前端展示"你的码已被 @xxx 使用"

### §5.7 徽章预置数据
`apps/api/migrations/<timestamp>-seed-badges.ts`：
```ts
INSERT INTO u_badges (code, name, description) VALUES
  ('foodie_explorer',  '美食探索者', '完成 5 次不同菜系共餐'),
  ('quick_chef',       '快手达人',   '30 分钟内完成一道菜'),
  ('noodle_master',    '面食专家',   '制作 3 种以上面食'),
  ('community_star',   '社区达人',   '发起 10 场活动');
```
MVP 阶段徽章颁发由 F（信用）或后续统计任务触发；A 只提供查询接口。

---

## §6 C 板块详细设计（队友实现 · heckson 仅消费契约）

### §6.1 数据模型

```sql
CREATE TABLE a_activities (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title              VARCHAR(80)  NOT NULL,
  description        VARCHAR(500),
  start_time         TIMESTAMPTZ NOT NULL,
  location           VARCHAR(200) NOT NULL,   -- 区域描述，不强制详细地址
  max_participants   INTEGER     NOT NULL CHECK (max_participants BETWEEN 2 AND 10),
  join_scope         VARCHAR(30) NOT NULL,    -- ActivityJoinScopeEnum
  status             VARCHAR(30) NOT NULL DEFAULT 'WAITING_FOR_MEMBERS',
  created_by         UUID NOT NULL REFERENCES u_users(id),
  chat_room_id       UUID,                     -- E 回填
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at       TIMESTAMPTZ,
  completed_at       TIMESTAMPTZ
);
CREATE INDEX ON a_activities (status, start_time);
CREATE INDEX ON a_activities (created_by);

CREATE TABLE a_activity_participants (
  activity_id   UUID NOT NULL REFERENCES a_activities(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES u_users(id),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at       TIMESTAMPTZ,
  PRIMARY KEY (activity_id, user_id)
);
CREATE INDEX ON a_activity_participants (user_id);

CREATE TABLE a_activity_ingredients (
  activity_id    UUID NOT NULL REFERENCES a_activities(id) ON DELETE CASCADE,
  ingredient_id  UUID NOT NULL,                -- B 板块的 ingredient 主键；不建 FK
  added_by       UUID NOT NULL REFERENCES u_users(id),
  added_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (activity_id, ingredient_id)
);

CREATE TABLE a_activity_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id   UUID NOT NULL REFERENCES a_activities(id) ON DELETE CASCADE,
  type          VARCHAR(30) NOT NULL,         -- ActivityEventTypeEnum
  actor_id      UUID REFERENCES u_users(id),
  payload       JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX ON a_activity_events (activity_id, created_at DESC);
```

### §6.2 状态机（正式定义）

**States**: `WAITING_FOR_MEMBERS` → `FORMED` → `STARTING_SOON` → `IN_PROGRESS` → `COMPLETED`。
任何非 COMPLETED 状态可被创建者手动 → `CANCELLED`。

**Transitions**（事件驱动）：

| From | Event | Guard | To | Emit event |
|---|---|---|---|---|
| WAITING_FOR_MEMBERS | JOIN | participants.count + 1 == maxParticipants | FORMED | `activity.formed`, `activity.joined` |
| WAITING_FOR_MEMBERS | JOIN | participants.count + 1 < maxParticipants | (stay) | `activity.joined` |
| WAITING_FOR_MEMBERS | CRON_TICK | NOW > startTime | CANCELLED | `activity.cancelled` (reason: `EXPIRED`) |
| FORMED | CRON_TICK | NOW >= startTime - 1h | STARTING_SOON | `activity.status_changed` |
| STARTING_SOON | CRON_TICK | NOW >= startTime | IN_PROGRESS | `activity.status_changed` |
| IN_PROGRESS | CRON_TICK | NOW >= startTime + 4h | COMPLETED | `activity.ended`, `activity.status_changed` |
| FORMED | LEAVE | — | WAITING_FOR_MEMBERS | `activity.left`, `activity.status_changed` |
| Any (non-COMPLETED) | CANCEL_BY_CREATOR | actor == createdBy | CANCELLED | `activity.cancelled` |

**实现**：`ActivityStatusService.transition(activityId, event, context)`。内部判状态 + guard，持久化 + emit。禁止在 service 外直接改 `status` 列。

### §6.3 zod schemas

```ts
// packages/contracts/src/activities/activity.ts
import { ActivityStatusEnum, ActivityJoinScopeEnum } from '../enums';

export const ActivityParticipantSchema = z.object({
  userId: z.string().uuid(),
  joinedAt: z.string().datetime(),
  leftAt: z.string().datetime().nullable(),
});

export const ActivityIngredientSchema = z.object({
  ingredientId: z.string().uuid(),
  addedBy: z.string().uuid(),
  addedAt: z.string().datetime(),
});

export const ActivitySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(80),
  description: z.string().max(500).nullable(),
  startTime: z.string().datetime(),
  location: z.string().min(1).max(200),
  maxParticipants: z.number().int().min(2).max(10),
  joinScope: ActivityJoinScopeEnum,
  status: ActivityStatusEnum,
  createdBy: z.string().uuid(),
  chatRoomId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  participantCount: z.number().int().nonnegative(),
});
export type Activity = z.infer<typeof ActivitySchema>;

export const ActivityDetailSchema = ActivitySchema.extend({
  participants: z.array(ActivityParticipantSchema),
  ingredients: z.array(ActivityIngredientSchema),
});
```

```ts
// packages/contracts/src/activities/create-activity.ts
export const CreateActivityRequestSchema = z.object({
  title: z.string().min(1).max(80),
  description: z.string().max(500).nullable().optional(),
  startTime: z.string().datetime(),        // 必须未来时间；服务端再校验
  location: z.string().min(1).max(200),
  maxParticipants: z.number().int().min(2).max(10),
  joinScope: ActivityJoinScopeEnum,
  ingredientIds: z.array(z.string().uuid()).max(20).default([]),
});
```

```ts
// packages/contracts/src/activities/list-activities.ts
import { PaginationQuerySchema } from '../common/pagination';
import { ActivityStatusEnum, ActivityJoinScopeEnum } from '../enums';

export const ListActivitiesQuerySchema = PaginationQuerySchema.extend({
  status: z.union([ActivityStatusEnum, z.array(ActivityStatusEnum)]).optional(),
  joinScope: ActivityJoinScopeEnum.optional(),
  createdBy: z.string().uuid().optional(),
  joinedBy: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
```

### §6.4 API 端点（C 板块完整列表）

| Method | Path | Auth | Request | Response | 错误码 |
|---|---|---|---|---|---|
| POST | `/activities` | ✓ | `CreateActivityRequestSchema` | `ActivityDetailSchema` | `ACTIVITY_START_IN_PAST`, `ACTIVITY_INGREDIENT_NOT_FOUND` |
| GET | `/activities` | ✓ | `ListActivitiesQuerySchema` | `PaginatedResponseSchema<ActivitySchema>` | — |
| GET | `/activities/:id` | ✓ | — | `ActivityDetailSchema` | `ACTIVITY_NOT_FOUND` |
| POST | `/activities/:id/join` | ✓ | `{}` | `ActivityDetailSchema` | `ACTIVITY_FULL`, `ACTIVITY_ALREADY_JOINED`, `ACTIVITY_NOT_JOINABLE`, `ACTIVITY_SCOPE_FORBIDS`, `ACTIVITY_NOT_FOUND` |
| POST | `/activities/:id/leave` | ✓ | `{}` | `ActivityDetailSchema` | `ACTIVITY_NOT_JOINED`, `ACTIVITY_NOT_LEAVABLE` |
| DELETE | `/activities/:id` | ✓ | — | `{}` | `ACTIVITY_NOT_FOUND`, `ACTIVITY_NOT_CREATOR`, `ACTIVITY_NOT_CANCELLABLE` |
| GET | `/activities/:id/events` | ✓ | `PaginationQuerySchema` | `PaginatedResponseSchema<ActivityEventSchema>` | — |

**加入规则**（落库在 `ActivitiesService.join`）：
1. 活动 `status == WAITING_FOR_MEMBERS`（否则 `ACTIVITY_NOT_JOINABLE`）
2. 当前参与人数 < maxParticipants（否则 `ACTIVITY_FULL`）
3. 用户未已经加入（否则 `ACTIVITY_ALREADY_JOINED`）
4. 若 `joinScope == HIGH_TRUST_ONLY`，校验用户 credit（调 `CreditClient.getUserCredit` 比较阈值 70；未就绪时 mock 返回 100 通过）
5. INSERT `a_activity_participants`
6. 调用 `ActivityStatusService.transition(id, 'JOIN', { userId })`，若触发 `FORMED`：
   - `ChatClient.createRoom(activityId, participantIds)` → 得 roomId → UPDATE `chat_room_id`
   - emit `activity.formed`
7. emit `activity.joined` 无论是否 FORMED

### §6.5 定时任务（apps/api/src/activity-status/activity-status.scheduler.ts）

```ts
@Cron('*/5 * * * *')  // 每 5 分钟
async promoteToStartingSoon() { ... }   // FORMED → STARTING_SOON

@Cron('* * * * *')    // 每 1 分钟
async startInProgress() { ... }         // STARTING_SOON → IN_PROGRESS

@Cron('*/10 * * * *') // 每 10 分钟
async completeActivities() { ... }      // IN_PROGRESS → COMPLETED

@Cron('0 * * * *')    // 每小时
async expireWaitingActivities() { ... } // WAITING_FOR_MEMBERS 过 startTime → CANCELLED
```
每个 tick 走 `transition()` 而不是直接 UPDATE，保证事件正确 emit。

### §6.6 事件 payload（packages/contracts/src/events/activity.events.ts）

```ts
export const ACTIVITY_EVENTS = {
  CREATED:   'activity.created',
  JOINED:    'activity.joined',
  LEFT:      'activity.left',
  FORMED:    'activity.formed',
  CANCELLED: 'activity.cancelled',
  ENDED:     'activity.ended',
  STATUS_CHANGED: 'activity.status_changed',
} as const;

export const ActivityCreatedEventSchema = z.object({
  activityId: z.string().uuid(),
  createdBy: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const ActivityJoinedEventSchema = z.object({
  activityId: z.string().uuid(),
  userId: z.string().uuid(),
  joinedAt: z.string().datetime(),
});

export const ActivityFormedEventSchema = z.object({
  activityId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()),
  formedAt: z.string().datetime(),
});

export const ActivityCancelledEventSchema = z.object({
  activityId: z.string().uuid(),
  reason: z.enum(['BY_CREATOR', 'EXPIRED']),
  cancelledAt: z.string().datetime(),
});

export const ActivityEndedEventSchema = z.object({
  activityId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()),
  completedAt: z.string().datetime(),
});

export const ActivityStatusChangedEventSchema = z.object({
  activityId: z.string().uuid(),
  fromStatus: ActivityStatusEnum,
  toStatus: ActivityStatusEnum,
  changedAt: z.string().datetime(),
});

export type ActivityCreatedEvent = z.infer<typeof ActivityCreatedEventSchema>;
export type ActivityJoinedEvent = z.infer<typeof ActivityJoinedEventSchema>;
export type ActivityFormedEvent = z.infer<typeof ActivityFormedEventSchema>;
export type ActivityCancelledEvent = z.infer<typeof ActivityCancelledEventSchema>;
export type ActivityEndedEvent = z.infer<typeof ActivityEndedEventSchema>;
export type ActivityStatusChangedEvent = z.infer<typeof ActivityStatusChangedEventSchema>;
```

---

## §7 对 B/D/E/F 的集成契约（其他 CC 会话必读）

以下是 A+C 期待 / 提供的接口。其他板块的 CC 会话实现时**必须**遵守这些 shape，否则 A+C 侧会 runtime 校验失败。

### §7.1 B 板块（冰箱/食材/拍照识图）

**A+C 需要从 B 消费的 client 接口**：

```ts
// packages/contracts/src/ingredients/ingredient.ts
export const IngredientSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().min(1),
  category: z.string().nullable(),     // 菜/肉/主食/调料
  tasteTags: z.array(z.string()),      // 来自 AI 识别
  recognizedFromImageUrl: z.string().url().nullable(),
  addedAt: z.string().datetime(),
  expiresAt: z.string().datetime(),    // "出走"时间，默认 +24h
});
export type Ingredient = z.infer<typeof IngredientSchema>;

export interface IngredientsClient {
  listByUser(userId: string): Promise<Ingredient[]>;
  getByIds(ids: string[]): Promise<Ingredient[]>;
}
```

**B 必须提供的 HTTP 端点**（C 调用时会走 `IngredientsClientImpl`）：

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/ingredients?userId=:id` | ✓ | `{ items: Ingredient[] }` |
| POST | `/ingredients:byIds` | ✓ | Request: `{ ids: uuid[] }`, Response: `{ items: Ingredient[] }` |
| POST | `/ingredients/recognize` | ✓ | multipart → `{ recognized: [{ name, confidence, tasteTags[] }] }` |

**B 表结构建议**（可调，但字段名和 IngredientSchema 对齐）：
```sql
CREATE TABLE i_ingredients (
  id            UUID PRIMARY KEY,
  user_id       UUID NOT NULL,          -- 不建 FK 跨板块
  name          VARCHAR(100) NOT NULL,
  category      VARCHAR(50),
  taste_tags    TEXT[] DEFAULT '{}',
  recognized_from_image_url VARCHAR(500),
  added_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL
);
```

**B 的 CC 会话 mock A+C 的方式**（如果 B 先完成、A+C 还没起）：B 不需要 mock A+C，只需遵守 JWT 头格式从 A 拿当前用户。A 的 `/me` 端点在 walking skeleton 里必须最早出来。

### §7.2 D 板块（匹配）

**D 只读 A/C，不写**。

**D 消费**（从 A+C 读）：
- `GET /users/:id/public` — 获取用户公开信息
- `GET /me/preferences/friend` + `/me/preferences/food` — D 以调用方身份带 token 读自己请求的用户偏好
- `GET /activities?status=WAITING_FOR_MEMBERS,FORMED` — 可匹配的活动池
- 订阅 `activity.created` / `activity.cancelled` — 更新候选池缓存

**D 必须提供的端点**（A+C 前端调用）：
```
GET /recommendations/activities   → 推荐活动列表（当前用户视角）
  Response: PaginatedResponseSchema(MatchedActivitySchema)
  MatchedActivitySchema = ActivitySchema.extend({
    matchScore: z.number().min(0).max(1),
    reason: z.string(),   // "你常吃川菜 + 距离 2km" 这种人类可读描述
  })

GET /recommendations/friends      → 推荐食物好友
```

**D 不能**：
- UPDATE `a_activities`（C 的专属写权）
- INSERT `a_activity_participants`（走 A+C 的 `/activities/:id/join`）

### §7.3 E 板块（聊天）

**A+C 需要从 E 消费**：

```ts
// packages/contracts/src/chat/create-room.ts
export const CreateRoomRequestSchema = z.object({
  activityId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()).min(2),
});

export const CreateRoomResponseSchema = z.object({
  roomId: z.string().uuid(),
});

export interface ChatClient {
  createRoom(req: CreateRoomRequest): Promise<CreateRoomResponse>;
  addParticipant(roomId: string, userId: string): Promise<void>;
  removeParticipant(roomId: string, userId: string): Promise<void>;
}
```

**E 必须提供的端点 / 事件消费**：

| Method | Path | Auth | 说明 |
|---|---|---|---|
| POST | `/chat/rooms` | ✓（服务间使用 service token 或 JWT） | `CreateRoomRequestSchema` → `CreateRoomResponseSchema` |
| POST | `/chat/rooms/:id/participants` | ✓ | `{ userId: uuid }` |
| DELETE | `/chat/rooms/:id/participants/:userId` | ✓ | — |

E 订阅事件：
- `activity.formed` → 确保房间已创建（幂等）
- `activity.joined` → `addParticipant`
- `activity.left` → `removeParticipant`
- `activity.cancelled` / `activity.ended` → 标记房间归档但不删除

### §7.4 F 板块（信用）

**A+C 需要从 F 消费**：

```ts
// packages/contracts/src/credit/credit.ts
export const CreditScoreSchema = z.object({
  userId: z.string().uuid(),
  score: z.number().int().min(0).max(100),
  updatedAt: z.string().datetime(),
});

export interface CreditClient {
  getUserCredit(userId: string): Promise<CreditScore>;
  getBatch(userIds: string[]): Promise<CreditScore[]>;
}
```

**F 必须提供的端点**：

| Method | Path | Auth | Response |
|---|---|---|---|
| GET | `/credit/users/:id` | ✓ | `CreditScoreSchema` |
| POST | `/credit/users:batch` | ✓ | `{ ids: uuid[] }` → `{ items: CreditScore[] }` |

**F 订阅事件**：
- `activity.formed` → 无操作（仅记录）
- `activity.ended` → 参与者 +credit
- `activity.cancelled` (reason=`BY_CREATOR`，且在 startTime 前 < 2h) → 创建者 -credit
- `user.registered` → 初始化 credit = 60

**F 无需写 A/C 表**。credit 通过自己的 `f_credit_scores` 存，A/C 只读。

---

## §8 Mock Client 实现规范（C 侧样例）

```ts
// apps/api/src/external/ingredients.client.ts
import { Injectable } from '@nestjs/common';
import type { IngredientsClient, Ingredient } from '@lin-shi/contracts';

export const INGREDIENTS_CLIENT = Symbol('IngredientsClient');

@Injectable()
export class MockIngredientsClient implements IngredientsClient {
  async listByUser(userId: string): Promise<Ingredient[]> {
    return [];   // 或返回符合 schema 的假数据
  }
  async getByIds(ids: string[]): Promise<Ingredient[]> {
    return [];
  }
}

@Injectable()
export class HttpIngredientsClient implements IngredientsClient {
  constructor(private readonly http: KyInstance) {}
  async listByUser(userId: string): Promise<Ingredient[]> {
    const res = await this.http.get(`ingredients?userId=${userId}`).json<{ items: Ingredient[] }>();
    return res.items;
  }
  // ...
}
```

```ts
// apps/api/src/external/external.module.ts
import { Module } from '@nestjs/common';
import { INGREDIENTS_CLIENT, MockIngredientsClient } from './ingredients.client';

const USE_MOCK = process.env.EXTERNAL_USE_MOCK === 'true';

@Module({
  providers: [
    { provide: INGREDIENTS_CLIENT, useClass: USE_MOCK ? MockIngredientsClient : HttpIngredientsClient },
    // 同样处理 CHAT_CLIENT, CREDIT_CLIENT, MATCHING_CLIENT
  ],
  exports: [INGREDIENTS_CLIENT /* ... */],
})
export class ExternalModule {}
```

**使用**：
```ts
@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(INGREDIENTS_CLIENT) private readonly ingredients: IngredientsClient,
  ) {}
}
```

切换 Mock / 真实现只改 `EXTERNAL_USE_MOCK` 或 useClass，调用方零改动。

---

## §9 前端集成约定

### §9.1 API client（apps/web/src/lib/api.ts）

```ts
import ky from 'ky';
import { env } from './env';
import { getAccessToken, setTokens, getRefreshToken, clearTokens } from './auth';

export const api = ky.create({
  prefixUrl: env.NEXT_PUBLIC_API_URL,
  hooks: {
    beforeRequest: [(request) => {
      const token = getAccessToken();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
    }],
    afterResponse: [async (request, _opts, response) => {
      if (response.status === 401 && !request.url.includes('/auth/refresh')) {
        const refreshToken = getRefreshToken();
        if (!refreshToken) { clearTokens(); return; }
        const refreshed = await ky.post('auth/refresh', {
          prefixUrl: env.NEXT_PUBLIC_API_URL,
          json: { refreshToken },
        }).json<AuthTokens>();
        setTokens(refreshed);
        request.headers.set('Authorization', `Bearer ${refreshed.accessToken}`);
        return ky(request);
      }
    }],
  },
});
```

### §9.2 useMe hook

```ts
// apps/web/src/hooks/use-me.ts
import { useQuery } from '@tanstack/react-query';
import { UserPrivateSchema, type UserPrivate } from '@lin-shi/contracts';
import { api } from '@/lib/api';

export function useMe() {
  return useQuery<UserPrivate>({
    queryKey: ['me'],
    queryFn: async () => UserPrivateSchema.parse(await api.get('me').json()),
    staleTime: 60_000,
  });
}
```

### §9.3 保护路由布局
```tsx
// apps/web/src/app/(protected)/layout.tsx
'use client';
import { redirect } from 'next/navigation';
import { useMe } from '@/hooks/use-me';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useMe();
  if (isLoading) return <FullScreenLoader />;
  if (error) redirect('/login');
  return <>{children}</>;
}
```

### §9.4 表单 + zod
```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateActivityRequestSchema, type CreateActivityRequest } from '@lin-shi/contracts';

const form = useForm<CreateActivityRequest>({
  resolver: zodResolver(CreateActivityRequestSchema),
  defaultValues: { title: '', location: '', maxParticipants: 4, joinScope: 'ACQUAINTANCES_ONLY', ingredientIds: [] },
});
```

---

## §10 Walking Skeleton（所有板块 CC 开工前必跑通）

Day 1 的"可跑通"定义：
1. `pnpm i` 成功
2. `docker compose up -d postgres` postgres 健康
3. `pnpm --filter @lin-shi/api dev` 启动，`GET /health` 200
4. `pnpm --filter @lin-shi/web dev` 启动，`/` 渲染无 console error
5. 前端能请求后端 `/health`（证明 CORS + env 正确）
6. `psql -h localhost -U postgres -d lin_shi -c "SELECT 1;"` 成功

**健康端点**（A+C 维护者实现）：
```ts
// apps/api/src/app.module.ts
@Controller()
class AppController {
  @Get('health')
  health() { return { ok: true, ts: new Date().toISOString() }; }
}
```

跑不通任何板块都不应开始，**阻塞级优先级**。

---

## §11 开发工作流

### §11.1 推荐 Skills（Claude Code 环境）
| Skill | 触发时机 |
|---|---|
| `superpowers:brainstorming` | 开新功能 / 改方向前 |
| `superpowers:writing-plans` | spec → implementation plan |
| `superpowers:using-git-worktrees` | 开 worktree（强制，除 trivial） |
| `superpowers:executing-plans` | 按 plan 推进 |
| `superpowers:test-driven-development` | 写契约 schema + interface 先 |
| `ui-ux-pro-max:ui-ux-pro-max` | 前端 UI 决策 |
| `frontend-logic-design:frontend-logic-design` | 前端交互/信息架构 |
| `simplify` | 代码自审 |
| `project-review:pjr` | lint + build + 逻辑 + 文档一致性 |
| `git-merge-to-develop:git-merge-to-develop` | rebase + MR |
| `superpowers:verification-before-completion` | 宣告完成前 |

### §11.2 没有 Skills 的手动 fallback

| Skill | 手动等效 |
|---|---|
| using-git-worktrees | `git worktree add ../lin-shi-<feature> feature/<name>` |
| brainstorming | 写 3 句话 spec + 2-3 方案对比 |
| writing-plans | 文件级改动清单 + 顺序 + 风险 |
| simplify | 人眼过 diff：重复、死代码、过度抽象、`any`、防御性冗余 |
| pjr | `pnpm -r lint && pnpm -r build`，然后逻辑点读 |
| git-merge-to-develop | `git fetch origin && git rebase origin/dev && git push -fu && gh pr create --base dev` |
| ui-ux-pro-max | 用 shadcn 默认 + Tailwind 主题色阶 |
| frontend-logic-design | 出稿后问：层级清不清？交互一致？渐进披露？ |
| verification-before-completion | 贴 lint/build/curl 输出作为证据，而非说"做完了" |

### §11.3 每次交付必走

```
brainstorming (按需) → writing-plans → worktree → 实现
  → simplify → pjr (lint+build+逻辑) → git-merge-to-develop → Playwright E2E
```

### §11.4 Playwright E2E（每板块完成前）

- Viewport：桌面 1920×1080 + 1440×900；移动 iPhone14Pro 393×852 + Pixel7 412×915
- 点通每个按钮，走完每条主流程：
  - A · 注册 → 登录 → 填偏好 → 退出 → 重新登录
  - A · 错误邀请码错误展示
  - A · 个人信息编辑保存持久
  - C · 列表 → 筛选 → 进入详情
  - C · 起锅（全字段）→ 创建 → 我的锅展示
  - C · 别人活动 join → FORMED 时参与者更新
  - C · leave → 状态回滚
- 空/加载/错误三态都触发
- 通过标准：console 0 red error；网络 status 符合预期
- 使用 `mcp__plugin_playwright-mcp_playwright__*` 系列 MCP 工具驱动（或命令行 playwright test --ui 手动跑）

---

## §12 整合前 checklist（每次 MR）

- [ ] `pnpm -r build` 全绿
- [ ] `pnpm -r lint` 零 error
- [ ] `grep -rn "any\|@ts-ignore" --include="*.ts" <your-diff>` 为空
- [ ] zod schema 与 TypeORM 实体字段一致（name / type / nullable）
- [ ] 跨板块字段变更已发群公告（契约 PR 号）
- [ ] `.env.example` 同步新增变量
- [ ] 你的 migration 在空库全量跑通
- [ ] `/api/docs` Swagger 能看到新端点
- [ ] 前端 dev server 点通，console 0 red
- [ ] Playwright 桌面 + 移动都走过关键流程
- [ ] commit message 符合 Conventional Commits

---

## §13 git 工作流

### 分支
- `main` — 部署源，仅管理员合
- `dev` — 集成分支，所有 feature 先合这
- `feature/module-<a|b|c|d|e|f>-<short>` — 开发分支
- `fix/<scope>-<desc>` — bug 修复

### 每日纪律
- 晚上 19:00 前：rebase dev + build 通过 + push feature 分支
- 早上 10:00 前：rebase dev + 解冲突 + 看群公告

### 合并命令（手动 fallback）
```bash
git fetch origin
git rebase origin/dev                     # 解冲突
pnpm -r lint && pnpm -r build            # 验证
git push -fu origin feature/module-x-foo
gh pr create --base dev --title "feat(module-x): ..." --body "..."
```

---

## §14 当前状态（会话级）

| | 状态 |
|---|---|
| PRD 理解 + 板块划分 | ✅ |
| 技术栈 + 仓库结构决定 | ✅ |
| 契约机制（本文件） | ✅ |
| Figma MCP 配置 | ✅（详见 `docs/figma-integration.md`） |
| `.env.example` 落地 | ⏳ |
| Walking Skeleton 搭建 | ⏳ Day 1 全员目标 |
| A 板块 spec → 实现 → 验收 | ⏳ 队友主线（非 heckson） |
| C 板块 spec → 实现 → 验收 | ⏳ 队友主线（非 heckson） |
| B（冰箱主视觉 / 内视觉） | ⏳ heckson 主线 |
| D/E/F 实现 | ⏳ 队友主线 |
| 联调 + Playwright | ⏳ Day 3 |
| 部署公网 demo | ⏳ Day 3 末 |

详细见 `docs/handoff-status.md`。

---

## §15 接手 CC 的第一动作

不管你接手哪个板块：

1. 读完本文件（尤其 §7 找到你板块对 A+C 的契约）
2. 读 `CLAUDE.md`
3. 跑 `/mcp` 确认任何你需要的 MCP（figma / playwright）在线
4. 进入 brainstorming → writing-plans → worktree → 实现 循环
5. 每次 MR 走 §12 checklist

遇到不清楚的 A+C 行为：**查本文件**而不是问用户。本文件是真相源；本文件没写的行为视为"未定义，向用户请示"。
