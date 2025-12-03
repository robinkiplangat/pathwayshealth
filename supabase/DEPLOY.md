# Quick Deployment Guide

## Apply Migrations via Supabase Dashboard

Since command-line tools aren't available, follow these steps to deploy the database schema:

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://jrzdnbferzvxmwqboknx.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Apply Migrations in Order

Copy and paste each migration file content into the SQL Editor and click **Run**:

#### Migration 1: Geographic & Facilities
📁 File: `supabase/migrations/001_geographic_and_facilities.sql`

This creates:
- Countries, counties, sub_counties, wards tables
- Facilities and facility_services tables
- Geographic hierarchy with PostGIS support

#### Migration 2: Assessments & Scoring  
📁 File: `supabase/migrations/002_assessments_and_scoring.sql`

This creates:
- Assessments table
- Vulnerability questions and responses
- Impact statements and responses
- Pillar and hazard scoring tables

#### Migration 3: Interventions & Climate
📁 File: `supabase/migrations/003_interventions_and_climate.sql`

This creates:
- Intervention catalog
- Recommended interventions
- Intervention plans
- Regional hazard profiles
- Climate projections

#### Migration 4: Materialized Views
📁 File: `supabase/migrations/004_materialized_views.sql`

This creates:
- facility_latest_scores view
- regional_aggregates view
- hazard_vulnerability_matrix view
- refresh_dashboard_views() function

### Step 3: Verify Installation

Run this query to check if tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

You should see 20+ tables including:
- countries, counties, sub_counties, wards
- facilities, facility_services
- assessments, vulnerability_questions, impact_statements
- pillar_scores, hazard_scores
- intervention_catalog, recommended_interventions
- regional_hazard_profiles

### Step 4: Load Kenya Data

After migrations are applied, you can load Kenya facility data:

```bash
# In your terminal
npx ts-node scripts/sync-kmhfr-data.ts --full
```

Or test with 100 facilities first:
```bash
npx ts-node scripts/sync-kmhfr-data.ts
```

### Step 5: Test API Endpoints

The following API endpoints should now work:

- `GET /api/dashboards/centre?facilityId=<uuid>`
- `GET /api/dashboards/regional?countyId=<uuid>`
- `GET /api/dashboards/hazard?hazard=floods`
- `GET /api/dashboards/national?countryCode=KE`

---

## Alternative: Install PostgreSQL Client

If you prefer command-line deployment:

```bash
# macOS
brew install postgresql

# Then run
psql "$DATABASE_URL" -f supabase/migrations/001_geographic_and_facilities.sql
psql "$DATABASE_URL" -f supabase/migrations/002_assessments_and_scoring.sql
psql "$DATABASE_URL" -f supabase/migrations/003_interventions_and_climate.sql
psql "$DATABASE_URL" -f supabase/migrations/004_materialized_views.sql
```

---

## Troubleshooting

**PostGIS Extension Error?**
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

**Permission Denied?**
- Make sure you're using the service_role key
- Or apply migrations as the postgres user in Supabase Dashboard

**Table Already Exists?**
- Drop existing tables first (⚠️ warning: this deletes data!)
- Or use `DROP TABLE IF EXISTS ...` before creating

---

## Next Steps After Deployment

1. ✅ Verify all tables created
2. 🔄 Load Kenya data from KMHFR
3. 🧪 Test API endpoints
4. 🎨 Build dashboard UI components
5. 📊 Create sample assessments for testing
