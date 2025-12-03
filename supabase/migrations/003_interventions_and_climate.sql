-- ============================================================================
-- Migration 003: Interventions and Climate Data
-- Created: 2025-12-02
-- Description: Creates intervention catalog, recommendations, tracking, and
--              regional climate/hazard data tables
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE intervention_type_enum AS ENUM (
  'training',
  'infrastructure',
  'equipment',
  'policy',
  'planning',
  'maintenance'
);

CREATE TYPE priority_level_enum AS ENUM (
  'critical',
  'high',
  'medium',
  'low'
);

CREATE TYPE generation_source_enum AS ENUM ('system_auto', 'manual_expert', 'ai_suggested');

CREATE TYPE intervention_status_enum AS ENUM (
  'planned',
  'in_progress',
  'completed',
  'abandoned'
);

CREATE TYPE risk_level_enum AS ENUM ('extreme', 'high', 'moderate', 'low');

CREATE TYPE trend_enum AS ENUM ('increasing', 'stable', 'decreasing');

CREATE TYPE confidence_level_enum AS ENUM ('high', 'medium', 'low');

-- ============================================================================
-- INTERVENTION CATALOG
-- ============================================================================

CREATE TABLE intervention_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  pillar pillar_enum NOT NULL,
  addresses_hazards hazard_enum[] NOT NULL,
  intervention_type intervention_type_enum NOT NULL,
  priority_level priority_level_enum DEFAULT 'medium',
  estimated_cost_min DECIMAL(12, 2),
  estimated_cost_max DECIMAL(12, 2),
  estimated_duration_days INTEGER,
  success_metrics JSONB,
  resources_required JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intervention_catalog_pillar ON intervention_catalog(pillar);
CREATE INDEX idx_intervention_catalog_hazards ON intervention_catalog USING GIN(addresses_hazards);
CREATE INDEX idx_intervention_catalog_code ON intervention_catalog(code);

CREATE TRIGGER update_intervention_catalog_updated_at BEFORE UPDATE ON intervention_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RECOMMENDED INTERVENTIONS
-- ============================================================================

CREATE TABLE recommended_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  intervention_id UUID NOT NULL REFERENCES intervention_catalog(id) ON DELETE RESTRICT,
  generated_by generation_source_enum DEFAULT 'system_auto',
  priority_rank INTEGER NOT NULL,
  rationale TEXT,
  addresses_gaps JSONB,
  addresses_impacts JSONB,
  estimated_risk_reduction DECIMAL(5, 2),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, intervention_id)
);

CREATE INDEX idx_recommended_interventions_assessment ON recommended_interventions(assessment_id);
CREATE INDEX idx_recommended_interventions_intervention ON recommended_interventions(intervention_id);
CREATE INDEX idx_recommended_interventions_priority ON recommended_interventions(assessment_id, priority_rank);

-- ============================================================================
-- INTERVENTION PLANS
-- ============================================================================

CREATE TABLE intervention_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  intervention_id UUID NOT NULL REFERENCES intervention_catalog(id) ON DELETE RESTRICT,
  source_assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
  status intervention_status_enum DEFAULT 'planned',
  planned_start_date DATE,
  actual_start_date DATE,
  planned_completion_date DATE,
  actual_completion_date DATE,
  budget_allocated DECIMAL(12, 2),
  budget_spent DECIMAL(12, 2),
  responsible_person VARCHAR(255),
  completion_percentage INTEGER CHECK (completion_percentage BETWEEN 0 AND 100) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intervention_plans_facility ON intervention_plans(facility_id);
CREATE INDEX idx_intervention_plans_intervention ON intervention_plans(intervention_id);
CREATE INDEX idx_intervention_plans_status ON intervention_plans(facility_id, status, planned_completion_date);

CREATE TRIGGER update_intervention_plans_updated_at BEFORE UPDATE ON intervention_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- CLIMATE & HAZARD DATA
-- ============================================================================

CREATE TABLE regional_hazard_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  hazard hazard_enum NOT NULL,
  risk_level risk_level_enum NOT NULL,
  frequency_score INTEGER CHECK (frequency_score BETWEEN 1 AND 5),
  intensity_score INTEGER CHECK (intensity_score BETWEEN 1 AND 5),
  trend trend_enum DEFAULT 'stable',
  data_source VARCHAR(255),
  last_updated DATE,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(county_id, hazard)
);

CREATE INDEX idx_regional_hazard_profiles_county ON regional_hazard_profiles(county_id);
CREATE INDEX idx_regional_hazard_profiles_hazard ON regional_hazard_profiles(hazard);

CREATE TABLE climate_projections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  projection_year INTEGER NOT NULL,
  hazard hazard_enum NOT NULL,
  projected_change JSONB NOT NULL,
  confidence_level confidence_level_enum DEFAULT 'medium',
  data_source VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_climate_projections_county ON climate_projections(county_id);
CREATE INDEX idx_climate_projections_year ON climate_projections(projection_year);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE intervention_catalog IS 'Master catalog of WHO-recommended climate adaptation interventions';
COMMENT ON TABLE recommended_interventions IS 'System-generated intervention recommendations per assessment';
COMMENT ON TABLE intervention_plans IS 'Tracking implementation of interventions at facilities';
COMMENT ON TABLE regional_hazard_profiles IS 'Climate hazard risk profiles by county/region';
COMMENT ON TABLE climate_projections IS 'Future climate projections for planning';
