# ADR-0001: Resilient Event-Driven Architecture on Supabase Edge

- Use Postgres-backed idempotency keys for dedup
- Use Postgres-backed circuit breakers to protect external calls
- Queue pattern: `queue_leads` → `workers/process-lead` batch processing
- Dead-letter table with cron retry function
- Health endpoints exposed per function
- Structured logs with correlation IDs
