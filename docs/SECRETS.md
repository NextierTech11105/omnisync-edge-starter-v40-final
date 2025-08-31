# Secrets & Environment Variables

| Key | Where it comes from | What it does |
|---|---|---|
| `SUPABASE_URL` | Supabase → Project settings | Base URL for your Supabase project |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project settings | Full-access service role (store in **GitHub Secrets**, never commit) |
| `SERVICE_API_KEY` | You generate | Bearer token for your public API calls / smoke tests |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → Developers | Server-side Stripe API key (sk_...) |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI / Dashboard | Verifies incoming webhooks (whsec_...) |
| `STRIPE_METERED_PRICE_ID` | Stripe Dashboard → Products | Metered price to attach to subscriptions (price_...) |
| `STRIPE_SUBSCRIPTION_ITEM_ID` | Stripe Dashboard → Customer → Subscription | The subscription item you log usage against (si_...) |

> Add these in **GitHub → Settings → Secrets and variables → Actions** for CI.
