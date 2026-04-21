# 邻食 V2 · 数据流转文档

> 本文件描述各页面间的用户路径、数据传递方式，以及与 TEAM-CONTRACT.md 的对齐情况。
> 最后更新：2026-04-21

---

## 一、完整数据流转图

```
首页（冰箱主视觉）
├── 准备起锅 ──────────────→ /activities/new（起锅创建）
│                                  └── 完成创建 ──→ /activities/[id]（我的活动详情）
│
├── 近期活动 ──────────────→ /activities（活动列表）
│                                  └── 点击活动卡片 ──→ /activities/[id]（活动详情）
│                                        ├── 未加入：底部「加入」→ POST /activities/:id/join
│                                        │          加入成功（FORMED）→ 底部变「去聊这锅」
│                                        └── 已加入：底部「去聊这锅」→ /chat/[roomId]
│
├── 个人信息 ──────────────→ /profile（用户主页）
│                                  ├── 编辑资料 → /profile/edit
│                                  ├── 交友偏好 → /preferences/friend
│                                  └── 食物偏好 → /preferences/food
│
└── 冰箱（点击冰箱门）
       │
       ├── 未登录 ──────────→ /login（鉴权页）→ 登录成功 → 返回冰箱 /fridge
       │
       └── 已登录 ──────────→ /fridge（冰箱内部）
              │
              ├── 点击食材（已出走）──→ 对方冰箱主页（匹配详情）
              │                           └── 底部「去聊这锅」→ /chat/[roomId]
              │
              ├── 点击食材（未出走）──→ 弹出「出走配置层」
              │                           └── 确认出走 → PUT /ingredients/:id（更新出走状态）
              │                                         → 食材显示"出走中"标签
              │
              ├── 点击拍照 ──────────→ /fridge/recognize（拍照识别页）
              │                           └── 识别成功 → POST /ingredients（新增食材）
              │                                        → 返回 /fridge，食材显示在冰箱内
              │
              ├── 我的活动锅（门内侧）→ /activities?joinedBy=me（我的活动列表）
              │                           └── 点击「去聊天」→ /chat/[roomId]
              │                                  ※ roomId 来自 activity.chatRoomId
              │
              └── 我的消息（门内侧）──→ /chat/list（聊天列表）
                                          └── 点击聊天项 → /chat/[roomId]
```

---

## 二、各路径详细说明

### 2.1 首页 → 起锅创建 → 我的活动

| 步骤 | 页面 | API | 数据传递 |
|---|---|---|---|
| 1 | `/activities/new` | — | 表单本地状态 |
| 2 | 提交创建 | `POST /activities` | `CreateActivityRequestSchema` |
| 3 | 创建成功 | — | 返回 `ActivityDetailSchema`，取 `id` |
| 4 | 跳转 | `/activities/[id]` | URL param: `id` |

### 2.2 首页 → 活动列表 → 活动详情 → 加入 → 聊天

| 步骤 | 页面 | API | 说明 |
|---|---|---|---|
| 1 | `/activities` | `GET /activities` | 列表展示 |
| 2 | `/activities/[id]` | `GET /activities/:id` | 详情，含 `status` / `chatRoomId` |
| 3 | 点击「加入」| `POST /activities/:id/join` | 返回更新后的 `ActivityDetailSchema` |
| 4 | 若触发 FORMED | `ChatClient.createRoom` | 后端自动回填 `chatRoomId` |
| 5 | 底部按钮变「去聊这锅」| — | 前端读 `chatRoomId !== null` 切换按钮 |
| 6 | 跳转聊天室 | — | `/chat/[chatRoomId]?title=活动名` |

### 2.3 冰箱 → 鉴权 → 冰箱内部

| 状态 | 行为 | 页面 |
|---|---|---|
| 未登录 | 点击冰箱门 | → `/login` |
| 登录成功 | redirect_back | → `/fridge` |
| 已登录 | 直接进入 | `/fridge` |

> **注**：`(protected)/layout.tsx` 的 `useMe()` 报错时 redirect 到 `/login`，覆盖此逻辑。

### 2.4 冰箱 → 食材出走

```
点击食材
  ├── isLeaving === true（已出走）
  │     → 全屏动画：食材飞向右上角
  │     → 进入对方冰箱主页（/fridge/:userId）
  │     → 底部卡片「✅ 食材已到达」+ 「去聊这锅」→ /chat/[roomId]
  │
  └── isLeaving === false（未出走）
        → 弹出底部 Sheet：出走配置（食友信息、时间）
        → 确认 → PUT /ingredients/:id { isLeaving: true }
        → 食材卡片显示"出走中"标签
```

### 2.5 冰箱 → 拍照识别

```
点击拍照
  → /fridge/recognize
  → 调用 POST /ingredients/recognize（B 板块提供）
  → 识别结果 [{name, confidence, tasteTags}]
  → 用户确认
  → POST /ingredients（创建食材）
  → 返回 /fridge，食材出现在冰箱层板
```

### 2.6 聊天入口汇总

