# 邻食 · Design System（Figma 校准版）

> 从 16 张 Figma frame（`sVwVM1yIkQApx7J1STcbyh`）里抽取的设计 tokens。所有 A+C 模块前端实现必须遵守此文件。B/D/E/F 板块也建议对齐以保持整体一致。

## 0. 品牌气质
- **柔和、温暖、亲近**。主要情绪：家的感觉 + 略带少女心的可爱。
- 视觉策略：渐变 + 大量留白 + 圆润 radius + emoji 辅助辨识。**不要**走 brutalism / glassmorphism / dark mode。

## 1. 色彩系统

### 1.1 主色（Brand）
从 Figma 采样。所有定义在 Tailwind `tailwind.config.ts` 的 `theme.extend.colors`。

| Token | Hex | 用途 |
|---|---|---|
| `brand.primary.50` | `#FFF1F3` | 极淡粉，大片背景 |
| `brand.primary.100` | `#FFE0E6` | 卡片次要背景 |
| `brand.primary.200` | `#FFC2CD` | Tab 选中背景、徽章底色 |
| `brand.primary.400` | `#FF8FA1` | 次要强调 |
| `brand.primary.500` | `#FF6B8A` | **主 CTA 按钮（"进入冰箱"、"开锅"）** |
| `brand.primary.600` | `#F7536E` | CTA hover / pressed |
| `brand.primary.700` | `#D93F58` | 暗强调 |

### 1.2 辅助色（Accent）
| Token | Hex | 用途 |
|---|---|---|
| `accent.peach.400` | `#FFB68C` | 暖橘渐变端点（头像栏、邀请码卡片） |
| `accent.peach.500` | `#FF9A65` | "去聊聊" 按钮底色 |
| `accent.coral.500` | `#FF7F5C` | 警示/倒计时（"快开始" 标签） |

### 1.3 语义色（Semantic）
| Token | Hex | 用途 |
|---|---|---|
| `success.500` | `#34D399` | 进行中状态标签、成功 toast |
| `success.100` | `#D1FAE5` | 进行中 chip 背景 |
| `warning.500` | `#F59E0B` | 快开始、黄色 alert |
| `warning.100` | `#FEF3C7` | 快开始 chip 背景 |
| `danger.500` | `#EF4444` | 错误文案、删除按钮 |
| `danger.100` | `#FEE2E2` | 错误背景 |
| `info.500` | `#3B82F6` | 链接、系统提示 |

### 1.4 中性色（Neutral）
| Token | Hex | 用途 |
|---|---|---|
| `neutral.0` | `#FFFFFF` | 卡片底色 |
| `neutral.50` | `#FAFAFA` | 页面底色 |
| `neutral.100` | `#F4F4F5` | 输入框底色、占位背景 |
| `neutral.200` | `#E4E4E7` | 分割线、禁用 chip |
| `neutral.400` | `#A1A1AA` | 占位文字 |
| `neutral.500` | `#71717A` | 次要文字 |
| `neutral.700` | `#3F3F46` | 正文 |
| `neutral.900` | `#18181B` | 标题 |

### 1.5 渐变（关键视觉）
| Token | 组合 | 用途 |
|---|---|---|
| `gradient-warm` | `linear-gradient(135deg, #FFE0E6 0%, #FFCAB0 100%)` | 页面顶部背景（frame-03/04/13 的头部） |
| `gradient-cta` | `linear-gradient(135deg, #FF8FA1 0%, #FFB68C 100%)` | 主 CTA 渐变按钮（起锅"开锅！🔥"） |
| `gradient-invite` | `linear-gradient(135deg, #FFCAD4 0%, #FFB68C 100%)` | 邀请码卡片（frame-04 "LINSH-7823"） |

### 1.6 对比度验证
- 所有 CTA 文字（白）在 `primary.500` 上：`#FFFFFF` vs `#FF6B8A` 对比度 ~3.6:1。**要求：CTA 按钮的文字使用 bold，尺寸 ≥16px** 以满足 WCAG Large Text 3:1。
- 正文 `neutral.700` vs `neutral.0` 对比度 10.8:1 ✅
- 次要文字 `neutral.500` vs `neutral.0` 对比度 4.54:1 ✅ 刚好达标

## 2. 字体

### 2.1 字体栈（自带 fallback）
```css
font-family:
  "PingFang SC",            /* Apple 中文 */
  "HarmonyOS Sans SC",
  "Microsoft YaHei",
  "Noto Sans SC",
  -apple-system,
  BlinkMacSystemFont,
  "Helvetica Neue",
  Arial,
  sans-serif;
```

Google Fonts 备用（部署到公网时）：**Noto Sans SC**（Regular 400 / Medium 500 / Bold 700）。

