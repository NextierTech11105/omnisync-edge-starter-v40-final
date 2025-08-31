# 🧭 OPS README (Short)

See full guide in repository root or product docs.

## One-click deploy (CI)
- Add GitHub Secrets: SUPABASE_ACCESS_TOKEN, SUPABASE_PROJECT_REF, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY
- Trigger **Actions → Deploy Supabase Edge**

## Local (optional)
```bash
export SUPABASE_ACCESS_TOKEN=...
export SUPABASE_PROJECT_REF=...
export SUPABASE_URL=...
export SUPABASE_SERVICE_ROLE_KEY=...
export STRIPE_SECRET_KEY=...
./install.sh
```

## Verify
- Health: `GET /health`
- Magic Test: `POST /orchestrate/lead-intake`
- Stripe Usage increments
