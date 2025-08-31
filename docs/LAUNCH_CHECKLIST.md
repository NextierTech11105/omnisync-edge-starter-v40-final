# Launch Checklist

## Pre‑flight
- [ ] Run `make magic` end‑to‑end demo
- [ ] All functions return 200 on `/health`
- [ ] `make db-push` applies `upgrade_v40.sql` cleanly
- [ ] Secrets set: SUPABASE_URL, SERVICE_ROLE_KEY, STRIPE_SECRET_KEY

## Release
- [ ] Bump version in README + tag `vX.Y.Z`
- [ ] Push tag → triggers GitHub Actions release workflow
- [ ] Post to: HN, dev.to, Twitter/X, LinkedIn

## Post‑launch
- [ ] Track stars & demo‑to‑trial conversions
- [ ] Gather agency/consultant case studies
