-- Migration 009: Make ward_id optional on facilities and update dependent views
-- Allows importing facilities without ward attribution while keeping FK integrity.

BEGIN;

-- Make ward_id nullable
ALTER TABLE facilities
  ALTER COLUMN ward_id DROP NOT NULL;

-- Recreate materialized views to tolerate NULL ward_id
DROP MATERIALIZED VIEW IF EXISTS hazard_vulnerability_matrix;
DROP MATERIALIZED VIEW IF EXISTS regional_aggregates;
DROP MATERIALIZED VIEW IF EXISTS facility_latest_scores;

-- VIEW 1: Facility Latest Scores
CREATE MATERIALIZED VIEW facility_latest_scores AS
WITH latest_assessments AS (
  SELECT DISTINCT ON (facility_id)
    id as assessment_id,
    facility_id,
    assessment_date,
    overall_score,
    vulnerability_score,
    impact_score,
    resilience_level
  FROM assessments
  WHERE status = 'completed'
  ORDER BY facility_id, assessment_date DESC, completed_at DESC
)
SELECT 
  f.id as facility_id,
  f.code as facility_code,
  f.name as facility_name,
  f.facility_type,
  f.ownership,
  f.tier_level,
  f.ward_id,
  w.sub_county_id,
  sc.county_id,
  c.country_id,
  la.assessment_id,
  la.assessment_date,
  la.overall_score,
  la.vulnerability_score,
  la.impact_score,
  la.resilience_level,
  (SELECT jsonb_object_agg(
    pillar::text,
    jsonb_build_object(
      'vulnerability', vulnerability_score,
      'impact', impact_score,
      'resilience', resilience_score,
      'critical_gaps', critical_gaps_count,
      'major_impacts', major_impacts_count
    )
  ) FROM pillar_scores WHERE assessment_id = la.assessment_id) as pillar_scores,
  (SELECT jsonb_object_agg(
    hazard::text,
    jsonb_build_object(
      'vulnerability', vulnerability_score,
      'impact', impact_score,
      'resilience', resilience_score,
      'is_priority', is_priority_hazard,
      'critical_gaps', critical_gaps_count,
      'major_impacts', major_impacts_count
    )
  ) FROM hazard_scores WHERE assessment_id = la.assessment_id) as hazard_scores
FROM facilities f
LEFT JOIN wards w ON f.ward_id = w.id
LEFT JOIN sub_counties sc ON w.sub_county_id = sc.id
LEFT JOIN counties c ON sc.county_id = c.id
LEFT JOIN latest_assessments la ON la.facility_id = f.id
WHERE f.status = 'active';

CREATE UNIQUE INDEX idx_facility_latest_scores_facility ON facility_latest_scores (facility_id);
CREATE INDEX idx_facility_latest_scores_county ON facility_latest_scores (county_id);
CREATE INDEX idx_facility_latest_scores_resilience ON facility_latest_scores (resilience_level);

-- VIEW 2: Regional Aggregates
CREATE MATERIALIZED VIEW regional_aggregates AS
SELECT 
  c.id as county_id,
  c.country_id,
  c.code as county_code,
  c.name as county_name,
  c.population as county_population,
  COUNT(DISTINCT f.id) as total_facilities,
  COUNT(DISTINCT fls.assessment_id) as facilities_assessed,
  ROUND(AVG(fls.overall_score)::numeric, 2) as avg_overall_score,
  ROUND(AVG(fls.vulnerability_score)::numeric, 2) as avg_vulnerability_score,
  ROUND(AVG(fls.impact_score)::numeric, 2) as avg_impact_score,
  COUNT(*) FILTER (WHERE fls.resilience_level = 'resilient') as resilient_count,
  COUNT(*) FILTER (WHERE fls.resilience_level = 'low_risk') as low_risk_count,
  COUNT(*) FILTER (WHERE fls.resilience_level = 'medium_risk') as medium_risk_count,
  COUNT(*) FILTER (WHERE fls.resilience_level = 'high_risk') as high_risk_count,
  ROUND(AVG((fls.pillar_scores->'workforce'->>'vulnerability')::numeric), 2) as avg_workforce_vulnerability,
  ROUND(AVG((fls.pillar_scores->'wash'->>'vulnerability')::numeric), 2) as avg_wash_vulnerability,
  ROUND(AVG((fls.pillar_scores->'energy'->>'vulnerability')::numeric), 2) as avg_energy_vulnerability,
  ROUND(AVG((fls.pillar_scores->'infrastructure'->>'vulnerability')::numeric), 2) as avg_infrastructure_vulnerability,
  MAX(fls.assessment_date) as latest_assessment_date
FROM counties c
LEFT JOIN sub_counties sc ON sc.county_id = c.id
LEFT JOIN wards w ON w.sub_county_id = sc.id
LEFT JOIN facilities f ON f.ward_id = w.id
LEFT JOIN facility_latest_scores fls ON fls.facility_id = f.id
WHERE f.status = 'active' AND c.id IS NOT NULL
GROUP BY c.id, c.country_id, c.code, c.name, c.population;

CREATE UNIQUE INDEX idx_regional_aggregates_county ON regional_aggregates (county_id);

-- VIEW 3: Hazard Vulnerability Matrix
CREATE MATERIALIZED VIEW hazard_vulnerability_matrix AS
SELECT 
  f.id as facility_id,
  f.code as facility_code,
  f.name as facility_name,
  f.facility_type,
  f.ward_id,
  w.sub_county_id,
  sc.county_id,
  fls.assessment_id,
  fls.assessment_date,
  h.key::hazard_enum as hazard,
  ROUND((h.value->>'vulnerability')::numeric, 2) as vulnerability_score,
  ROUND((h.value->>'impact')::numeric, 2) as impact_score,
  ROUND((h.value->>'resilience')::numeric, 2) as resilience_score,
  (h.value->>'is_priority')::boolean as is_priority_hazard,
  (h.value->>'critical_gaps')::integer as critical_gaps_count,
  (h.value->>'major_impacts')::integer as major_impacts_count
FROM facilities f
LEFT JOIN wards w ON f.ward_id = w.id
LEFT JOIN sub_counties sc ON w.sub_county_id = sc.id
LEFT JOIN facility_latest_scores fls ON fls.facility_id = f.id
CROSS JOIN LATERAL jsonb_each(fls.hazard_scores) AS h(key, value)
WHERE f.status = 'active' AND fls.hazard_scores IS NOT NULL;

CREATE INDEX idx_hazard_vuln_matrix_county_hazard ON hazard_vulnerability_matrix (county_id, hazard);
CREATE INDEX idx_hazard_vuln_matrix_hazard ON hazard_vulnerability_matrix (hazard);

-- Refresh helper
CREATE OR REPLACE FUNCTION refresh_dashboard_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY facility_latest_scores;
  REFRESH MATERIALIZED VIEW CONCURRENTLY regional_aggregates;
  REFRESH MATERIALIZED VIEW CONCURRENTLY hazard_vulnerability_matrix;
END;
$$ LANGUAGE plpgsql;

COMMIT;



