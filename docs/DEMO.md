# 3‑Minute Demo Guide

1. Export env:
```bash
export SUPABASE_PROJECT_REF=xxxxxx
export SUPABASE_URL=https://xxxxx.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...
export FUNCTIONS_URL=https://xxxxx.functions.supabase.co/functions/v1
export STRIPE_SECRET_KEY=sk_live_or_test
```

2. Initialize DB:
```bash
make db-push
```

3. Run the one‑liner:
```bash
make magic
```

This performs:
- Lead intake (`/orchestrate/lead-intake`)
- Webhook enqueue (`/webhooks/signalhouse`)
- Batch processing (`/workers/process-lead`)
- Health verification

4. Inspect logs:
```bash
make logs
```

5. Record Stripe usage (optional):
```bash
curl -X POST "$FUNCTIONS_URL/billing/usage-record"   -H 'content-type: application/json'   -d '{"subscription_item":"si_123","quantity":1}'
```
