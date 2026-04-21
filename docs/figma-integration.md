# Figma 集成

## MCP 配置

**已配置**，见 `C:\Users\Jayden park\.claude.json` 的顶层 `mcpServers.figma`：

```json
"figma": {
  "command": "npx",
  "args": [
    "-y",
    "figma-developer-mcp",
    "--figma-api-key=figd_xxx",
    "--stdio"
  ]
}
```

Token 存在本机配置中，不进 git。不用了在 https://www.figma.com/settings 撤销。

**npm cache 注意事项**：原默认路径 `D:\nodejs\node_cache\` 没有写权限，已改到 `C:\Users\Jayden park\.npm-cache`。如果之后换机器/重装 Node，记得 `npm config set cache "C:\Users\Jayden park\.npm-cache"`。

## 文件信息

- **URL**：`https://www.figma.com/design/sVwVM1yIkQApx7J1STcbyh/Untitled?node-id=2-8916`
- **File key**：`sVwVM1yIkQApx7J1STcbyh`
- **起始 node-id**（用户最初打开的节点）：`2-8916`（Figma API 格式：`2:8916`）

## 如何在 Claude Code 会话中用

Framelink `figma-developer-mcp` 通常暴露以下工具（以实际 `/mcp` 输出为准；重启会话后用 `ToolSearch` query `figma` 确认名称）：

- `mcp__figma__get_figma_data` — 获取 file 结构 / 某个 node 的子树
- `mcp__figma__download_figma_images` — 导出某组 node 为 PNG（用来给 Claude 看视觉）

**标准调用序列：**
1. 先 `get_figma_data(file_key="sVwVM1yIkQApx7J1STcbyh", depth=2)` 列出顶层 Page 和 Frame
2. 找到属于"登录/个人信息/交友偏好/食物偏好/活动列表/起锅/我的锅"的 frame
3. 对每个 frame 调 `get_figma_data(..., node_id=...)` 拿详细结构
4. 需要视觉参考时调 `download_figma_images` 把 frame 导出为 PNG（到 `E:\Agent program\邻食\figma_exports\`）
5. 用 `Read` 工具读 PNG 作为设计参考

## 可用工具前缀

`mcp__figma__*` —— 重启 Claude Code 会话后 `/mcp` 查看。如果状态不是 **connected**：
- 查看 MCP 日志
- 确认 `npx -y figma-developer-mcp` 能手动跑通
- 确认 token 没被 Figma revoke

## 板块 <-> frame 对应（2026-04-20 会话填充完成）

| 板块 | Figma frame / node-id | 本地 PNG |
|---|---|---|
| A · 登录 / 邀请码注册 | `2:8907` | `figma_exports/frame-02.png` |
| A · 个人信息综合（查看） | `32:207` | `figma_exports/frame-04.png` |
| A · 个人信息编辑 | **Figma 缺稿**，自创设计 | — |
| A · 交友偏好编辑 | **Figma 缺稿**，自创设计 | — |
| A · 食物偏好编辑 | **Figma 缺稿**，自创设计 | — |
| A · 邀请码详情 | **Figma 缺稿**，自创设计（从 frame-04 邀请码卡片下钻） | — |
| C · 我的锅列表 | `2:8910` | `figma_exports/frame-06.png` |
| C · 起锅（创建活动） | `32:448` | `figma_exports/frame-05.png` |
| C · 我的锅详情（2/3 人） | `2:8916` | `figma_exports/frame-12.png` |
| C · 我的锅详情（4/5 人数据变体） | `42:4715` | `figma_exports/frame-15.png` |
| C · 我的锅详情（1/4 人数据变体） | `43:5330` | `figma_exports/frame-16.png` |
| C · 活动消息中心（4 tab） | `2:8911-8914` | `figma_exports/frame-07..10.png` |
| C · 发现全部活动 | **Figma 缺稿**，自创设计 | — |
| 全局 · 底栏（三件套） | 从 `2:8906` 抽取 | `figma_exports/frame-01.png` |

**其他 frames（不在本仓库 A+C 范围）**：
- `2:8906` 首页冰箱关闭态 · B 板块
- `2:8210` 冰箱展开 · B 板块
- `37:2692` 食材到达弹层 · B 板块
- `39:3639` 拍照识别 · B 板块
- `32:1064` 聊天室 · E 板块

**MCP 离线的 fallback**：Figma MCP 会话断开后，直接 Read 本地 PNG 作为视觉参考即可（`figma_exports/frame-0X.png`）。
