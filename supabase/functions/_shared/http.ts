// Minimal HTTP helpers
export const ok = (data: unknown, headers: HeadersInit = {}) =>
  new Response(JSON.stringify({ ok: true, data }), { status: 200, headers: { "content-type": "application/json", ...headers } });

export const bad = (message: string, status = 400, headers: HeadersInit = {}) =>
  new Response(JSON.stringify({ ok: false, error: message }), { status, headers: { "content-type": "application/json", ...headers } });

export const text = (body = "ok", status = 200) =>
  new Response(body, { status, headers: { "content-type": "text/plain" } });

export const getCorrelationId = (req: Request) => req.headers.get("x-correlation-id") || crypto.randomUUID();

export const parseJson = async <T=unknown>(req: Request): Promise<T> => {
  try { return await req.json() as T; } catch { throw new Error("INVALID_JSON"); }
};
