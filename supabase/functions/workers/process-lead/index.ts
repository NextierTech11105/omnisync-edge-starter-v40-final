import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorrelationId, ok, bad } from "../../_shared/http.ts";
import { withLogCtx } from "../../_shared/logger.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(url, key, { auth: { persistSession: false } });

serve(async (req: Request) => {
  const { pathname, searchParams } = new URL(req.url);
  if (req.method === "GET" && pathname.endsWith("/health")) return new Response("ok", { status: 200 });

  const correlationId = getCorrelationId(req);
  const log = withLogCtx("workers/process-lead", correlationId);
  try {
    const batchSize = Number(searchParams.get("batch") ?? "25");
    // fetch a batch of queued items
    const { data: items, error } = await sb.from("queue_leads").select("*").eq("status", "queued").order("created_at", { ascending: true }).limit(batchSize);
    if (error) throw error;
    if (!items || items.length === 0) return ok({ processed: 0 });

    let processed = 0;
    for (const it of items) {
      // mark in-progress
      await sb.from("queue_leads").update({ status: "processing", started_at: new Date().toISOString() }).eq("id", it.id);
      try {
        // TODO: add your enrichment / scoring / routing
        await sb.from("leads").update({ status: "processed" }).eq("tenant_id", it.tenant_id).order("created_at", { ascending: false }).limit(1);
        // mark done
        await sb.from("queue_leads").update({ status: "done", finished_at: new Date().toISOString() }).eq("id", it.id);
        processed++;
      } catch (inner) {
        await sb.from("queue_leads").update({ status: "failed", error: String(inner) }).eq("id", it.id);
        await sb.from("dead_letters").insert({ fn: "workers/process-lead", payload: it, error: String(inner) });
      }
    }
    log("info", "batch_processed", { processed });
    return ok({ processed });
  } catch (e) {
    return bad(String(e), 500);
  }
});
