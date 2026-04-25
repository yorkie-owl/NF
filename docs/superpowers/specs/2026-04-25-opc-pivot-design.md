# OPC Pivot · 设计稿（黑客松路演前 · 1 页 storyboard）

> 本文件是 brainstorming 阶段的精简 design doc（非完整 spec）。advisor 已认可走精简流程。
> 上下文：明天路演，3 分钟。今晚交付 = **产品 OPC 化** + **路演展示页**，先产品后展示页。

## 0 · 命名与隐喻（用户决策：名字不改）

- **产品落地名**：**邻食**（保留原名）
- **副标题**：OPC 协作平台——邻里之间的小团体拼桌
- **核心做法**：食物隐喻**整套保留 + 升级解读**——零文案/emoji 改造，靠路演口播为评委建立"食物 = OPC 协作"的解读：
  - 菜 / 锅 / 局 = 一次 OPC 协作（2-10 人）
  - 食材 = 一个 idea / 技能 / 想做的事
  - 冰箱 = 你的"在售/在库"清单
  - 出走 = idea 到躁动期，自己跑出去找拼桌
  - culina-bot → OPC 拼桌助理（同一个 LangGraph，换 system prompt）
  - 距离 km / 时间槽 / 接受陌生人 = 协作半径 / 时间档期 / 接受陌生 OPC（语义重叠，不改 UI）

## 1 · 核心机制 · idea 离家出走 → 拼桌 → 局成功（5 步）

```
[上架] → [躁动] → [离家出走 + agent 匹配] → [拼桌成局] → [推局成功]
   ↑       ↑              ↑                      ↑              ↑
 用户    定时升高      AI agent 主动行为     用户确认+状态机    agent 二次出手
```

**5 步细节**

1. **上架**：用户敲 idea 卡（标题 + 风格 tag + 场景 tag + 一句描述 + 默认 7 天躁动期）。
2. **躁动**：每张卡有 `restlessness: 0..100`，由 `(now - addedAt) / (expiresAt - addedAt)` 反推。卡片右上角进度环。
3. **离家出走（agent 主动）**：到 100% 卡片自己飞出冰箱 → agent 在跨用户 idea 池里找匹配 → 输出：
   - `matchScore` + 一句拟人 `reason`（复用 `MatchedActivity`）
   - 推荐拼桌组合（≥1 张其他 idea）
   - 建议饭局题目 + 推荐参与者
4. **拼桌成局**：用户点"让 TA 上桌" → 调 `CreateActivityRequest` → `WAITING_FOR_MEMBERS` → 凑齐 → `FORMED` → 自动开"局内面板"（mock 群聊）。
5. **推局成功（agent 二次出手 = 路演差异化）**：
   - 局内"**局长助理**"bot bubble（5min 内 3 个破冰题、第一周 1 个里程碑、结束时 1 张复盘卡）
   - 颁发"首桌成局"冰箱贴

## 2 · 产品端 · 改造清单（按文件粒度）

### A. 文案 & enum sweep —— **砍掉**

用户决策"名字不改"，食物隐喻整套保留，**emoji / 文案完全不动**。靠路演口播让评委建立"食材=idea / 锅=协作局"的解读。

唯一例外：`apps/web/src/lib/demo-ingredients.ts` 的 9 张示例卡可以**替换 tasteTags / contextTags 为 OPC 风格/场景词**（保留蔬果名 + emoji，让"番茄"的 tasteTag 是"快速原型"、contextTag 是"独立咖啡馆"），10min 即可。这强化了"食材=idea"的解读，又零视觉改动。

### B. idea 卡 · 躁动机制（90min · P0 第二项）

| 改动 | 文件 | 工时 |
|---|---|---|
| 加 `restlessness` 计算 helper | `apps/web/src/lib/restlessness.ts` 新建 | 15min |
| 进度环组件（SVG circle） | `apps/web/src/components/idea/RestlessnessRing.tsx` 新建 | 30min |
| 卡片右上角嵌入进度环 | `apps/web/src/app/fridge/inside/page.tsx` 已有的 `IngredientCell` 加上 | 15min |
| "出走"飞行动画（Framer Motion） | `apps/web/src/components/idea/IdeaWalkOut.tsx` 新建 | 30min |

