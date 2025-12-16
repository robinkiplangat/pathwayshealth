#!/bin/bash

# ============================================================================
# Apply Supabase Migrations Script
# Run this script to apply all migrations to your Supabase database
# ============================================================================

set -e

echo "🔧 PathwaysHealth Database Migration Script"
echo "============================================"
echo

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "📦 Install it with: npm install -g supabase"
    echo "📖 Or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found"
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '#' | awk '/=/ {print $1}')

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL not found in .env file"
    exit 1
fi

echo "📊 Database: ${DATABASE_URL%%\?*}"
echo

# Apply migrations
echo "🚀 Applying migrations..."
echo

for migration in supabase/migrations/*.sql; do
    if [ -f "$migration" ]; then
        filename=$(basename "$migration")
        echo "  ▶ Applying $filename..."
        
        # Use psql to apply migration
        psql "$DATABASE_URL" -f "$migration" 2>&1 | sed 's/^/    /'
        
        if [ $? -eq 0 ]; then
            echo "  ✅ $filename applied successfully"
        else
            echo "  ❌ Failed to apply $filename"
            exit 1
        fi
        echo
    fi
done

echo "✨ All migrations applied successfully!"
echo
echo "📝 Next steps:"
echo "  1. Verify schema in Supabase dashboard"
echo "  2. Run test queries"
echo "  3. Load sample data with: node scripts/load-kenya-data.js"
echo
