# OPERATIONS (Slim Guide)

## Secrets (GitHub → Settings → Secrets → Actions)
- SUPABASE_ACCESS_TOKEN
- SUPABASE_PROJECT_REF
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- STRIPE_SECRET_KEY

## CI Deploy
- Workflow: `.github/workflows/deploy.yml`
- Trigger: workflow_dispatch or push to `main`

## Verify
- `curl https://<REF>.functions.supabase.co/health`
- `curl -X POST .../orchestrate/lead-intake`
- Check Stripe usage
