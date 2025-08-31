# API (v1)

**Base:** `https://<PROJECT_REF>.functions.supabase.co`

## Health
GET /health → `{ ok: true }`

## Lead Intake
POST /orchestrate/lead-intake
Headers: X-Api-Key, content-type: application/json
Body: `{ name, phone, email?, address?, customer_id }`
Returns 202 with `job_id`, `correlation_id`

## RL Choose
POST /rl/choose-action → `{ action, correlation_id }`

## RL Report
POST /rl/report-outcome → `{ ok: true }`

## Usage
GET /usage?period=current (X-Api-Key)
