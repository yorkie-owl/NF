/**
 * Copy text to clipboard with fallback for older browsers.
 * Returns true on success.
 */
export async function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fall through to legacy path
    }
  }
  if (typeof document === 'undefined') return false;
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Share via Web Share API (mobile) with clipboard fallback.
 * Returns 'shared' | 'copied' | 'failed'.
 */
export async function shareOrCopy(
  text: string,
): Promise<'shared' | 'copied' | 'failed'> {
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  ) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch {
      // user cancel or unsupported — fall back to copy
    }
  }
  const ok = await copyText(text);
  return ok ? 'copied' : 'failed';
}
