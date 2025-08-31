# Runbook

## Health Checks
- `GET {FUNCTIONS_URL}/orchestrate/lead-intake/health`
- `GET {FUNCTIONS_URL}/webhooks/signalhouse/health`
- `GET {FUNCTIONS_URL}/workers/process-lead/health`

## Common Issues
- **CIRCUIT_OPEN**: External dependency down; see `circuit_breakers` table.
- **Duplicate events**: Check `idempotency_keys` for provider/external_id.
- **Queue stuck**: Inspect `queue_leads` statuses; re-run `cron/retry-deadletters`.