### 2.2 尺寸阶梯（基准 16px）
| Token | size / line-height | weight | 用途 |
|---|---|---|---|
| `text-display` | 32px / 40px | 700 | Hero 标题（"邻食" 品牌标） |
| `text-h1` | 24px / 32px | 700 | 页面标题（"我的锅" / "这几锅饭"） |
| `text-h2` | 20px / 28px | 600 | 段落大标题（"我的活动" / "交友偏好"） |
| `text-h3` | 18px / 26px | 600 | 卡片标题（"今晚煮番茄鸡蛋面"） |
| `text-body` | 16px / 24px | 400 | 正文 |
| `text-body-sm` | 14px / 20px | 400 | 次要正文 |
| `text-caption` | 12px / 16px | 400 | 辅助文字、时间戳 |
| `text-label` | 14px / 20px | 500 | 标签文字（"接受陌生人"） |
| `text-chip` | 12px / 16px | 500 | chip / badge（"进行中"） |
| `text-button` | 16px / 24px | 600 | 按钮 |

### 2.3 数字
邀请码、倒计时、积分统一用 **tabular figures**（`font-variant-numeric: tabular-nums;`），防止换行时跳动。

## 3. 间距

### 3.1 间距系统（4 的倍数）
| Token | px | 用途 |
|---|---|---|
| `space-0` | 0 | — |
| `space-1` | 4 | icon 和文字之间 |
| `space-2` | 8 | chip 内缩进 |
| `space-3` | 12 | 卡片内小元素间 |
| `space-4` | 16 | 卡片 padding / 段落间距 |
| `space-5` | 20 | 输入框 padding Y |
| `space-6` | 24 | 段落间大间距 |
| `space-8` | 32 | 区块间距 |
| `space-10` | 40 | 页面 section 之间 |
| `space-12` | 48 | 页顶/页底 safe padding |

### 3.2 页面级
- 页面左右 padding：`16px`（`space-4`），小屏（<360）可以到 `12px`
- 底部 safe area：`max(env(safe-area-inset-bottom), 16px)`
- 底栏导航高度：`72px`（内含"准备起锅"凸起的大圆按钮 56px + 上下 8px）

## 4. 圆角 & 阴影

### 4.1 Radius
| Token | px | 用途 |
|---|---|---|
| `rounded-sm` | 8 | chip、小按钮 |
| `rounded-md` | 12 | 输入框、小卡片 |
| `rounded-lg` | 16 | 常规卡片（活动卡、消息卡） |
| `rounded-xl` | 20 | 邀请码卡片、页面顶部 hero |
| `rounded-2xl` | 24 | 大弹层（登录 modal） |
| `rounded-full` | 9999 | 圆形按钮、头像 |

### 4.2 Shadow
| Token | value | 用途 |
|---|---|---|
| `shadow-sm` | `0 1px 2px rgba(24,24,27,0.04)` | 扁平卡片 |
| `shadow-md` | `0 4px 12px rgba(24,24,27,0.06)` | 浮起卡片、活动卡 |
| `shadow-lg` | `0 12px 32px rgba(24,24,27,0.10)` | 底栏浮起 CTA、弹层 |
| `shadow-glow-primary` | `0 8px 24px rgba(255,107,138,0.35)` | 主 CTA 高亮（"开锅"按钮） |

## 5. 图标 & Emoji

### 5.1 SVG 图标（Lucide）
- 尺寸：`16`（chip 内） / `20`（按钮内） / `24`（导航、通用）
- 描边粗细：统一 `1.75px`
- 风格：全 outline，**不混用 filled 和 outline**（参考 UX `icon-style-consistent`）

### 5.2 Emoji 使用规则
Figma 大量使用 emoji 展示食材（🍅 🥬 🍋）和状态（🔥 📍 ✨）。约束：

- ✅ **允许**：食材、食物、情感反应、动态文案装饰（frame-12 的 "📆 今晚 7:00"）
- ❌ **禁止**：功能性图标（导航、设置、删除、返回）——这些走 Lucide
- ❌ **禁止**：作为按钮唯一内容（一定要配合文字或 aria-label）

### 5.3 徽章图标
4 个冰箱贴图标放在 `apps/api/uploads/badges/` 下：
- `taste-master.svg`（口味达人）
- `healthy-life.svg`（健康生活）
- `warm-host.svg`（热情房主）
- `punctual-diner.svg`（准时达人）

Figma 里 frame-01 能看到前 4 个的样式；如果没导出，先用 Lucide 图标 + 渐变背景占位（`Palette` / `Leaf` / `Home` / `Clock` 搭配 chip 风格）。

## 6. 动画

### 6.1 Token
| 用途 | 参数 |
|---|---|
| 微交互（按钮按下） | `duration: 150ms, easing: cubic-bezier(0.4, 0, 0.2, 1)` |
| 卡片浮起 | `200ms, cubic-bezier(0.4, 0, 0.2, 1)` |
| 页面切换 | `280ms, cubic-bezier(0.32, 0.72, 0, 1)` |
| 弹层进出 | 进 `280ms`, 退 `180ms`（进慢退快原则） |
| 食材"出走"动画（PRD 要求） | 1.1s 整体；emoji 从中央 scale(1→1.4) 再 translate 右上 + opacity fade |

