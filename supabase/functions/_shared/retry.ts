// Exponential backoff retry utility
export async function retry<T>(fn: () => Promise<T>, attempts = 5, baseMs = 100, factor = 2): Promise<T> {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (err) {
      lastErr = err;
      const delay = baseMs * Math.pow(factor, i);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastErr;
}
