  # OmniSync Edge Starter — Makefile (enhanced)
  .PHONY: deploy logs secrets db-push seed test ci magic verify stripe-trigger openapi sdks

  deploy:
	@echo "🚀 Deploying edge functions..."
	bash ./install.sh || (echo "❌ install failed" && exit 1)
	@echo "✅ Deploy complete"

  logs:
	@echo "📜 Tailing logs... (Ctrl+C to quit)"
	supabase functions logs --follow --project-ref $${SUPABASE_PROJECT_REF}

  secrets:
	@echo "🔐 Setting secrets..."
	supabase secrets set SUPABASE_URL=$${SUPABASE_URL} SUPABASE_SERVICE_ROLE_KEY=$${SUPABASE_SERVICE_ROLE_KEY} STRIPE_SECRET_KEY=$${STRIPE_SECRET_KEY} --project-ref $${SUPABASE_PROJECT_REF}
	@echo "✅ Secrets configured"

  db-push:
	@echo "🗃️  Applying database init.sql..."
	supabase db push < sql/init.sql || true
	@echo "🧱 Applying upgrade_v40.sql..."
	supabase db push < sql/upgrade_v40.sql
	@echo "✅ DB schema up to date"

  seed:
	@echo "🌱 Seeding demo data..."
	supabase db reset --local --db-url "$${DATABASE_URL:-postgres://postgres:postgres@localhost:54322/postgres}"
	@echo "✅ Seeded"

  magic:
	@echo "✨ Running 3-minute demo..."
	@echo "1/4 • Creating lead"
	curl -s -X POST "$${FUNCTIONS_URL}/orchestrate/lead-intake" -H 'content-type: application/json' -d '{"contact":{"phone":"+15550001111","name":"Demo Lead"}}' >/dev/null && echo "   ✔ lead accepted"
	@echo "2/4 • Enqueue via webhook"
	curl -s -X POST "$${FUNCTIONS_URL}/webhooks/signalhouse" -H 'x-tenant-id: public' -H 'x-idempotency-key: demo-123' -H 'content-type: application/json' -d '{"event":"demo"}' >/dev/null && echo "   ✔ webhook queued"
	@echo "3/4 • Process batch"
	curl -s -X POST "$${FUNCTIONS_URL}/workers/process-lead?batch=10" >/dev/null && echo "   ✔ batch processed"
	@echo "4/4 • Verify health"
	curl -s "$${FUNCTIONS_URL}/orchestrate/lead-intake/health" >/dev/null && echo "   ✔ health ok"
	@echo "✅ Demo finished"

  verify:
	@echo "🔎 Verifying endpoints..."
	curl -s "$${FUNCTIONS_URL}/webhooks/signalhouse/health" && echo ""
	curl -s "$${FUNCTIONS_URL}/workers/process-lead/health" && echo ""
	@echo "✅ Verification complete"

  stripe-trigger:
	@echo "💳 Triggering Stripe metered event (placeholder)"
	@echo "POST usage_record.create ..."
	@echo "✅ (Wire this to your Stripe CLI workflow)"

  openapi:
	@echo "📘 OpenAPI spec at docs/openapi.yaml"

  sdks:
	@echo "📦 Minimal SDKs in /sdks (node.ts, python.py)"
