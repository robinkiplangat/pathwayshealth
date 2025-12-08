-- ============================================================================
-- Migration 007: Assessment Reports
-- Created: 2025-12-03
-- Description: Creates assessment_reports table to track generated PDFs and
--              link reports to both assessments and facilities
-- ============================================================================

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE report_type_enum AS ENUM (
  'standard',
  'detailed',
  'executive',
  'summary'
);

-- ============================================================================
-- ASSESSMENT REPORTS TABLE
-- ============================================================================

CREATE TABLE assessment_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
  user_id VARCHAR(255), -- Clerk user ID (null for anonymous)
  report_type report_type_enum DEFAULT 'standard',
  
  -- File storage
  file_url TEXT, -- Public URL for PDF (GCS/S3)
  file_key TEXT, -- Storage key/path
  file_size_bytes INTEGER,
  
  -- Metadata
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP, -- For temporary/anonymous reports
  is_public BOOLEAN DEFAULT false,
  download_count INTEGER DEFAULT 0,
  
  -- Additional data
  metadata JSONB, -- Flexible storage for report-specific data
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_reports_assessment ON assessment_reports(assessment_id);
CREATE INDEX idx_reports_facility ON assessment_reports(facility_id);
CREATE INDEX idx_reports_user ON assessment_reports(user_id);
CREATE INDEX idx_reports_generated ON assessment_reports(generated_at DESC);
CREATE INDEX idx_reports_expires ON assessment_reports(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

CREATE TRIGGER update_assessment_reports_updated_at 
  BEFORE UPDATE ON assessment_reports
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to clean up expired reports
CREATE OR REPLACE FUNCTION cleanup_expired_reports()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM assessment_reports
  WHERE expires_at IS NOT NULL 
    AND expires_at < CURRENT_TIMESTAMP;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to increment download count
CREATE OR REPLACE FUNCTION increment_report_downloads(report_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE assessment_reports
  SET download_count = download_count + 1
  WHERE id = report_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE assessment_reports IS 'Stores metadata for generated assessment reports (PDFs)';
COMMENT ON COLUMN assessment_reports.file_url IS 'Public URL for accessing the PDF report';
COMMENT ON COLUMN assessment_reports.file_key IS 'Storage key for the file (e.g., GCS path)';
COMMENT ON COLUMN assessment_reports.expires_at IS 'Expiration time for temporary reports (e.g., anonymous assessments)';
COMMENT ON COLUMN assessment_reports.metadata IS 'Flexible JSON storage for report-specific data (e.g., chart data, summary stats)';
