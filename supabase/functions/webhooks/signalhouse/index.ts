// SignalHouse webhook → queue + dedup + DLQ
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorrelationId, ok, bad } from "../../_shared/http.ts";
import { withLogCtx } from "../../_shared/logger.ts";
import { ensureUniqueEvent } from "../../_shared/dedup.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(url, key, { auth: { persistSession: false } });

serve(async (req: Request) => {
  const correlationId = getCorrelationId(req);
  const log = withLogCtx("webhooks/signalhouse", correlationId);
  const { pathname } = new URL(req.url);
  if (req.method === "GET" && pathname.endsWith("/health")) return new Response("ok", { status: 200 });

  try {
    const tenantId = req.headers.get("x-tenant-id") ?? "public";
    const eventId = req.headers.get("x-idempotency-key") || crypto.randomUUID();
    const unique = await ensureUniqueEvent(tenantId, "signalhouse", eventId);
    if (!unique) {
      log("info", "duplicate_event", { eventId });
      return ok({ deduped: true });
    }

    const payload = await req.json();
    // Basic shape
    const lead = {
      tenant_id: tenantId,
      source: "signalhouse",
      body: payload,
      status: "queued" as const,
    };
    const { error } = await sb.from("queue_leads").insert(lead);
    if (error) throw error;

    log("info", "enqueued_lead", { eventId });
    return ok({ queued: true, eventId });
  } catch (e) {
    // dead-letter on failure
    await sb.from("dead_letters").insert({
      fn: "webhooks/signalhouse",
      payload: await req.text().catch(() => ""),
      error: e?.message ?? String(e),
    });
    return bad("failed", 500);
  }
});