| 来源 | 跳转方式 | roomId 来源 |
|---|---|---|
| 活动详情「去聊这锅」| `router.push` | `activity.chatRoomId` |
| 冰箱门内侧「我的消息」| `router.push` | chat_list 列表选择 |
| 冰箱门内侧「我的活动锅」→「去聊天」| `router.push` | `activity.chatRoomId` |
| 对方冰箱「去聊这锅」| `router.push` | 匹配返回的 `roomId` |
| chat_list 列表点击 | `router.push` | `room.id` |

---

## 三、与 TEAM-CONTRACT.md 的对齐问题

以下是对照 PRD 和契约发现的**待解决问题**，需各板块确认：

### ⚠️ 问题1：首页路由当前缺失

**现状**：`app/page.tsx` 暂时重定向到 `/chat/list`（开发调试用）。  
**PRD 要求**：首页应是冰箱主视觉，包含「起锅/近期活动/个人信息/点击冰箱」四个入口。  
**待办**：A+C 板块需实现真实首页，实现后将 `app/page.tsx` 改回冰箱视觉入口。

---

### ⚠️ 问题2：活动详情页「去聊这锅」按钮逻辑不完整

**现状**：`activity-detail.tsx` 的按钮硬编码跳转 `/chat/room-2`。  
**应有逻辑**：
```ts
// 应读取 activity.chatRoomId
if (activity.chatRoomId) {
  router.push(`/chat/${activity.chatRoomId}?title=${activity.title}`);
} else {
  // 活动还未成局，按钮应为「加入活动」
}
```
**待办**：C 板块完成 API 后，E 板块需联调替换硬编码。

---

### ⚠️ 问题3：chat_room 内的 roomId 目前是 mock 字符串

**现状**：`room-1`、`room-2`、`room-3` 是前端 mock ID，非真实 UUID。  
**契约要求**：`chatRoomId` 应为 UUID，来自 `ChatClient.createRoom` 回填到 `a_activities.chat_room_id`。  
**待办**：E 板块实现 `POST /chat/rooms` 后，联调时替换所有 mock roomId。

---

### ⚠️ 问题4：冰箱门内侧「我的消息」→ chat_room 缺少 roomId 映射

**现状**：契约中未定义从冰箱消息入口如何获取 roomId。  
**建议**：冰箱消息提醒应携带 `roomId`，点击直接跳转。B 板块需在消息提醒数据里包含 `roomId` 字段。  
**待办**：B 板块与 E 板块确认消息数据结构。

---

### ⚠️ 问题5：my_chat（图6）与 activities 列表存在功能重叠

**现状**：`/chat/my`（我的锅）和 `/activities?joinedBy=me` 展示内容相似。  
**PRD 表述**：冰箱内侧「活动锅状态卡」点击进入的是「我的锅」（活动状态），非独立聊天入口。  
**建议**：`/chat/my` 定位为「聊天维度的我的锅（快速进入聊天）」，`/activities?joinedBy=me` 是「活动维度的我的锅（查看食材/状态）」，两者并存不冲突。

---

### ⚠️ 问题6：食材「出走」动画和对方冰箱页面尚未规划路由

**现状**：契约中 `fridge/` 目录只有占位，B 板块未定义 `/fridge/:userId` 路由。  
**PRD 要求**：点击已出走食材 → 动画 → 进入对方冰箱主页 → 展示「去聊这锅」。  
**待办**：B 板块需定义 `/fridge/[userId]` 路由及数据结构。

---

### ✅ 已对齐项

| 项目 | 状态 |
|---|---|
| E 板块路由结构（chat_list / chat_room / chat_detail） | ✅ 已实现并写入契约 |
| 标题通过 `?title=` query param 在三页面传递 | ✅ 已实现 |
| `POST /chat/rooms` 契约 schema | ✅ 已在契约 §7.3 定义 |
| `activity.formed` 事件触发创建聊天室 | ✅ 契约 §6.4 已定义 |
| JWT 鉴权守卫 `(protected)/layout.tsx` | ✅ 契约 §9.3 已定义 |
| chat_list 主题色 `#FFF5F7→#FDF6F8→#FAFAFA` | ✅ 已实现 |

---

## 四、前端页面 ↔ 后端 API 对照

| 前端页面 | 调用 API | 板块 |
|---|---|---|
| `/activities` | `GET /activities` | C |
| `/activities/new` | `POST /activities` | C |
| `/activities/[id]` | `GET /activities/:id` | C |
| `/activities/[id]` 加入 | `POST /activities/:id/join` | C |
| `/fridge` | `GET /ingredients?userId=me` | B |
| `/fridge/recognize` | `POST /ingredients/recognize` | B |
| `/chat/list` | `GET /chat/rooms`（待 E 实现） | E |
| `/chat/[roomId]` | WebSocket / `GET /chat/rooms/:id/messages`（待 E 实现） | E |
| `/profile` | `GET /me` | A |
| `/preferences/friend` | `GET/PUT /me/preferences/friend` | A |
| `/preferences/food` | `GET/PUT /me/preferences/food` | A |
