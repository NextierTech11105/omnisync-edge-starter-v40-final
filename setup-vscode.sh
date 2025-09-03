#!/bin/bash

# VSCode Development Setup Script for OmniSync Edge Starter
# This script helps set up the development environment

echo "🚀 Setting up VSCode development environment for OmniSync Edge Starter..."

# Check if VSCode is installed
if ! command -v code &> /dev/null; then
    echo "❌ VSCode is not installed or not in PATH"
    echo "   Please install VSCode and add it to your PATH"
    exit 1
fi

# Check if Deno is installed
if ! command -v deno &> /dev/null; then
    echo "❌ Deno is not installed"
    echo "   Installing Deno..."
    curl -fsSL https://deno.land/install.sh | sh
    echo "   Please add Deno to your PATH or restart your terminal"
fi

# Check if Supabase CLI is installed  
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed"
    echo "   Please install Supabase CLI: https://supabase.com/docs/guides/cli"
fi

# Create .env.local from .env.example if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "   Please edit .env.local with your actual configuration values"
fi

# Install recommended VSCode extensions
echo "🔌 Installing recommended VSCode extensions..."
code --install-extension denoland.vscode-deno
code --install-extension supabase.supabase
code --install-extension ms-mssql.mssql
code --install-extension mhutchie.git-graph
code --install-extension humao.rest-client
code --install-extension mikestead.dotenv

# Open workspace in VSCode
echo "📂 Opening workspace in VSCode..."
code omnisync-edge-starter.code-workspace

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your Supabase configuration"
echo "2. Run 'make deploy' to deploy edge functions"  
echo "3. Use Ctrl+Shift+P → 'Tasks: Run Task' to access development tasks"
echo "4. Use the REST Client (.vscode/api-tests.http) to test endpoints"
echo ""
echo "Happy coding! 🎉"