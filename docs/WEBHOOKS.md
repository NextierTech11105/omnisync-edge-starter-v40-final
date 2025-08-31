# Webhook Configuration (Non‑Technical)

Pick a destination and paste your URL. We handle signatures, retries, and analytics.

## Popular Templates
- **Slack** — paste your Incoming Webhook URL (e.g., https://hooks.slack.com/services/T...)
- **Microsoft Teams** — paste your Channel Webhook URL
- **Discord** — paste your webhook URL
- **Zapier** — use Zapier Catch Hook URL
- **Make.com** — use custom webhook URL
- **Custom HTTP** — any HTTPS endpoint

## Events (checkboxes in UI)
- `lead.created`
- `lead.updated`
- `orchestration.action_chosen`
- `orchestration.outcome_reported`
- `job.retry`
- `billing.usage_reported`

## Test Button
Click **Test** to send a sample payload and verify 200 OK.

## Rotation & Failover
We auto-disable endpoints with repeated failures and queue payloads for retry via `cron/retry-deadletters`.
