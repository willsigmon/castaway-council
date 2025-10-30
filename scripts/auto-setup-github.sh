#!/bin/bash
# Automated GitHub + Vercel Setup Script
# This script can run manually or be executed after GitHub MCP authentication

set -e

REPO_NAME="${1:-castaway-council}"
GITHUB_USER="${GITHUB_USER:-$(git config user.name)}"

echo "🚀 Auto-setting up GitHub repo: $REPO_NAME"

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Initializing git repository..."
    git init
    git branch -M main
fi

# Check if remote exists
if git remote get-url origin > /dev/null 2>&1; then
    echo "⚠️  Remote 'origin' already exists"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "🔗 Setting up remote..."
    git remote add origin "https://github.com/${GITHUB_USER}/${REPO_NAME}.git"
fi

# Stage all files
echo "📝 Staging files..."
git add .

# Create initial commit if needed
if ! git rev-parse HEAD > /dev/null 2>&1; then
    echo "💾 Creating initial commit..."
    git commit -m "Initial commit: Castaway Council PWA

- Next.js 14 with App Router
- Supabase integration ready
- Temporal workflows configured
- PWA manifest & service worker
- Full game logic & API routes
- Ready for Vercel deployment"
fi

echo ""
echo "✅ Local git setup complete!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Create GitHub repository (if not exists):"
echo "   gh repo create $REPO_NAME --public --source=. --remote=origin --push"
echo ""
echo "2. OR push to existing repo:"
echo "   git push -u origin main"
echo ""
echo "3. Then connect to Vercel:"
echo "   https://vercel.com/new → Import Git Repository"
echo ""
