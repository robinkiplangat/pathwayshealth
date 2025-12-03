# PathwaysHealth Database Implementation

## Overview

This directory contains the database schema implementation for the PathwaysHealth multi-level dashboard system, designed to support 15,000+ healthcare facilities across Kenya.

## Architecture

The database architecture supports four dashboard levels:
- **Centre Level**: Individual facility assessment details
- **Regional Level**: County/sub-county aggregated statistics  
- **Hazard-Specific**: Climate hazard vulnerability analysis
- **National Level**: Country-wide overview

## Database Structure

### Migrations

Located in `supabase/migrations/`:

1. **001_geographic_and_facilities.sql** - Geographic hierarchy (countries → counties → sub-counties → wards) and facilities
2. **002_assessments_and_scoring.sql** - Assessment tables, questions, responses, and scoring
3. **003_interventions_and_climate.sql** - Intervention catalog, recommendations, and climate data
4. **004_materialized_views.sql** - Pre-computed views for dashboard performance

### Key Tables

**Geographic Hierarchy:**
- `countries` → `counties` → `sub_counties` → `wards` → `facilities`

**Assessments:**
- `assessments` - Climate resilience assessments
- `vulnerability_questions` - ~1,200 questions across 7 hazards × 4 pillars
- `assessment_responses` - Individual answers
- `impact_statements` - ~800 impact scenarios
- `impact_responses` - Severity ratings

**Scoring:**
- `pillar_scores` - Per-pillar per-hazard scores (28 rows per assessment)
- `hazard_scores` - Per-hazard aggregated scores (7 rows per assessment)

**Interventions:**
- `intervention_catalog` - WHO-recommended interventions (~300 items)
- `recommended_interventions` - System-generated recommendations
- `intervention_plans` - Implementation tracking

**Materialized Views:**
- `facility_latest_scores` - Latest assessment per facility
- `regional_aggregates` - County-level statistics
- `hazard_vulnerability_matrix` - Hazard-specific cross-tabulation

## Applying Migrations

### Prerequisites

1. Ensure Supabase project is configured in `.env`:
   ```env
   DATABASE_URL=postgresql://...
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

2. Install PostgreSQL client:
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu
   sudo apt-get install postgresql-client
   ```

### Apply Migrations

```bash
# Make script executable (first time only)
chmod +x supabase/apply-migrations.sh

# Apply all migrations
./supabase/apply-migrations.sh
```

Or manually with `psql`:

```bash
psql "$DATABASE_URL" -f supabase/migrations/001_geographic_and_facilities.sql
psql "$DATABASE_URL" -f supabase/migrations/002_assessments_and_scoring.sql
psql "$DATABASE_URL" -f supabase/migrations/003_interventions_and_climate.sql
psql "$DATABASE_URL" -f supabase/migrations/004_materialized_views.sql
```

## API Endpoints

### Centre Dashboard
```
GET /api/dashboards/centre?facilityId=<uuid>
```

Returns comprehensive facility data including latest scores, recommended interventions, implementation plans, and assessment history.

### Regional Dashboard
```
GET /api/dashboards/regional?countyId=<uuid>
```

Returns county-level aggregated statistics, most vulnerable facilities, hazard breakdown, and sub-county distribution.

### Hazard-Specific Dashboard
```
GET /api/dashboards/hazard?hazard=<hazard>&countyId=<uuid>
```

Hazard types: `floods`, `storms`, `sea_level_rise`, `drought`, `heatwave`, `wildfire`, `coldwave`

Returns facility vulnerability for specific hazard, county breakdown, and recommended interventions.

### National Dashboard
```
GET /api/dashboards/national?countryCode=KE
```

Returns country-wide statistics, resilience distribution, pillar vulnerabilities, county rankings.

## Performance

**Query Targets:**
- Centre dashboard: **< 100ms**
- Regional dashboard: **< 500ms**
- Hazard dashboard: **< 500ms**
- National dashboard: **< 2 seconds**

**Materialized View Refresh:**
```sql
SELECT refresh_dashboard_views();
```
Estimated refresh time: **~30 seconds** for 15K facilities

## Data Loading

### Kenya Geographic Data

Kenya has:
- 47 counties
- ~300 sub-counties
- ~1,500 wards

Use the KMHFR API (Kenya Master Health Facility Registry) to load official facility data.

### Loading Sample Data

```bash
# Load sample Kenya data
psql "$DATABASE_URL" -f /path/to/sample_data_kenya.sql
```

## Next Steps

1. **Apply migrations** to Supabase database
2. **Load geographic data** for Kenya (47 counties, sub-counties, wards)
3. **Integrate KMHFR API** to import 15K facilities
4. **Seed vulnerability questions** (~1,200 questions)
5. **Seed impact statements** (~800 statements)
6. **Build dashboard UI components** to consume API endpoints
7. **Test with sample assessments**
8. **Refresh materialized views** after data loads

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [KMHFR API Docs](https://mfl-api-docs.readthedocs.io/en/latest/)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [WHO Climate-Resilient Health Facilities](https://www.who.int/publications/i/item/9789241565073)