### C. OPC Agent 接入（60-90min · P0 第三项）

| 改动 | 文件 | 工时 |
|---|---|---|
| `packages/culina-agent/src/opc-match-prompt.ts` 新建（OPC 拼桌助理 system prompt） | 新文件 | 15min |
| `packages/culina-agent/src/opc-match.ts` 新建 `runOpcMatch()` 接口（输入 1-3 张 idea，输出 `{matchScore, reason, suggestedTitle, icebreakers[3], milestone}`） | 新文件 | 30min |
| `apps/culina-server/src/main.ts` 加 `POST /api/opc-match` 端点 | 编辑 | 15min |
| `apps/web/src/lib/opc-agent.ts` 新建 fetch 函数 + 3s 超时 + fallback 读 `public/demo-cache/opc-match.json` | 新文件 | 30min |
| `apps/web/public/demo-cache/opc-match.json` 预录一个真实 LLM 响应 | 新文件 | 用户给 key 后跑一次 |

**Fallback 策略**（advisor 强烈建议）：
- 默认读 `public/demo-cache/opc-match.json`
- 如果调真 LLM 在 3s 内回 → 用真实结果；否则用缓存
- 路演口播可以照说"agent 真的在思考"——因为它确实跑过

### D. 真饭局 / 对抗局 —— **砍掉**

用户决策：对抗局完全不提（决策 2c）。真饭局已通过现有 `location` 字段隐式支持，路演口播一句话带过即可，**不加 mode chip、不加 kind chip**。零工时。

### E. 局长助理 + 复盘卡（45min · P1）

| 改动 | 文件 | 工时 |
|---|---|---|
| `apps/web/src/components/activities/AgentBubble.tsx` 新建（fake bot 消息气泡） | 新文件 | 20min |
| `apps/web/src/components/activities/RetroCard.tsx` 新建（COMPLETED 时显示） | 新文件 | 25min |

## 3 · 路演展示页（产品做完后再做 · 90-120min · P0 第四项）

用户决策 3b：**半手动**——按"下一帧"切换，每帧自动跑一段动画。**不要 autoplay 计时器**。

实现方式（首选 X，失败回退 Y）：
- **路径 X**：`apps/web/src/components/demo/StoryboardDriver.tsx`，挂在 hidden 入口（如 `/?demo=1`），监听键盘空格 / 屏幕底部"下一帧"按钮，触发 `router.push` + 帧内动画 + 显示底部字幕条
- **路径 Y**（备选）：新建 `apps/web/src/app/showcase/page.tsx`，复用 `MobileShell` 容器嵌套现有路由

storyboard 6 帧（半手动按"下一帧"，无固定时长，演讲者控节奏）：

| 帧 | 屏幕动作 | 口播 |
|---|---|---|
| 1 开场 + 上架 | 进冰箱主页 → 点新增 → 敲一张"食材"（如 `番茄·快速原型·独立咖啡馆 MVP`） | "邻食，原本是邻居一起干饭的平台。今天我们告诉你它真正的样子：OPC——一到十人的小协作团体——把脑子里想做的事当成食材，扔进冰箱。" |
| 2 躁动 | 跳到刚才那张卡，进度环可见涨满，卡片轻抖 | "每张'食材'有保鲜期。到点它就躁动——它知道自己不该烂在冰箱里。" |
| 3 出走 + agent 匹配 | 卡片飞出冰箱 → "agent thinking..." 动画 → **真调一次 LLM**（或 3s 超时回 cache） → 弹出推荐饭局卡 + 拟人 reason | "AI agent 主动出门，跨用户去找——不是别的商品、别的文档，是另一张能跟它配的'食材'，和它背后的人。" |
| 4 拼桌成局 | 点"让 TA 上桌" → 跳到立局页（已预填）→ 凑齐 → FORMED | "一桌就是一次协作，可以约线上、可以约真饭——location 字段是你定的。" |
| 5 推局成功 | 跳到详情页 → 局长助理消息（破冰题）→ 滚到底部 → 复盘卡 + 颁徽章 | "局长助理是你的 agent 同事：5 分钟破冰、第一周里程碑、结束复盘——它一直在桌上。" |
| 6 收束 | 全屏 logo + 一句标语 | "邻食。让脑子里那张食材，自己找到能拼桌的人。" |

