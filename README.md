# 邻食 · heckson 工作区

## 分工（重要）

- **你负责**：**B 板块 — 冰箱主视觉、内页（内）视觉**，即与食材 / 冰箱 / 拍照识图相关的界面与视觉落地（见 [TEAM-CONTRACT.md](./TEAM-CONTRACT.md) §7.1 及前端 `fridge` 等路径约定）。
- **不负责**：**A（认证）与 C（活动锅）** 的全栈实现由**其他队友**在其他仓库或主线完成；联调时遵守同一份契约。

## 本地开发（B）

1. 安装依赖：`pnpm install`
2. 复制环境：`copy apps\api\.env.example apps\api\.env`，`copy apps\web\.env.example apps\web\.env.local`（PowerShell 可用 `Copy-Item`）
3. 双终端分别运行：`pnpm dev:api`（默认 `:3000`）、`pnpm dev:web`（`:3001`）
4. 浏览器打开 `http://localhost:3001`，进入 **冰箱** 页；接口为 mock 食材数据，形状符合 `IngredientSchema`。

可选：`pnpm db:up` 启动 Docker PostgreSQL，供后续接入 `i_ingredients` 使用。

详细联调说明见 [docs/teammate-handoff.md](./docs/teammate-handoff.md)。

---

# Figma MCP 服务器配置

此工作区已配置为使用 Figma 模型上下文协议 (MCP) 服务器。

## 设置

Figma MCP 服务器是一个托管的远程服务器。要在 VS Code 中与 GitHub Copilot 一起使用：

1. 确保您有 Figma 账户。
2. 在 VS Code 中，使用命令面板 (Ctrl+Shift+P) 并运行 `MCP: Add Server`。
3. 选择 `HTTP` 作为类型。
4. 输入 URL：`https://mcp.figma.com/mcp`
5. 如有必要，重启 VS Code。

## 使用

配置完成后，您可以使用如下提示：
- "Generate my Figma selection in React using Tailwind."（生成我的 Figma 选择为 React 使用 Tailwind。）
- "Get the variables used in my Figma selection."（获取我的 Figma 选择中使用的变量。）
- "Add a new frame to my Figma file with a button component."（向我的 Figma 文件添加一个带有按钮组件的新框架。）

有关更多详细信息，请参阅 [Figma MCP 服务器指南](https://github.com/figma/mcp-server-guide)。

## 先决条件

- Figma 账户（免费或付费）。
- 启用 GitHub Copilot 的 VS Code。
- 对于写操作，专业、组织或企业计划。