import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { ok } from "../../_shared/http.ts";
serve((req) => {
  const { pathname } = new URL(req.url);
  if (req.method === "GET" && pathname.endsWith("/health")) return new Response("ok", { status: 200 });
  // deterministic placeholder: pick SMS then call
  return ok({ action: "sms_then_call", weight: 0.7 });
});
