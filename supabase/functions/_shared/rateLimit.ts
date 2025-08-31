import { createClient } from "npm:@supabase/supabase-js@2";
const url = Deno.env.get("SUPABASE_URL")!;
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(url, key, { auth: { persistSession: false } });

export async function checkRateLimit(tenantId: string, bucket: string, limit: number, windowSec: number): Promise<boolean> {
  const now = new Date();
  const since = new Date(now.getTime() - windowSec * 1000).toISOString();
  const { count, error } = await sb.from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("tenant_id", tenantId).eq("bucket", bucket).gte("ts", since);
  if (error) throw error;
  if ((count ?? 0) >= limit) return false;
  await sb.from("rate_limits").insert({ tenant_id: tenantId, bucket, ts: now.toISOString() });
  return true;
}
