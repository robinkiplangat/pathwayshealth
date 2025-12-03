-- ============================================================================
-- Migration 002: Assessments, Questions, and Scoring
-- Created: 2025-12-02
-- Description: Creates assessment tables, vulnerability questions, impact
--              statements, responses, and scoring tables
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE hazard_enum AS ENUM (
  'floods',
  'storms',
  'sea_level_rise',
  'drought',
  'heatwave',
  'wildfire',
  'coldwave'
);

CREATE TYPE pillar_enum AS ENUM (
  'workforce',
  'wash',
  'energy',
  'infrastructure'
);

CREATE TYPE assessment_status_enum AS ENUM (
  'draft',
  'in_progress',
  'completed',
  'validated'
);

CREATE TYPE resilience_level_enum AS ENUM (
  'resilient',
  'low_risk',
  'medium_risk',
  'high_risk'
);

CREATE TYPE vulnerability_answer_enum AS ENUM ('low', 'medium', 'high');

CREATE TYPE severity_enum AS ENUM ('major', 'moderate', 'minor');

CREATE TYPE likelihood_enum AS ENUM ('very_likely', 'likely', 'unlikely');

-- ============================================================================
--ASSESSMENTS
-- ============================================================================

CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  user_id VARCHAR(255),
  session_id VARCHAR(255),
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  assessment_period VARCHAR(20),
  completed_at TIMESTAMP,
  status assessment_status_enum DEFAULT 'draft',
  assessor_name VARCHAR(255),
  assessor_role VARCHAR(100),
  assessor_email VARCHAR(255),
  is_baseline BOOLEAN DEFAULT false,
  is_anonymous BOOLEAN DEFAULT true,
  claimed_at TIMESTAMP,
  overall_score DECIMAL(5, 2) CHECK (overall_score BETWEEN 0 AND 100),
  vulnerability_score DECIMAL(5, 2) CHECK (vulnerability_score BETWEEN 0 AND 100),
  impact_score DECIMAL(5, 2) CHECK (impact_score BETWEEN 0 AND 100),
  resilience_level resilience_level_enum,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assessments_facility ON assessments(facility_id);
CREATE INDEX idx_assessments_date ON assessments(assessment_date);
CREATE INDEX idx_assessments_status ON assessments(status);
CREATE INDEX idx_assessments_facility_date ON assessments(facility_id, assessment_date DESC, status);
CREATE INDEX idx_assessments_resilience ON assessments(resilience_level, overall_score) WHERE status = 'completed';

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VULNERABILITY QUESTIONS
-- ============================================================================

CREATE TABLE vulnerability_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  text TEXT NOT NULL,
  hazard hazard_enum NOT NULL,
  pillar pillar_enum NOT NULL,
  category VARCHAR(100),
  is_critical BOOLEAN DEFAULT false,
  weight INTEGER DEFAULT 1,
  display_order INTEGER DEFAULT 0,
  help_text TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_vulnerability_questions_hazard ON vulnerability_questions(hazard);
CREATE INDEX idx_vulnerability_questions_pillar ON vulnerability_questions(pillar);
CREATE INDEX idx_vulnerability_questions_hazard_pillar ON vulnerability_questions(hazard, pillar);
CREATE INDEX idx_vulnerability_questions_code ON vulnerability_questions(code);

-- ============================================================================
-- ASSESSMENT RESPONSES
-- ============================================================================

CREATE TABLE assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES vulnerability_questions(id) ON DELETE RESTRICT,
  answer vulnerability_answer_enum NOT NULL,
  answer_numeric INTEGER NOT NULL CHECK (answer_numeric BETWEEN 1 AND 3),
  notes TEXT,
  evidence_url VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, question_id)
);

CREATE INDEX idx_assessment_responses_assessment ON assessment_responses(assessment_id);
CREATE INDEX idx_assessment_responses_question ON assessment_responses(question_id);

-- ============================================================================
-- IMPACT STATEMENTS
-- ============================================================================

CREATE TABLE impact_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) NOT NULL UNIQUE,
  text TEXT NOT NULL,
  hazard hazard_enum NOT NULL,
  pillar pillar_enum NOT NULL,
  category VARCHAR(100),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_impact_statements_hazard ON impact_statements(hazard);
CREATE INDEX idx_impact_statements_pillar ON impact_statements(pillar);
CREATE INDEX idx_impact_statements_code ON impact_statements(code);

-- ============================================================================
-- IMPACT RESPONSES
-- ============================================================================

CREATE TABLE impact_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  statement_id UUID NOT NULL REFERENCES impact_statements(id) ON DELETE RESTRICT,
  severity severity_enum NOT NULL,
  severity_numeric INTEGER NOT NULL CHECK (severity_numeric BETWEEN 1 AND 3),
  likelihood likelihood_enum DEFAULT 'likely',
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, statement_id)
);

CREATE INDEX idx_impact_responses_assessment ON impact_responses(assessment_id);
CREATE INDEX idx_impact_responses_statement ON impact_responses(statement_id);

-- ============================================================================
-- SCORING TABLES
-- ============================================================================

CREATE TABLE pillar_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  hazard hazard_enum NOT NULL,
  pillar pillar_enum NOT NULL,
  vulnerability_score DECIMAL(5, 2) NOT NULL CHECK (vulnerability_score BETWEEN 0 AND 100),
  impact_score DECIMAL(5, 2) NOT NULL CHECK (impact_score BETWEEN 0 AND 100),
  resilience_score DECIMAL(5, 2) NOT NULL CHECK (resilience_score BETWEEN 0 AND 100),
  question_count INTEGER DEFAULT 0,
  critical_gaps_count INTEGER DEFAULT 0,
  major_impacts_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, hazard, pillar)
);

CREATE INDEX idx_pillar_scores_assessment ON pillar_scores(assessment_id);
CREATE INDEX idx_pillar_scores_hazard_pillar ON pillar_scores(hazard, pillar);

CREATE TABLE hazard_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  hazard hazard_enum NOT NULL,
  vulnerability_score DECIMAL(5, 2) NOT NULL CHECK (vulnerability_score BETWEEN 0 AND 100),
  impact_score DECIMAL(5, 2) NOT NULL CHECK (impact_score BETWEEN 0 AND 100),
  resilience_score DECIMAL(5, 2) NOT NULL CHECK (resilience_score BETWEEN 0 AND 100),
  is_priority_hazard BOOLEAN DEFAULT false,
  critical_gaps_count INTEGER DEFAULT 0,
  major_impacts_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(assessment_id, hazard)
);

CREATE INDEX idx_hazard_scores_assessment ON hazard_scores(assessment_id);
CREATE INDEX idx_hazard_scores_hazard ON hazard_scores(hazard);
CREATE INDEX idx_hazard_scores_priority ON hazard_scores(hazard, is_priority_hazard);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE assessments IS 'Climate resilience assessments completed for facilities';
COMMENT ON TABLE vulnerability_questions IS 'Master list of vulnerability assessment questions';
COMMENT ON TABLE assessment_responses IS 'Individual question responses for each assessment';
COMMENT ON TABLE impact_statements IS 'Master list of impact scenarios';
COMMENT ON TABLE impact_responses IS 'Severity ratings for impact scenarios';
COMMENT ON TABLE pillar_scores IS 'Calculated scores per pillar per hazard for each assessment';
COMMENT ON TABLE hazard_scores IS 'Aggregated scores per hazard for each assessment';
