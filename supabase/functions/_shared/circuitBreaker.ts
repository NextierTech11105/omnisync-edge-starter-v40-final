// Circuit breaker using Postgres-backed state (stateless functions)
import { createClient } from "npm:@supabase/supabase-js@2";
const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(url, key, { auth: { persistSession: false } });

export interface CBOptions {
  failureThreshold?: number; // open after this many consecutive failures
  cooldownSeconds?: number;  // how long to stay open
  halfOpenMax?: number;      // allow N trial calls when half-open
}

const defaults: Required<CBOptions> = { failureThreshold: 5, cooldownSeconds: 60, halfOpenMax: 3 };

export async function withCircuitBreaker<T>(service: string, fn: () => Promise<T>, opts: CBOptions = {}): Promise<T> {
  const o = { ...defaults, ...opts };
  // fetch state
  const { data, error } = await sb.from("circuit_breakers").select("*").eq("service", service).single();
  const now = new Date();
  const state = data ?? { service, state: "closed", failure_count: 0, last_failure_at: null, cooldown_seconds: o.cooldownSeconds, half_open_count: 0 };
  if (state.state === "open") {
    const last = state.last_failure_at ? new Date(state.last_failure_at) : new Date(0);
    const until = new Date(last.getTime() + (state.cooldown_seconds ?? o.cooldownSeconds) * 1000);
    if (now < until) throw new Error("CIRCUIT_OPEN");
    // move to half-open
    await sb.from("circuit_breakers").upsert({ service, state: "half_open", half_open_count: 0, cooldown_seconds: o.cooldownSeconds });
  }
  if (state.state === "half_open" && state.half_open_count >= o.halfOpenMax) {
    throw new Error("CIRCUIT_HALF_OPEN_EXHAUSTED");
  }
  try {
    if (state.state === "half_open") await sb.from("circuit_breakers").update({ half_open_count: (state.half_open_count ?? 0) + 1 }).eq("service", service);
    const res = await fn();
    // on success, close & reset
    await sb.from("circuit_breakers").upsert({ service, state: "closed", failure_count: 0, half_open_count: 0, last_failure_at: null, cooldown_seconds: o.cooldownSeconds });
    return res;
  } catch (e) {
    const failure_count = (state.failure_count ?? 0) + 1;
    const newState = failure_count >= o.failureThreshold ? "open" : state.state === "half_open" ? "open" : "closed";
    await sb.from("circuit_breakers").upsert({ service, state: newState, failure_count, last_failure_at: new Date().toISOString(), cooldown_seconds: o.cooldownSeconds });
    throw e;
  }
}
