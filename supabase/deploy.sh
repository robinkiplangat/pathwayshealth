#!/bin/bash

# Quick script to open Supabase SQL Editor in browser
# and display migration instructions

SUPABASE_PROJECT_ID="jrzdnbferzvxmwqboknx"
SUPABASE_URL="https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql"

echo "🚀 PathwaysHealth - Database Deployment"
echo "========================================="
echo ""
echo "📊 Opening Supabase SQL Editor..."
echo ""

# Open Supabase SQL Editor
if command -v open &> /dev/null; then
    open "$SUPABASE_URL"
elif command -v xdg-open &> /dev/null; then
    xdg-open "$SUPABASE_URL"
else
    echo "Please open this URL manually: $SUPABASE_URL"
fi

echo ""
echo "📝 Apply migrations in this order:"
echo ""
echo "1️⃣  supabase/migrations/001_geographic_and_facilities.sql"
echo "    Creates: Geographic hierarchy + Facilities"
echo ""
echo "2️⃣  supabase/migrations/002_assessments_and_scoring.sql"
echo "    Creates: Assessments + Questions + Responses + Scoring"
echo ""
echo "3️⃣  supabase/migrations/003_interventions_and_climate.sql"
echo "    Creates: Interventions + Climate Data"
echo ""
echo "4️⃣  supabase/migrations/004_materialized_views.sql"
echo "    Creates: Dashboard Materialized Views"
echo ""
echo "📖 For detailed instructions, see: supabase/DEPLOY.md"
echo ""
echo "✅ After applying migrations:"
echo "   - Run: npx ts-node scripts/sync-kmhfr-data.ts"
echo "   - Test API endpoints at /api/dashboards/*"
echo ""
