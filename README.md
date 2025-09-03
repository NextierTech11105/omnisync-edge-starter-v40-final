# OmniSync Edge Starter v4.0 Final

A production-ready Supabase Edge Functions starter project with comprehensive VSCode development environment.

## 🚀 Quick Start

### Option 1: VSCode Setup (Recommended)
```bash
# Clone and set up VSCode environment
git clone <repository-url>
cd omnisync-edge-starter-v40-final
./setup-vscode.sh
```

### Option 2: Manual Setup
```bash
# Install dependencies
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase configuration

# Deploy edge functions
make deploy
```

## 🛠️ Development

This project includes a complete VSCode development environment with:

- **Deno/TypeScript support** for Edge Functions
- **Supabase CLI integration** for local development  
- **Debugging configurations** for all functions
- **Integrated tasks** for deployment and testing
- **API testing** with REST Client
- **SQL development tools**

### VSCode Features

Open the workspace file to get started:
```bash
code omnisync-edge-starter.code-workspace
```

**Available Tasks** (Ctrl+Shift+P → "Tasks: Run Task"):
- Deploy Edge Functions
- Watch Logs  
- Start/Stop Local Supabase
- Run Demo
- Lint/Format Code

**API Testing**: Use `.vscode/api-tests.http` to test endpoints directly in VSCode.

## 📁 Project Structure

```
.
├── .vscode/              # VSCode configuration
│   ├── settings.json     # Editor settings for Deno/TypeScript
│   ├── tasks.json        # Build and deployment tasks
│   ├── launch.json       # Debug configurations
│   ├── extensions.json   # Recommended extensions
│   └── api-tests.http    # API endpoint testing
├── supabase/functions/   # Edge Functions
│   ├── webhooks/         # Webhook handlers
│   ├── workers/          # Background workers
│   ├── orchestrate/      # Orchestration functions
│   └── _shared/          # Shared utilities
├── sql/                  # Database schema and migrations
├── docs/                 # Documentation
└── Makefile             # Development commands
```

## 🎯 Edge Functions

- **webhooks/signalhouse** - Webhook processing with deduplication
- **workers/process-lead** - Lead processing worker
- **orchestrate/lead-intake** - Lead intake orchestration
- **cron/retry-deadletters** - Dead letter queue retry
- **billing/usage-record** - Stripe billing integration
- **rl/choose-action** - Rate limiting

## 📖 Documentation

- [VSCode Setup Guide](.vscode/README.md)
- [Architecture Overview](docs/ARCHITECTURE+SECURITY.md)
- [Operations Guide](docs/OPERATIONS.md)
- [API Documentation](docs/API.md)

## 🔧 Available Commands

```bash
make deploy          # Deploy edge functions
make logs           # Watch function logs
make db-push        # Apply database migrations
make magic          # Run 3-minute demo
make verify         # Verify endpoints
```

## 🌟 Features

- **Production-ready** Edge Functions architecture
- **Type-safe** with TypeScript and Deno
- **Comprehensive testing** with integrated tools
- **Observability** with structured logging
- **Rate limiting** and circuit breakers
- **Dead letter queues** for reliability
- **Stripe integration** for billing
- **Multi-tenant** support

---

For detailed setup instructions, see the [VSCode README](.vscode/README.md).