### 6.2 Framer Motion 预设
存在 `apps/web/src/components/motion/presets.ts`，至少导出：
- `fadeInUp`（卡片入场）
- `scalePressIn`（按钮按下）
- `ingredientWalkOut`（食材飞向右上）
- `refrigeratorMaskExpand`（冰箱遮罩扩散覆盖全屏）

### 6.3 尊重 `prefers-reduced-motion`
所有装饰性动画在 `prefers-reduced-motion: reduce` 下降级为 opacity fade（150ms）。

## 7. 布局栅格

### 7.1 视口
- **只支持竖屏移动**（375–430 主流；最小支持 360）
- 不做桌面端布局；桌面打开时显示"请用手机浏览器访问"或居中 max-width: 430px（任选，推荐后者以便 Playwright 桌面测）

### 7.2 页面骨架
```
┌─────────────────────┐
│  safe-area-top      │
│  ┌───────────────┐  │
│  │ 页面标题      │  │  ← h1 (24px bold)
│  │ <返回icon>    │  │
│  ├───────────────┤  │
│  │               │  │
│  │  内容区域     │  │  ← 左右 padding 16px
│  │  (ScrollView) │  │
│  │               │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │ 底栏（可选）  │  │  ← 72px，凸起 CTA
│  └───────────────┘  │
│  safe-area-bottom   │
└─────────────────────┘
```

### 7.3 底栏三件套（全局 `(protected)/layout.tsx`）
```
┌──────┬──────────────┬──────┐
│ 个人 │  ⬤ 准备起锅  │ 近期 │
│ 信息 │   (凸起 56px) │ 活动 │
└──────┴──────────────┴──────┘
```
- 左：`/profile`
- 中（凸起）：`/activities/new`
- 右：`/activities`（我的锅列表）
- 右带未读红点（基于 feed unread 总数 > 0）

## 8. 组件库策略

### 8.1 shadcn/ui 基座
- 先用 `npx shadcn@latest add button card input tabs dialog sheet toast skeleton avatar badge form label`
- 全部自定义主题：`primary` → `brand.primary.500`、`radius` → `rounded-lg`
- **禁止**直接使用 shadcn 默认 primary（会是蓝色或黑色）

### 8.2 项目自有组件
| 组件 | 位置 | 用途 |
|---|---|---|
| `FridgeStickerBadge` | `components/common/` | 冰箱贴（frame-01/04 那种渐变圆角卡） |
| `ActivityStatusChip` | `components/common/` | 活动状态 chip（进行中/招募中/快开始） |
| `IngredientEmoji` | `components/common/` | 食材展示（emoji + 可选"出走"标签） |
| `InviteCodeCard` | `components/common/` | 邀请码展示卡（渐变 + 大字 + 复制按钮） |
| `BottomNav` | `components/nav/` | 底栏三件套 |
| `PotButton` | `components/nav/` | 底栏中央凸起的"准备起锅"按钮 |
| `RefrigeratorMask` | `components/motion/` | 冰箱遮罩扩散过渡 |
| `IngredientWalkOut` | `components/motion/` | 食材飞向右上动画 |

## 9. 无障碍（Accessibility）强制项

- 所有图标按钮必须有 `aria-label`
- 表单输入必须有可见 label（不靠 placeholder 代替）
- 点击目标 ≥ 44×44px；icon-only 按钮加 `hitSlop` 或透明 padding
- 主 CTA 加 `role="button"` + `tabIndex=0`
- 活动状态 chip 不只用颜色区分，必须有文字（"进行中" / "快开始"）
- 图片/emoji 作装饰的加 `aria-hidden="true"`

## 10. 空/加载/错误三态（每个列表/页都要）

### 10.1 空态
- 居中 emoji（比如 "🍳" 或 "🧊"）+ 一句话 + 主行动按钮
- 例：我的锅列表空态："还没有锅在煮呢 / [去起一锅 →]"

### 10.2 加载态
- 骨架屏（Skeleton）：卡片轮廓 + 渐变灰块
- **禁止**纯 spinner 满屏

### 10.3 错误态
- 不友善错误："出问题啦 😥 / 请稍后再试" + 重试按钮
- 网络错误：toast + 页面保持上次成功数据

## 11. 参考 Figma 风格详情
- 头像：圆形，浅粉描边，头像右上角可带小状态点
- 卡片顶部带 emoji 或 小图；卡片底部右侧放 CTA（"去聊聊"、"编辑资料"）
- 大部分"卡片内文字"按"标题 / 次要说明 / chip" 三段式
- 底栏凸起按钮**有柔和 glow**（`shadow-glow-primary`），pressed 时 scale(0.96)
