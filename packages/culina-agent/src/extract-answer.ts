import { type BaseMessage, isAIMessage } from '@langchain/core/messages';

/**
 * 对齐 `web_test.py` 的 `extract_answer`：从 agent 终态的 messages 中取最后一条有效 AI 文本。
 */
export function extractAnswerFromAgentOutput(response: { messages?: BaseMessage[] } | null | undefined): string {
  const messages = response?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return String(response ?? '');
  }
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]!;
    if (!isAIMessage(m)) {
      continue;
    }
    const content = m.content;
    if (typeof content === 'string' && content.trim()) {
      return content;
    }
    if (Array.isArray(content)) {
      const textParts = content
        .filter(
          (p: unknown) =>
            p != null && typeof p === 'object' && (p as { type?: string }).type === 'text',
        )
        .map((p) => (p as { text?: string }).text ?? '');
      if (textParts.length > 0) {
        return textParts.join('\n');
      }
    }
  }
  return String(response);
}
