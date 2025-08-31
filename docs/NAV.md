# Documentation Navigation

Use this as a quick "table of contents" for the repo and business playbook.

## Core
- `README.md` — Tech + Business overview
- `docs/WHITE_LABEL_SELF_HOSTING.md` — Full revenue playbook
- `docs/WEBHOOKS.md` — Non‑technical webhook configuration
- `docs/API.md` — API endpoints + Postman/VS Code collections
- `docs/OPERATIONS.md` — CI/CD, secrets, environments
- `docs/ARCHITECTURE+SECURITY.md` — roles, RLS, key handling
- `docs/SALES_SHEET.md` — Prospect‑facing 1‑pager
- `docs/images/*` — All visuals used in the docs/README

## Deploy Flow
1. Fork/Clone → add secrets (see OPERATIONS.md)
2. Run `./install.sh` or GitHub Actions Deploy
3. Verify Stripe metering with `/docs/API.md` "magic test"

## Business Flow (Client Lifecycle)
1. Baseline Usage (3 mo @ $5K/mo) → $15K
2. Implementation + Transfer (self‑hosting) → $15K–25K
3. Orchestration API Forever → $1K–2K/mo (~$18K/yr)

## Optional App Pages (if you’re pairing this with a Lovable front‑end)
- White Label Revenue Dashboard: `/white-label-revenue`
- Master Connector (webhooks): `/master-connector`
- Workflow Studio: `/workflow-studio`
- Business/Operations Hubs, Command Centers, AI SDR, etc.

> These routes are references only; implement in your FE app as needed.
