# 🚀 Supabase Developer Guide

A comprehensive guide to the OmniSync Edge Starter's Supabase architecture, setup, and development workflow.

## 📋 Table of Contents

1. [Repository Overview](#repository-overview)
2. [Directory Map](#directory-map)
3. [Architecture Explained](#architecture-explained)
4. [Developer Onboarding](#developer-onboarding)
5. [CLI Commands & Code Snippets](#cli-commands--code-snippets)
6. [FAQ](#faq)

---

## Repository Overview

OmniSync Edge Starter is a **Supabase Edge Functions** project that provides multi-tenant orchestration, webhook processing, and metered billing infrastructure. Built on PostgreSQL with Row Level Security (RLS), TypeScript Edge Functions, and Stripe integration.

### Key Features
- **Edge-native HTTP endpoints** for intake, rate limiting, and usage tracking
- **Multi-tenant isolation** with RLS and per-tenant API keys
- **Usage metering** that flows directly to Stripe invoices
- **Reinforcement Learning bandit** for optimization (Thompson sampling)
- **One-click deployment** via GitHub Actions

### Tech Stack
- **Database**: Supabase PostgreSQL with RLS
- **Runtime**: Supabase Edge Functions (Deno/TypeScript)
- **Deployment**: GitHub Actions + Supabase CLI
- **Billing**: Stripe metered pricing
- **Monitoring**: Native Supabase logging + observability

---

## Directory Map

```
omnisync-edge-starter-v40-final/
├── 📁 _docs/                          # Extended documentation
│   └── supabase-guide.md             # This guide
├── 📁 docs/                           # Core documentation
│   ├── OPERATIONS.md                  # CI/CD & secrets setup
│   ├── DEMO.md                        # 3-minute demo guide
│   ├── ARCHITECTURE+SECURITY.md       # System design & security
│   ├── SECRETS.md                     # Environment variables reference
│   ├── API.md                         # Endpoint documentation
│   └── ...                           # Additional guides
├── 📁 supabase/                       # Supabase project configuration
│   └── 📁 functions/                  # Edge Functions source code
│       ├── 📁 _shared/                # Shared utilities & middleware
│       │   ├── circuitBreaker.ts      # Circuit breaker pattern
│       │   ├── dedup.ts               # Request deduplication
│       │   ├── health.ts              # Health check utilities
│       │   ├── http.ts                # HTTP helpers & middleware
│       │   ├── logger.ts              # Structured logging
│       │   ├── rateLimit.ts           # Rate limiting logic
│       │   └── retry.ts               # Retry mechanisms
│       ├── 📁 billing/                # Stripe integration functions
│       ├── 📁 cron/                   # Scheduled/background jobs
│       ├── 📁 orchestrate/            # Main orchestration logic
│       │   └── 📁 lead-intake/        # Lead processing endpoint
│       ├── 📁 rl/                     # Reinforcement learning bandit
│       ├── 📁 webhooks/               # Webhook handlers
│       └── 📁 workers/                # Background processing workers
├── 📁 sql/                            # Database schema & migrations
│   ├── init.sql                       # Initial schema setup
│   └── upgrade_v40.sql                # Version 4.0 schema updates
├── 📁 .github/workflows/              # CI/CD automation
│   └── ci.yml                         # GitHub Actions deployment
├── Makefile                           # Development commands
├── package.json                       # Node.js dependencies
└── README.md                          # Project overview
```

### Function Directory Breakdown

#### `supabase/functions/_shared/`
**Shared utilities used across all functions:**
- `circuitBreaker.ts` - Prevents cascade failures by breaking unhealthy service calls
- `dedup.ts` - Ensures idempotent request processing using keys
- `health.ts` - Standardized health check endpoints for all functions
- `http.ts` - HTTP utilities, CORS handling, request/response helpers
- `logger.ts` - Structured logging with tenant context and request IDs
- `rateLimit.ts` - Per-tenant rate limiting with configurable windows
- `retry.ts` - Exponential backoff retry logic for external service calls

#### `supabase/functions/orchestrate/lead-intake/`
**Primary ingestion endpoint:**
- Validates and processes incoming leads
- Applies tenant-specific rules and rate limits
- Triggers downstream webhooks and workers
- Records usage metrics for billing

#### `supabase/functions/webhooks/`
**Webhook processing infrastructure:**
- Receives webhooks from external systems
- Validates signatures (HMAC/JWT)
- Queues events for asynchronous processing
- Provides idempotency guarantees

#### `supabase/functions/workers/`
**Background processing:**
- Batch processing of queued events
- Heavy computational tasks
- External API integrations
- Cleanup and maintenance jobs

#### `supabase/functions/billing/`
**Stripe integration:**
- Usage record creation
- Subscription management
- Invoice webhooks
- Metered billing automation

---

## Architecture Explained

### Data Flow
```
External System → Edge Gateway → Orchestrator → Queue → Worker → Stripe
                              ↘ PostgreSQL (RLS) + Logs
```

### Multi-Tenancy
- **Database Level**: Row Level Security (RLS) policies isolate tenant data
- **API Level**: Tenant-scoped API keys with configurable permissions
- **Function Level**: Tenant context propagated through request headers

### Security Model
- **API Keys**: Hashed and scoped per tenant with granular permissions
- **Service Role**: Full database access, stored only in CI/CD secrets
- **RLS Policies**: Automatic tenant isolation at the database layer
- **Webhook Verification**: HMAC signatures or JWT validation
- **Rate Limiting**: Per-tenant quotas with sliding windows

### Performance Targets
- **Edge Functions**: p95 latency < 150ms
- **Worker Success Rate**: > 99%
- **Database Queries**: Optimized with proper indexing
- **Circuit Breakers**: Prevent cascade failures

---

## Developer Onboarding

### Prerequisites
- GitHub account with repository access
- Supabase account (free tier sufficient for development)
- Stripe account (test mode for development)
- Node.js 18+ and `make` utility

### 🚀 Quick Start (5 minutes)

#### 1. Fork & Clone
```bash
gh repo fork NextierTech11105/omnisync-edge-starter-v40-final
git clone https://github.com/YOUR_USERNAME/omnisync-edge-starter-v40-final
cd omnisync-edge-starter-v40-final
```

#### 2. Set Up Supabase Project
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Create new project (or use existing)
supabase projects create omnisync-edge-dev

# Get your project details
supabase projects list
```

#### 3. Configure Environment Variables
Create a `.env` file (don't commit this!):
```bash
# From Supabase Dashboard → Project Settings
export SUPABASE_PROJECT_REF=your_project_ref
export SUPABASE_URL=https://your_project_ref.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJ...your_service_role_key

# Constructed URLs
export FUNCTIONS_URL=https://${SUPABASE_PROJECT_REF}.functions.supabase.co/functions/v1

# From Stripe Dashboard → Developers → API Keys
export STRIPE_SECRET_KEY=sk_test_...your_stripe_test_key
```

#### 4. Initialize Database Schema
```bash
# Load environment variables
source .env

# Apply database schema
make db-push
```

#### 5. Deploy Functions
```bash
# Set secrets in Supabase
make secrets

# Deploy all edge functions using Supabase CLI directly
supabase functions deploy --project-ref $SUPABASE_PROJECT_REF
```

#### 6. Verify Installation
```bash
# Run the magic demo (end-to-end test)
make magic

# Check function health
make verify

# View logs
make logs
```

### 🔧 Development Workflow

#### Local Development
```bash
# Start local Supabase instance
supabase start

# Deploy functions locally
supabase functions deploy --local

# Test endpoints locally
curl http://localhost:54321/functions/v1/orchestrate/lead-intake/health
```

#### Function Development
```bash
# Create new function
supabase functions new my-new-function

# Edit function code
# vim supabase/functions/my-new-function/index.ts

# Deploy single function
supabase functions deploy my-new-function --project-ref $SUPABASE_PROJECT_REF
```

#### Database Changes
```bash
# Generate migration
supabase db diff --use-migra -f new_migration

# Apply migration
supabase db push
```

---

## CLI Commands & Code Snippets

### Essential Make Commands

#### Deployment & Management
```bash
# Deploy all functions using Supabase CLI
supabase functions deploy --project-ref $SUPABASE_PROJECT_REF

# Or deploy specific functions individually
supabase functions deploy orchestrate/lead-intake --project-ref $SUPABASE_PROJECT_REF
supabase functions deploy webhooks/signalhouse --project-ref $SUPABASE_PROJECT_REF
```

# Set all required secrets
make secrets

# Initialize/update database schema
make db-push

# Seed database with demo data
make seed
```

#### Testing & Verification
```bash
# Run complete end-to-end demo
make magic

# Verify all endpoints are healthy
make verify

# Stream function logs
make logs

# Trigger Stripe usage recording
make stripe-trigger
```

### Supabase CLI Commands

#### Project Management
```bash
# List all projects
supabase projects list

# Create new project
supabase projects create my-project-name

# Link local development to project
supabase link --project-ref your_project_ref
```

#### Function Development
```bash
# List all functions
supabase functions list

# Deploy specific function
supabase functions deploy function-name --project-ref $SUPABASE_PROJECT_REF

# Delete function
supabase functions delete function-name --project-ref $SUPABASE_PROJECT_REF

# View function logs
supabase functions logs --follow --project-ref $SUPABASE_PROJECT_REF
```

#### Database Operations
```bash
# View database schema
supabase db describe

# Generate TypeScript types
supabase gen types typescript --linked

# Reset local database
supabase db reset

# Create migration from changes
supabase db diff --use-migra -f migration_name
```

#### Secret Management
```bash
# Set multiple secrets at once
supabase secrets set \
  SUPABASE_URL=$SUPABASE_URL \
  SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY \
  STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY \
  --project-ref $SUPABASE_PROJECT_REF

# List all secrets
supabase secrets list --project-ref $SUPABASE_PROJECT_REF

# Remove secret
supabase secrets unset SECRET_NAME --project-ref $SUPABASE_PROJECT_REF
```

### API Testing Examples

#### Health Checks
```bash
# Check orchestrator health
curl -s "$FUNCTIONS_URL/orchestrate/lead-intake/health"

# Check webhook handler health
curl -s "$FUNCTIONS_URL/webhooks/signalhouse/health"

# Check worker health
curl -s "$FUNCTIONS_URL/workers/process-lead/health"
```

#### Lead Processing
```bash
# Submit a test lead
curl -X POST "$FUNCTIONS_URL/orchestrate/lead-intake" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your_api_key' \
  -d '{
    "contact": {
      "phone": "+15550001111",
      "name": "Test Lead",
      "email": "test@example.com"
    },
    "source": "demo",
    "campaign": "test-campaign"
  }'
```

#### Webhook Simulation
```bash
# Trigger webhook processing
curl -X POST "$FUNCTIONS_URL/webhooks/signalhouse" \
  -H 'Content-Type: application/json' \
  -H 'X-Tenant-ID: public' \
  -H 'X-Idempotency-Key: demo-123' \
  -d '{
    "event": "lead.created",
    "data": {
      "lead_id": "123",
      "phone": "+15550001111"
    }
  }'
```

#### Usage Recording
```bash
# Record Stripe usage
curl -X POST "$FUNCTIONS_URL/billing/usage-record" \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer your_service_key' \
  -d '{
    "subscription_item": "si_1234567890",
    "quantity": 1,
    "timestamp": 1640995200
  }'
```

### GitHub Actions Setup

#### Required Secrets
Add these in **GitHub → Settings → Secrets and Variables → Actions**:

```bash
SUPABASE_ACCESS_TOKEN     # From Supabase Dashboard → Account → Access Tokens
SUPABASE_PROJECT_REF      # Your project reference ID
SUPABASE_URL              # https://yourprojectref.supabase.co
SUPABASE_SERVICE_ROLE_KEY # Service role key (full permissions)
STRIPE_SECRET_KEY         # Stripe API secret key
```

#### Manual Deployment Trigger
```bash
# Deploy functions manually via Supabase CLI
supabase functions deploy --project-ref $SUPABASE_PROJECT_REF

# Or trigger CI workflow via GitHub CLI
gh workflow run ci.yml
```

---

## FAQ

### General Questions

**Q: What is Supabase Edge Functions?**
A: Edge Functions are serverless TypeScript functions that run on Deno at the edge, closer to your users. They're ideal for API endpoints, webhooks, and real-time processing.

**Q: How does multi-tenancy work?**
A: Each tenant gets isolated data through PostgreSQL Row Level Security (RLS) policies, plus scoped API keys for access control. All database queries automatically filter by tenant context.

**Q: What's the difference between functions and workers?**
A: Functions handle real-time requests (< 150ms target), while workers process background tasks asynchronously. Workers can run longer and handle batch operations.

### Development & Deployment

**Q: How do I add a new endpoint?**
A: 1) Create function: `supabase functions new my-endpoint`, 2) Implement in `index.ts`, 3) Deploy: `supabase functions deploy my-endpoint`, 4) Test with curl.

**Q: Can I test functions locally?**
A: Yes! Use `supabase start` for local development, then `supabase functions deploy --local` to test locally before deploying to production.

**Q: How do I handle database migrations?**
A: Add SQL to `sql/` directory, then run `make db-push`. For complex changes, use `supabase db diff` to generate migrations.

**Q: What if deployment fails?**
A: Check GitHub Actions logs, verify secrets are set, ensure database schema is up to date, and confirm Supabase CLI is authenticated.

### Troubleshooting

**Q: Functions returning 500 errors?**
A: Check function logs with `make logs` or `supabase functions logs`. Common issues: missing secrets, database connection problems, or unhandled TypeScript errors.

**Q: Database connection issues?**
A: Verify `SUPABASE_SERVICE_ROLE_KEY` is correct and has proper permissions. Check that RLS policies allow the operation for your tenant.

**Q: Rate limiting not working?**
A: Ensure tenant ID is properly extracted from API key, and rate limit tables are initialized. Check `rateLimit.ts` configuration.

**Q: Stripe usage not recording?**
A: Verify `STRIPE_SECRET_KEY` is set, subscription item ID is valid, and billing function has proper permissions.

### Performance & Scaling

**Q: How do I optimize function performance?**
A: Use connection pooling, cache frequently accessed data, implement circuit breakers for external APIs, and monitor p95 latency in Supabase Dashboard.

**Q: What are the scaling limits?**
A: Edge Functions auto-scale, but database connections are limited. Use connection pooling and consider read replicas for high-traffic scenarios.

**Q: How do I monitor production?**
A: Use Supabase Dashboard for logs and metrics, set up Stripe webhook monitoring, and implement custom health checks for critical paths.

### Business & Billing

**Q: How does metered billing work?**
A: Each API call records usage in Stripe, which automatically invoices customers based on their subscription's metered pricing model.

**Q: Can I customize pricing tiers?**
A: Yes, modify the pricing logic in billing functions and update Stripe products. Ensure database schema supports your pricing model.

**Q: How do I onboard new customers?**
A: Use the built-in onboarding wizard that guides users from GitHub signup to deployment to first API call. Customize in the frontend application.

### Security

**Q: How secure is multi-tenant data isolation?**
A: Very secure. PostgreSQL RLS provides database-level isolation, API keys are hashed and scoped, and all queries automatically filter by tenant context.

**Q: How do I rotate API keys?**
A: Generate new keys via the admin API, update client applications, then revoke old keys. The system supports multiple active keys per tenant.

**Q: What about webhook security?**
A: All webhooks should include HMAC signatures or JWT tokens for verification. Implement signature verification in webhook handlers.

---

## 🎯 Next Steps

1. **Complete the Quick Start** above to get your development environment running
2. **Run `make magic`** to see the end-to-end demo in action
3. **Explore the `docs/` directory** for specific guides on webhooks, API usage, and architecture
4. **Join the community** for support and to share your implementations
5. **Consider the white-label offering** in `docs/WHITE_LABEL_SELF_HOSTING.md` for commercial usage

---

**Need Help?** Check the other guides in the `docs/` directory or refer to the [Supabase Documentation](https://supabase.com/docs) for platform-specific questions.