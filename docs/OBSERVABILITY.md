# Monitoring & Observability

## Structured Logs
- All functions log JSON with fields: `ts, level, msg, fn, correlationId, tenantId`.
- Correlate requests by providing `x-correlation-id` header.

## Health
- GET `/<fn>/health` on every function.

## Business Metrics (SQL)
```sql
select date_trunc('day', created_at) d, count(*) leads from leads group by 1 order by 1 desc;
select * from metrics_daily order by d desc limit 7;
```

## Alerts
- Wire GitHub Actions + Slack for failures on `gitleaks.yml`, `tests.yml`.
- Add Postgres NOTIFY/LISTEN for DLQ insertions to post to Slack webhook.
