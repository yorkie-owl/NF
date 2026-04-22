/** 与 §7.1 及 IngredientsService 中 RecognizedItem 同构 */
export type ParsedRecognizedItem = {
  name: string;
  confidence: number;
  tasteTags: string[];
};

const MAX_ITEMS = 30;

function normalizeName(s: string): string {
  return s
    .replace(/^\d+[\s.、.)）]\s*/, '')
    .replace(/[*_`#【】\[\]()（）]/g, '')
    .trim();
}

function isPlausibleIngredientName(name: string): boolean {
  if (name.length < 1 || name.length > 40) return false;
  if (/^[，。、\s\-—－~～…·]+$/.test(name)) return false;
  return true;
}

/**
 * 从 CulinaBot `/api/test` 返回的长文本中尽量恢复 §7.1 的 `recognized` 列表。
 * 优先解析 JSON；否则按顿号/逗号/换行拆分食材名。
 */
export function parseCulinaBotAnswerToRecognized(answer: string): ParsedRecognizedItem[] {
  const raw = answer.trim();
  if (!raw) return [];

  const fromJson = tryParseJsonRecognized(raw);
  if (fromJson.length > 0) return fromJson.slice(0, MAX_ITEMS);

  const fromBlock = tryParseCodeBlockJson(raw);
  if (fromBlock.length > 0) return fromBlock.slice(0, MAX_ITEMS);

  return splitHeuristicRecognized(raw).slice(0, MAX_ITEMS);
}

function tryParseJsonRecognized(text: string): ParsedRecognizedItem[] {
  for (const candidate of [text, extractBalancedObject(text)]) {
    if (!candidate) continue;
    try {
      const o: unknown = JSON.parse(candidate);
      if (Array.isArray(o)) {
        const fromArr = extractRecognizedArray({ recognized: o });
        if (fromArr.length) return fromArr;
      }
      const list = extractRecognizedArray(o);
      if (list.length) return list;
    } catch {
      /* 非 JSON */
    }
  }
  return [];
}

function extractBalancedObject(text: string): string | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

function extractRecognizedArray(o: unknown): ParsedRecognizedItem[] {
  if (!o || typeof o !== 'object') return [];
  const rec = (o as { recognized?: unknown }).recognized;
  if (!Array.isArray(rec)) return [];
  const out: ParsedRecognizedItem[] = [];
  for (const item of rec) {
    if (typeof item === 'string') {
      const name = item.trim();
      if (name) out.push({ name, confidence: 0.8, tasteTags: [] });
      continue;
    }
    if (!item || typeof item !== 'object') continue;
    const x = item as Record<string, unknown>;
    const name = typeof x.name === 'string' ? x.name.trim() : '';
    if (!name) continue;
    const confidence =
      typeof x.confidence === 'number' && x.confidence >= 0 && x.confidence <= 1
        ? x.confidence
        : 0.85;
    const tasteTags = Array.isArray(x.tasteTags)
      ? x.tasteTags.filter((t): t is string => typeof t === 'string')
      : [];
    out.push({ name, confidence, tasteTags });
  }
  return out;
}

function tryParseCodeBlockJson(text: string): ParsedRecognizedItem[] {
  const re = /```(?:json)?\s*([\s\S]*?)```/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const inner = m[1]?.trim();
    if (!inner) continue;
    const list = tryParseJsonRecognized(inner);
    if (list.length) return list;
  }
  return [];
}

function splitHeuristicRecognized(text: string): ParsedRecognizedItem[] {
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/^[#>\s]*/, '').replace(/「|」|"|"/g, ''))
    .join('\n');

  const segments = cleaned
    .split(/[、，,;；|｜/\n]+/)
    .map(normalizeName)
    .filter(isPlausibleIngredientName);

  const seen = new Set<string>();
  const out: ParsedRecognizedItem[] = [];
  for (const name of segments) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ name, confidence: 0.82, tasteTags: [] });
  }
  return out;
}