## 4 · 不做（advisor 已认可）

- ❌ 拍照识别食材（产品端隐藏入口，路由保留）
- ❌ 真聊天（继续 mock）
- ❌ 真后端联调（产品依旧用现有 mock 路径，展示页全离线）
- ❌ 对抗局完整 UI（只 chip + 截图 + 口播）
- ❌ 信用分细节（保留 UI 角落，不强调）

## 5 · 风险登记

| 风险 | 概率 | 影响 | 对策 |
|---|---|---|---|
| LLM 调用失败 / 超时 | 高 | 致命 | 必做 pre-cache + 3s 超时赛跑 |
| OPC 文案 sweep 漏改导致演示中露出"食材" | 中 | 中 | 路演前用 grep `食材|起锅|这锅` 走查关键路径 5 屏 |
| 进度环 / 出走动画在 Safari/iOS 不流畅 | 中 | 低 | Framer Motion `prefers-reduced-motion` 兜底 |
| 时间用光 | 高 | 致命 | P0 项必须在 0-4h 内完成，超时砍 P1 |

## 6 · 工时总账（按用户 4 个决策修订后）

| 区块 | 原估 | 修订 | 备注 |
|---|---|---|---|
| A. 文案 sweep | 1.5h | **0** | 名字不改，隐喻保留升级解读 |
| A'. demo-ingredients tasteTags/contextTags 改成 OPC 词 | — | 0.2h | 强化"食材=idea"解读 |
| B. idea 躁动机制（restlessness 环 + 出走动画） | 1.5h | **1.5h** | 核心差异化 |
| C. OPC 拼桌 agent 接入（含 cache fallback） | 1-1.5h | **1.5h** | 等用户给 OpenAI 兼容 key |
| D. mode/kind chip | 0.5h | **0** | 砍掉 |
| E. 局长助理 fake bubble + 复盘卡 (P1) | 0.75h | **0.75h** | 路演关键 |
| F. 路演展示页（半手动 driver） | 1.5-2h | **1.5h** | 半手动比 autoplay 简单 |
| **小计** | 6.75-7.75h | **5.45h** | |
| 调试 / 走查缓冲 | 1-1.5h | **1h** | |
| **合计** | 8-9h | **≈ 6.5h** | |

## 7 · 已锁定决策（用户已答）

| # | 决策 | 用户答 | 落地 |
|---|---|---|---|
| 1 | LLM 通道 | OpenAI 兼容 key + base_url + model（用户提供） | C 区块按"真调 + 3s 超时 + cache fallback"实现 |
| 2 | 对抗局 | 完全不提 | D 区块整块砍掉，路演口播也不提 |
| 3 | 路演载体 | 半手动按"下一帧" | F 区块用 keydown/button 触发，无 autoplay 计时器 |
| 4 | OPC 中文名 | 不改，保留"邻食" | A 区块整块砍掉，隐喻整套保留 |

## 8 · 待用户最终拍板的剩余事项

1. **食物 emoji / 文案到底动不动？** 我目前的解读是"完全不动，靠口播解读为 OPC"。如果你其实想要**最低限度的语义改造**（比如首页大标题加一行副标题"OPC 协作平台"），告诉我，10 分钟可加。
2. **OpenAI 兼容 key**：何时给我？如果路演前才给，我先按 mock + cache 实现，等 key 到立即跑一次真调用把响应录入 cache。
3. **工作分支**：默认在 `develop` 上新开 `opc-pivot` 分支。同意吗？
4. **不写测试**：按 TEAM-CONTRACT，靠 grep + 手动点验。同意吗？

---

**以上 4 个剩余确认收到后立即进入 writing-plans + 执行。每完成一个 P0 子项独立 commit。**
