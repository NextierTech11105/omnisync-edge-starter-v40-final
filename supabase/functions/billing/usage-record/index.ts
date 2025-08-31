import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { getCorrelationId, ok, bad } from "../../_shared/http.ts";
import { withLogCtx } from "../../_shared/logger.ts";
import { withCircuitBreaker } from "../../_shared/circuitBreaker.ts";
import { retry } from "../../_shared/retry.ts";

const STRIPE_KEY = Deno.env.get("STRIPE_SECRET_KEY");

serve(async (req: Request) => {
  const { pathname } = new URL(req.url);
  if (req.method === "GET" && pathname.endsWith("/health")) return new Response("ok", { status: 200 });

  if (!STRIPE_KEY) return bad("missing STRIPE_SECRET_KEY env", 500);
  const correlationId = getCorrelationId(req);
  const log = withLogCtx("billing/usage-record", correlationId);

  try {
    const body = await req.json();
    // expected: { subscription_item: string, quantity: number, timestamp?: number }
    const record = {
      subscription_item: body.subscription_item,
      quantity: body.quantity ?? 1,
      timestamp: body.timestamp ?? Math.floor(Date.now()/1000),
      action: "increment"
    };
    const res = await withCircuitBreaker("stripe", async () => {
      return await retry(async () => {
        const r = await fetch("https://api.stripe.com/v1/subscription_items/"+encodeURIComponent(record.subscription_item)+"/usage_records", {
          method: "POST",
          headers: {
            "Authorization": "Bearer " + STRIPE_KEY,
            "Content-Type": "application/x-www-form-urlencoded"
          },
          body: new URLSearchParams({ quantity: String(record.quantity), timestamp: String(record.timestamp), action: "increment" })
        });
        if (!r.ok) {
          const text = await r.text();
          throw new Error("stripe_error_" + r.status + ":" + text);
        }
        return await r.json();
      }, 5, 100, 2);
    }, { failureThreshold: 4, cooldownSeconds: 60 });
    log("info", "usage_recorded", { subscription_item: record.subscription_item });
    return ok({ stripe: res });
  } catch (e) {
    log("error", "usage_record_failed", { err: String(e) });
    return bad("failed", 500);
  }
});
