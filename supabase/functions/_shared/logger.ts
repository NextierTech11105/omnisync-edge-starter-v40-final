// Structured logger with correlation IDs
export type LogLevel = "debug" | "info" | "warn" | "error";
export interface LogContext {
  correlationId?: string;
  tenantId?: string;
  fn?: string;
}
const base = () => ({ ts: new Date().toISOString() });

export const log = (level: LogLevel, msg: string, ctx: LogContext = {}, meta: Record<string, unknown> = {}) => {
  const rec = { level, msg, ...base(), ...ctx, ...meta };
  // Deno deploy captures console.*; Supabase forwards to logs
  if (level === "error") console.error(JSON.stringify(rec));
  else if (level === "warn") console.warn(JSON.stringify(rec));
  else console.log(JSON.stringify(rec));
};

export const withLogCtx = (fn: string, correlationId?: string, tenantId?: string) => (level: LogLevel, msg: string, meta: Record<string, unknown> = {}) =>
  log(level, msg, { fn, correlationId, tenantId }, meta);
