# VSCode Development Setup

This directory contains VSCode configuration files to optimize your development experience with the OmniSync Edge Starter project.

## Quick Start

1. **Run the setup script:**
   ```bash
   ./setup-vscode.sh
   ```

2. **Manual setup (alternative):**
   - Open the workspace: `code omnisync-edge-starter.code-workspace`
   - Install recommended extensions when prompted
   - Copy `.env.example` to `.env.local` and configure your values

## Files Overview

### Configuration Files

- **`settings.json`** - VSCode workspace settings optimized for Deno/TypeScript development
- **`extensions.json`** - Recommended extensions for Supabase Edge Functions development
- **`tasks.json`** - Integrated tasks for building, deploying, and testing
- **`launch.json`** - Debug configurations for Edge Functions
- **`api-tests.http`** - REST Client file for testing API endpoints

### Development Files

- **`../deno.json`** - Deno configuration with linting and formatting rules
- **`../supabase/functions/import_map.json`** - Import map for Deno dependencies
- **`../.env.example`** - Environment variables template
- **`../omnisync-edge-starter.code-workspace`** - Multi-folder workspace configuration

## Key Features

### 🔧 Development Tools
- **Deno integration** with proper TypeScript support
- **Supabase CLI integration** for local development
- **SQL syntax highlighting** and tools
- **Git workflow enhancements**

### 🚀 Built-in Tasks
Access via `Ctrl+Shift+P` → "Tasks: Run Task":

- **Deploy Edge Functions** - Deploy to Supabase
- **Watch Logs** - Real-time function logs
- **Database Push** - Apply SQL migrations
- **Run Demo** - Execute the 3-minute demo
- **Start/Stop Local Supabase** - Local development server
- **Lint/Format TypeScript** - Code quality tools

### 🐛 Debugging
- Debug configurations for each Edge Function
- Environment variable support
- Integrated terminal debugging

### 🧪 API Testing
Use the REST Client extension with `api-tests.http`:
- Pre-configured endpoints for all functions
- Environment variable integration
- Sample payloads and headers

## Recommended Extensions

The workspace will prompt you to install these extensions:

- **Deno** - TypeScript/JavaScript support for Deno
- **Supabase** - Official Supabase tooling
- **SQL Tools** - Database development
- **REST Client** - API testing within VSCode
- **Git Graph** - Visual git history
- **GitLens** - Enhanced git capabilities

## Environment Setup

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Configure your Supabase settings in `.env.local`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_PROJECT_REF=your_project_ref
   ```

## Development Workflow

1. **Start local Supabase:**
   ```bash
   supabase start
   # or use VSCode task: "Start Supabase Local"
   ```

2. **Deploy functions:**
   ```bash
   make deploy
   # or use VSCode task: "Deploy Edge Functions"
   ```

3. **Test endpoints:**
   - Open `.vscode/api-tests.http`
   - Click "Send Request" on any endpoint
   - View responses in VSCode

4. **Watch logs:**
   ```bash
   make logs
   # or use VSCode task: "Watch Logs"
   ```

## Troubleshooting

### Deno Issues
- Ensure Deno is installed: `deno --version`
- Restart VSCode after installing Deno
- Check that `deno.enable` is true in settings

### Supabase Issues
- Verify Supabase CLI is installed: `supabase --version`
- Check your `.env.local` configuration
- Ensure you're logged in: `supabase auth login`

### Extension Issues
- Install extensions manually if auto-install fails
- Reload VSCode window: `Ctrl+Shift+P` → "Developer: Reload Window"

## Advanced Configuration

### Custom Settings
Add personal settings to `.vscode/settings.local.json` (gitignored):
```json
{
  "editor.fontSize": 14,
  "workbench.colorTheme": "your-theme"
}
```

### Additional Tasks
Extend `tasks.json` for custom workflows:
```json
{
  "label": "Custom Task",
  "type": "shell", 
  "command": "your-command"
}
```

## Support

For issues specific to this VSCode setup, check:
1. Extension documentation
2. Deno VSCode extension issues
3. Supabase CLI documentation

Happy coding! 🚀