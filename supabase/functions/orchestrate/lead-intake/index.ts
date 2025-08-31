import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getCorrelationId, ok, bad } from "../../_shared/http.ts";
import { withLogCtx } from "../../_shared/logger.ts";

const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(url, key, { auth: { persistSession: false } });

type LeadInput = {
  tenant_id?: string;
  contact: { name?: string; phone?: string; email?: string };
  tags?: string[];
  metadata?: Record<string, unknown>;
};

function validate(input: unknown): asserts input is LeadInput {
  const o = input as any;
  if (!o || typeof o !== "object") throw new Error("INVALID_BODY");
  if (!o.contact || typeof o.contact !== "object") throw new Error("INVALID_CONTACT");
  if (!o.contact.phone && !o.contact.email) throw new Error("MISSING_CONTACT_CHANNEL");
}

serve(async (req: Request) => {
  const { pathname } = new URL(req.url);
  if (req.method === "GET" && pathname.endsWith("/health")) return new Response("ok", { status: 200 });

  const correlationId = getCorrelationId(req);
  const log = withLogCtx("orchestrate/lead-intake", correlationId);
  try {
    const body = await req.json().catch(() => ({}));
    validate(body);
    const tenant_id = body.tenant_id || "public";
    const { error } = await sb.from("leads").insert({
      tenant_id,
      contact: body.contact,
      tags: body.tags ?? [],
      metadata: body.metadata ?? {},
      status: "received",
    });
    if (error) throw error;
    // enqueue work item
    await sb.from("queue_leads").insert({ tenant_id, source: "api", body, status: "queued" });
    log("info", "lead_received", { tenant_id });
    return ok({ accepted: true, correlationId });
  } catch (e) {
    log("error", "lead_intake_failed", { err: String(e) });
    return bad(String(e), 400);
  }
});
