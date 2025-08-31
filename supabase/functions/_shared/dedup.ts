// Event idempotency / dedup via Postgres unique constraint
import { createClient } from "npm:@supabase/supabase-js@2";
const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(url, key, { auth: { persistSession: false } });

export async function ensureUniqueEvent(tenantId: string, provider: string, externalId: string) {
  const { error } = await sb.from("idempotency_keys").insert({ tenant_id: tenantId, provider, external_id: externalId });
  if (error) {
    if (error.code === "23505") return false; // duplicate
    throw error;
  }
  return true;
}
