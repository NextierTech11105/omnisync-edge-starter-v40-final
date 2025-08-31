# ARCHITECTURE + SECURITY

```
Terminals → Edge Gateway → Orchestrator (rules + RL + meter) → Queue → Workers → Stripe Usage
                         ↘ Postgres (RLS) + Logs/Tracing
```

## Targets
- Edge p95 < 150ms; Worker success > 99%

## Security Checklist
- RLS on tenant tables
- API keys hashed + scoped
- Service Role key only in server/CI
- Webhooks HMAC/JWT verification
- Rate limits per tenant/key
