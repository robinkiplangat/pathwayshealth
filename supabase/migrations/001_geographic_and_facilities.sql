-- ============================================================================
-- Migration 001: Core Geographic Hierarchy and Facilities
-- Created: 2025-12-02
-- Description: Creates countries, counties, sub_counties, wards, facilities,
--              and facility_services tables with PostGIS support
-- ============================================================================

-- Enable PostGIS extension for geographic queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE facility_type_enum AS ENUM (
  'hospital', 
  'health_center', 
  'dispensary', 
  'clinic',
  'specialized_hospital',
  'referral_hospital'
);

CREATE TYPE ownership_enum AS ENUM (
  'public', 
  'private', 
  'faith_based', 
  'ngo',
  'community'
);

CREATE TYPE facility_status_enum AS ENUM (
  'active', 
  'inactive', 
  'under_construction',
  'temporarily_closed'
);

CREATE TYPE service_type_enum AS ENUM (
  'dialysis',
  'cold_chain',
  'surgery',
  'icu',
  'laboratory',
  'imaging',
  'pharmacy',
  'ambulance',
  'blood_bank'
);

-- ============================================================================
-- GEOGRAPHIC HIERARCHY
-- ============================================================================

CREATE TABLE countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(2) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  region VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_countries_code ON countries(code);

CREATE TABLE counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id UUID NOT NULL REFERENCES countries(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  population INTEGER,
  area_sq_km DECIMAL(10, 2),
  geographic_center GEOGRAPHY(POINT, 4326),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(country_id, code)
);

CREATE INDEX idx_counties_country ON counties(country_id);
CREATE INDEX idx_counties_geographic_center ON counties USING GIST(geographic_center);

CREATE TABLE sub_counties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county_id UUID NOT NULL REFERENCES counties(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  population INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(county_id, code)
);

CREATE INDEX idx_sub_counties_county ON sub_counties(county_id);

CREATE TABLE wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_county_id UUID NOT NULL REFERENCES sub_counties(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  population INTEGER,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(sub_county_id, code)
);

CREATE INDEX idx_wards_sub_county ON wards(sub_county_id);

-- ============================================================================
-- FACILITIES
-- ============================================================================

CREATE TABLE facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  ward_id UUID NOT NULL REFERENCES wards(id) ON DELETE RESTRICT,
  facility_type facility_type_enum NOT NULL,
  ownership ownership_enum NOT NULL,
  tier_level INTEGER CHECK (tier_level BETWEEN 1 AND 6),
  bed_capacity INTEGER,
  staff_count INTEGER,
  serves_population INTEGER,
  has_emergency_services BOOLEAN DEFAULT false,
  has_maternity_services BOOLEAN DEFAULT false,
  has_surgery_capacity BOOLEAN DEFAULT false,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  contact_phone VARCHAR(50),
  contact_email VARCHAR(255),
  status facility_status_enum DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_facilities_code ON facilities(code);
CREATE INDEX idx_facilities_ward ON facilities(ward_id);
CREATE INDEX idx_facilities_type ON facilities(facility_type);
CREATE INDEX idx_facilities_status ON facilities(status);
CREATE INDEX idx_facilities_location ON facilities USING GIST(location);
CREATE INDEX idx_facilities_geographic_lookup ON facilities(ward_id, facility_type, status);

CREATE TABLE facility_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
  service_type service_type_enum NOT NULL,
  is_operational BOOLEAN DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(facility_id, service_type)
);

CREATE INDEX idx_facility_services_facility ON facility_services(facility_id);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON countries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counties_updated_at BEFORE UPDATE ON counties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_counties_updated_at BEFORE UPDATE ON sub_counties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wards_updated_at BEFORE UPDATE ON wards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE countries IS 'Top-level geographic entity (e.g., Kenya)';
COMMENT ON TABLE counties IS 'Second-level administrative divisions (47 in Kenya)';
COMMENT ON TABLE sub_counties IS 'Third-level administrative divisions';
COMMENT ON TABLE wards IS 'Fourth-level administrative divisions (lowest level)';
COMMENT ON TABLE facilities IS 'Healthcare facilities with comprehensive metadata';
COMMENT ON TABLE facility_services IS 'Services offered by facilities';
