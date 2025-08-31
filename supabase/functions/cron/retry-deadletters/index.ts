import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { ok, bad } from "../../_shared/http.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(url, key, { auth: { persistSession: false } });

serve(async (req: Request) => {
  const { pathname } = new URL(req.url);
  if (req.method === "GET" && pathname.endsWith("/health")) return new Response("ok", { status: 200 });
  try {
    const { data, error } = await sb.from("dead_letters").select("*").lte("retry_count", 5).order("created_at", { ascending: true }).limit(50);
    if (error) throw error;
    let retried = 0;
    for (const dl of data ?? []) {
      retried++;
      // naive retry: re-enqueue leads if applicable
      try {
        if (dl.fn === "webhooks/signalhouse") {
          await sb.from("queue_leads").insert({ tenant_id: "public", source: "signalhouse-dlq", body: dl.payload, status: "queued" });
        }
        await sb.from("dead_letters").update({ retry_count: (dl.retry_count ?? 0) + 1, last_retry_at: new Date().toISOString() }).eq("id", dl.id);
      } catch {
        await sb.from("dead_letters").update({ retry_count: (dl.retry_count ?? 0) + 1, last_retry_at: new Date().toISOString() }).eq("id", dl.id);
      }
    }
    return ok({ retried });
  } catch (e) {
    return bad(String(e), 500);
  }
});
