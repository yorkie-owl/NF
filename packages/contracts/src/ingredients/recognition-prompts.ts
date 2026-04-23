/**
 * 识图提示词与全量 Culina 流程（`@lin-shi/culina-agent` / 原 `web_test`）的结构关系：
 *
 * - `web_test.py` 中 `SYSTEM_PROMPT` 描述完整流水线：认食材 → `web_search` 食谱 → 打分排序 → 长报告。
 * - 本仓库的「加进冰箱/§7.1」需要**可解析的食物条目列表**（以 `name` 表示：可为**食材**或**成品菜肴**），与 `parseCulinaBotAnswerToRecognized` 配套，因此不照搬整段
 *   SYSTEM，而是**按「识别图中有何食物」**收缩为下文的 system + user 分工；并显式**禁止**食谱检索与长报告，避免和 Agent 版行为混淆。
 *
 * - 发往 `web_test` 的 `POST /api/test` 时，请求体中的 `question` 字段与 {@link INGREDIENT_RECOGNITION_USER_PROMPT_DEFAULT} 同义
 *   （见 `ingredients.service.ts` 转发逻辑）。
 * - 直连多模态 `chat.completions` 时，将 {@link INGREDIENT_RECOGNITION_SYSTEM_CULINABOT_ALIGNED} 与 user 分开发送（OpenAI 风格）。
 */

/** 与 `web_test` HTTP 的 `question` 默认一致，便于解析为顿号分隔或启发式。 */
export const INGREDIENT_RECOGNITION_USER_PROMPT_DEFAULT =
  '请识别图中食物：若画面以餐盘/碗盏/锅灶中的**已烹饪成品、外卖、摆盘菜**为主，请优先用常见菜名标出**菜肴**（可含面点、汤羹、小吃、简餐套餐中的各道菜）；若画面以**生鲜、果蔬、市场陈列或未下锅原料**为主，则标出**食材**；同一张图若兼有成品与可辨别的原料，可一并列出。' +
  '只输出这些名称，用顿号「、」分隔，不要编号、不要估热量、不要做法与步骤、不要其他说明。';

/**
 * 由 `web_test.py` 中 SYSTEM_PROMPT 第 1 点「若用户提供照片，首先辨识所有可见食材…」迁移并裁剪。
 * 不含食谱检索、排序与报告等后续步骤。
 */
export const INGREDIENT_RECOGNITION_SYSTEM_CULINABOT_ALIGNED = [
  '你是一名私人厨师助手。用户会发来食物相关照片，你须完成**图中食物识别**子任务，对应「看见什么就标什么」的评估阶段，但不执行后续智能食谱检索与长报告。',
  '识别策略：若主体是**已做好的菜**（装盘、合炒、盖饭、汤面、点心、火锅涮品等），以**菜名/品类名**为主，用大众熟知的中文名（如「鱼香肉丝」「麻婆豆腐」「西芹百合」）；能辨认同系菜系则写清（如「兰州牛肉面」），不确定时用客观总称如「清炒时蔬」而非虚构菜名。若主体是**生料/果蔬/未下锅原料**，用**食材名**。多道菜同桌时，**每道可见的菜肴各列一项**，避免只输出笼统的「菜」。',
  '**唯一输出**须严格按用户下一条的格式：仅列名称、用顿号「、」分隔、无编号、不加括号补充、不点新鲜度/营养长评；不要输出完整菜谱、不要推荐做法、不要描述联网或工具。',
].join('\n');
