-- ============================================================================
-- Sample Data Loading Script for Kenya Pilot
-- Demonstrates database structure with realistic sample data
-- ============================================================================

-- Note: For production, you would load all 47 counties, ~300 sub-counties,
-- ~1,500 wards, and 15,000 facilities from official Kenya MFL data

BEGIN;

-- ============================================================================
-- 1. GEOGRAPHIC HIERARCHY - Kenya Setup
-- ============================================================================

-- Insert Kenya
INSERT INTO countries (code, name, region) VALUES
('KE', 'Kenya', 'Eastern Africa')
ON CONFLICT (code) DO NOTHING;

-- Sample Counties (10 of 47 for demonstration)
-- In production, load all 47 counties from official data
WITH kenya_country AS (
  SELECT id FROM countries WHERE code = 'KE'
)
INSERT INTO counties (country_id, code, name, population, area_sq_km, geographic_center)
SELECT 
  kc.id,
  c.code,
  c.name,
  c.population,
  c.area_sq_km,
  ST_SetSRID(ST_MakePoint(c.lng, c.lat), 4326)::geography
FROM kenya_country kc
CROSS JOIN (VALUES
  ('01', 'Nairobi', 4397073, 696.1, 36.8219, -1.2921),
  ('02', 'Mombasa', 1208333, 229.7, 39.6682, -4.0435),
  ('03', 'Kwale', 866820, 8270.3, 39.4605, -4.1820),
  ('04', 'Kilifi', 1453787, 12245.9, 39.9094, -3.5107),
  ('05', 'Nakuru', 2162202, 7495.1, 36.0667, -0.3031),
  ('06', 'Kisumu', 1155574, 2085.9, 34.7680, -0.0917),
  ('07', 'Kiambu', 2417735, 2449.2, 36.8356, -1.0313),
  ('08', 'Machakos', 1421932, 6208.2, 37.2634, -1.5177),
  ('09', 'Makueni', 987653, 8008.9, 37.6236, -2.2741),
  ('10', 'Kajiado', 1117840, 21292.7, 36.7820, -2.0982)
) AS c(code, name, population, area_sq_km, lng, lat)
ON CONFLICT (country_id, code) DO NOTHING;

-- Sample Sub-Counties (3 per county for demo = 30 total)
-- In production, load all ~300 sub-counties
INSERT INTO sub_counties (county_id, code, name, population)
SELECT 
  co.id,
  sc.code,
  sc.name,
  sc.population
FROM counties co
CROSS JOIN LATERAL (VALUES
  (co.code || '-01', co.name || ' Central', co.population / 3),
  (co.code || '-02', co.name || ' East', co.population / 3),
  (co.code || '-03', co.name || ' West', co.population / 3)
) AS sc(code, name, population)
WHERE co.code IN ('01', '02', '03', '04', '05', '06', '07', '08', '09', '10')
ON CONFLICT (county_id, code) DO NOTHING;

-- Sample Wards (5 per sub-county for demo = 150 total)
-- In production, load all ~1,500 wards
INSERT INTO wards (sub_county_id, code, name, population)
SELECT 
  sc.id,
  w.code,
  w.name,
  w.population
FROM sub_counties sc
CROSS JOIN LATERAL (VALUES
  (sc.code || '-W1', sc.name || ' Ward 1', sc.population / 5),
  (sc.code || '-W2', sc.name || ' Ward 2', sc.population / 5),
  (sc.code || '-W3', sc.name || ' Ward 3', sc.population / 5),
  (sc.code || '-W4', sc.name || ' Ward 4', sc.population / 5),
  (sc.code || '-W5', sc.name || ' Ward 5', sc.population / 5)
) AS w(code, name, population)
LIMIT 150
ON CONFLICT (sub_county_id, code) DO NOTHING;

-- ============================================================================
-- 2. SAMPLE FACILITIES (50 for demonstration)
-- In production, load all 15,000+ facilities from Kenya Master Facility List
-- ============================================================================

INSERT INTO facilities (
  code, name, ward_id, facility_type, ownership, tier_level,
  bed_capacity, staff_count, serves_population,
  has_emergency_services, has_maternity_services, has_surgery_capacity,
  latitude, longitude, location, address, contact_phone, contact_email, status
)
SELECT 
  'MFL-' || LPAD((row_number() OVER ())::text, 6, '0'),
  f.name,
  (SELECT id FROM wards ORDER BY RANDOM() LIMIT 1),
  f.facility_type::facility_type_enum,
  f.ownership::ownership_enum,
  f.tier_level,
  f.bed_capacity,
  f.staff_count,
  f.serves_population,
  f.has_emergency,
  f.has_maternity,
  f.has_surgery,
  f.lat,
  f.lng,
  ST_SetSRID(ST_MakePoint(f.lng, f.lat), 4326)::geography,
  f.address,
  f.phone,
  f.email,
  'active'::facility_status_enum
FROM (VALUES
  -- Nairobi facilities
  ('Kenyatta National Hospital', 'hospital', 'public', 6, 1800, 450, 500000, true, true, true, -1.3006, 36.8070, 'Hospital Rd, Nairobi', '+254-20-2726300', 'info@knh.go.ke'),
  ('Nairobi West Hospital', 'hospital', 'private', 5, 150, 120, 150000, true, true, true, -1.3118, 36.8029, 'Argwings Kodhek Rd, Nairobi', '+254-20-3860000', 'info@nbiwest.com'),
  ('Mbagathi County Hospital', 'hospital', 'public', 4, 200, 80, 200000, true, true, false, -1.3142, 36.7521, 'Mbagathi Way, Nairobi', '+254-20-6003500', 'info@mbagathi.go.ke'),
  ('Karen Hospital', 'hospital', 'private', 5, 180, 100, 120000, true, true, true, -1.3198, 36.7074, 'Karen Rd, Nairobi', '+254-719-079000', 'info@karenhospital.org'),
  ('Eastleigh Health Centre', 'health_center', 'public', 3, 30, 25, 80000, false, true, false, -1.2742, 36.8445, '1st Avenue, Eastleigh', '+254-722-345678', 'eastleigh.hc@nairobi.go.ke'),
  
  -- Mombasa facilities
  ('Coast General Hospital', 'hospital', 'public', 5, 400, 150, 300000, true, true, true, -4.0563, 39.6631, 'Moi Avenue, Mombasa', '+254-41-2314204', 'info@coastgeneral.go.ke'),
  ('Mombasa Hospital', 'hospital', 'private', 4, 120, 60, 100000, true, true, true, -4.0547, 39.6668, 'Mbaruk Hinawy Rd, Mombasa', '+254-41-2227700', 'info@mombasahospital.com'),
  ('Port Reitz Health Centre', 'health_center', 'public', 3, 25, 20, 60000, false, true, false, -4.0798, 39.6195, 'Port Reitz Rd, Mombasa', '+254-722-334455', 'portreitz.hc@mombasa.go.ke'),
  
  -- Kwale facilities
  ('Msambweni County Referral Hospital', 'hospital', 'public', 4, 150, 70, 150000, true, true, false, -4.4694, 39.4833, 'Msambweni Town', '+254-725-123456', 'msambweni@kwale.go.ke'),
  ('Kwale District Hospital', 'hospital', 'public', 4, 100, 50, 120000, true, true, false, -4.1746, 39.4520, 'Kwale Town', '+254-727-234567', 'kwale@kwale.go.ke'),
  
  -- Kilifi facilities  
  ('Kilifi County Hospital', 'hospital', 'public', 5, 300, 120, 250000, true, true, true, -3.6310, 39.8492, 'Malindi Rd, Kilifi', '+254-41-7522063', 'info@kilifihospital.go.ke'),
  ('Malindi Sub-County Hospital', 'hospital', 'public', 4, 120, 60, 100000, true, true, false, -3.2167, 40.1167, 'Hospital Rd, Malindi', '+254-42-2030231', 'malindi@kilifi.go.ke'),
  
  -- Nakuru facilities
  ('Nakuru Level 5 Hospital', 'hospital', 'public', 5, 500, 200, 400000, true, true, true, -0.2827, 36.0667, 'Hospital Rd, Nakuru', '+254-51-2211502', 'info@nakuruhospital.go.ke'),
  ('War Memorial Hospital', 'hospital', 'private', 4, 100, 50, 80000, true, true, true, -0.2803, 36.0649, 'Kenyatta Ave, Nakuru', '+254-51-2212089', 'info@warmemorial.co.ke'),
  ('Bahati Health Centre', 'health_center', 'public', 3, 20, 15, 50000, false, true, false, -0.2945, 36.0445, 'Bahati, Nakuru', '+254-722-456789', 'bahati.hc@nakuru.go.ke'),
  
  -- Kisumu facilities
  ('Jaramogi Oginga Odinga Teaching Hospital', 'hospital', 'public', 6, 650, 280, 600000, true, true, true, -0.0917, 34.7680, 'Nairobi Rd, Kisumu', '+254-57-2020840', 'info@jootrh.go.ke'),
  ('Aga Khan Hospital Kisumu', 'hospital', 'private', 5, 100, 60, 100000, true, true, true, -0.0882, 34.7561, 'Aga Khan Rd, Kisumu', '+254-57-2022598', 'kisumu@akhs.org'),
  ('Kondele Health Centre', 'health_center', 'public', 3, 25, 18, 70000, false, true, false, -0.0845, 34.7445, 'Kondele, Kisumu', '+254-722-567890', 'kondele.hc@kisumu.go.ke'),
  
  -- Kiambu facilities
  ('Kiambu Level 4 Hospital', 'hospital', 'public', 4, 150, 70, 150000, true, true, false, -1.1714, 36.8356, 'Hospital Rd, Kiambu', '+254-66-22022', 'info@kiambuhospital.go.ke'),
  ('Thika Level 5 Hospital', 'hospital', 'public', 5, 300, 140, 300000, true, true, true, -1.0332, 37.0693, 'Hospital Rd, Thika', '+254-67-21155', 'info@thikahospital.go.ke'),
  ('Ruiru Health Centre', 'health_center', 'public', 3, 30, 22, 90000, false, true, false, -1.1489, 36.9612, 'Ruiru Town', '+254-722-678901', 'ruiru.hc@kiambu.go.ke'),
  
  -- Machakos facilities
  ('Machakos Level 5 Hospital', 'hospital', 'public', 5, 250, 110, 250000, true, true, true, -1.5177, 37.2634, 'Hospital Hill, Machakos', '+254-44-21301', 'info@machakoshospital.go.ke'),
  ('Kangundo Health Centre', 'health_center', 'public', 3, 20, 16, 60000, false, true, false, -1.2967, 37.3456, 'Kangundo Town', '+254-722-789012', 'kangundo.hc@machakos.go.ke'),
  
  -- Makueni facilities
  ('Makueni County Referral Hospital', 'hospital', 'public', 5, 200, 90, 200000, true, true, false, -1.8038, 37.6236, 'Wote Town', '+254-44-22156', 'info@makuenihospital.go.ke'),
  ('Makindu Sub-County Hospital', 'hospital', 'public', 4, 80, 40, 80000, true, true, false, -2.2833, 37.8333, 'Makindu Town', '+254-722-890123', 'makindu@makueni.go.ke'),
  
  -- Kajiado facilities
  ('Kajiado County Referral Hospital', 'hospital', 'public', 5, 180, 85, 180000, true, true, false, -1.8521, 36.7820, 'Hospital Rd, Kajiado', '+254-45-22012', 'info@kajiadohospital.go.ke'),
  ('Loitokitok Sub-County Hospital', 'hospital', 'public', 4, 70, 35, 70000, true, true, false, -2.8833, 37.5333, 'Loitokitok Town', '+254-722-901234', 'loitokitok@kajiado.go.ke'),
  
  -- Additional dispensaries and clinics across counties
  ('Githurai Dispensary', 'dispensary', 'public', 2, 0, 8, 30000, false, false, false, -1.1542, 36.8975, 'Githurai 44, Kiambu', '+254-722-111222', 'githurai.disp@kiambu.go.ke'),
  ('Mlolongo Dispensary', 'dispensary', 'public', 2, 0, 6, 25000, false, false, false, -1.3500, 36.9667, 'Mlolongo, Machakos', '+254-722-222333', 'mlolongo.disp@machakos.go.ke'),
  ('Ngong Health Centre', 'health_center', 'public', 3, 20, 15, 50000, false, true, false, -1.3500, 36.6667, 'Ngong Town, Kajiado', '+254-722-333444', 'ngong.hc@kajiado.go.ke'),
  ('Ukunda Health Centre', 'health_center', 'public', 3, 25, 18, 60000, false, true, false, -4.2833, 39.5667, 'Ukunda, Kwale', '+254-722-444555', 'ukunda.hc@kwale.go.ke'),
  ('Watamu Dispensary', 'dispensary', 'public', 2, 0, 7, 20000, false, false, false, -3.3667, 40.0167, 'Watamu, Kilifi', '+254-722-555666', 'watamu.disp@kilifi.go.ke'),
  ('Molo Health Centre', 'health_center', 'public', 3, 22, 16, 55000, false, true, false, -0.2500, 35.7333, 'Molo Town, Nakuru', '+254-722-666777', 'molo.hc@nakuru.go.ke'),
  ('Ahero Health Centre', 'health_center', 'public', 3, 18, 14, 45000, false, true, false, -0.1667, 34.9167, 'Ahero, Kisumu', '+254-722-777888', 'ahero.hc@kisumu.go.ke'),
  ('Likoni Subcounty Hospital', 'hospital', 'public', 4, 90, 45, 90000, true, true, false, -4.0833, 39.6667, 'Likoni, Mombasa', '+254-722-888999', 'likoni@mombasa.go.ke'),
  
  -- Faith-based and private facilities
  ('Nazareth Hospital', 'hospital', 'faith_based', 4, 120, 55, 100000, true, true, true, -1.1667, 36.9500, 'Limuru Rd, Kiambu', '+254-66-76001', 'info@nazarethhospital.org'),
  ('St. Luke''s Dispensary', 'dispensary', 'faith_based', 2, 0, 5, 15000, false, false, false, -1.5000, 37.3000, 'Tala, Machakos', '+254-722-999000', 'stlukes@church.org'),
  ('Mariakani Cottage Hospital', 'clinic', 'private', 3, 40, 20, 40000, false, true, false, -3.8667, 39.4667, 'Mariakani, Kilifi', '+254-722-000111', 'info@mariakani.clinic'),
  ('Shimba Hills Clinic', 'clinic', 'ngo', 2, 0, 8, 20000, false, false, false, -4.2167, 39.3833, 'Shimba Hills, Kwale', '+254-722-111000', 'shimba@ngo.org'),
  ('Gilgil Health Centre', 'health_center', 'public', 3, 20, 15, 50000, false, true, false, -0.5000, 36.3167, 'Gilgil, Nakuru', '+254-722-222111', 'gilgil.hc@nakuru.go.ke'),
  ('Kibera Community Clinic', 'clinic', 'ngo', 2, 0, 10, 50000, false, false, false, -1.3133, 36.7833, 'Kibera, Nairobi', '+254-722-333222', 'kibera@community.org'),
  ('Kitengela Health Centre', 'health_center', 'public', 3, 25, 18, 65000, false, true, false, -1.4500, 36.9500, 'Kitengela, Kajiado', '+254-722-444333', 'kitengela.hc@kajiado.go.ke'),
  ('Voi County Hospital', 'hospital', 'public', 4, 100, 50, 100000, true, true, false, -3.3958, 38.5567, 'Hospital Rd, Voi', '+254-722-555444', 'voi@taita.go.ke'),
  ('Hola Health Centre', 'health_center', 'public', 3, 18, 14, 40000, false, true, false, -1.5000, 40.0333, 'Hola Town', '+254-722-666555', 'hola.hc@tana.go.ke'),
  ('Garissa Provincial Hospital', 'hospital', 'public', 5, 250, 100, 250000, true, true, false, -0.4500, 39.6333, 'Hospital Rd, Garissa','+254-722-777666', 'info@garissahospital.go.ke'),
  ('Wajir County Referral Hospital', 'hospital', 'public', 5, 200, 80, 200000, true, true, false, 1.7500, 40.0667, 'Hospital Rd, Wajir', '+254-722-888777', 'info@wajirhospital.go.ke'),
  ('Mandera County Referral Hospital', 'hospital', 'public', 5, 180, 75, 180000, true, true, false, 3.9333, 41.8667, 'Hospital Rd, Mandera', '+254-722-999888', 'info@manderahospital.go.ke')
) AS f(name, facility_type, ownership, tier_level, bed_capacity, staff_count, serves_population, has_emergency, has_maternity, has_surgery, lat, lng, address, phone, email)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 3. FACILITY SERVICES
-- ============================================================================

-- Add services to larger facilities
INSERT INTO facility_services (facility_id, service_type, is_operational)
SELECT 
  f.id,
  s.service_type::service_type_enum,
  true
FROM facilities f
CROSS JOIN LATERAL (
  SELECT UNNEST(ARRAY[
    'cold_chain',
    'pharmacy',
    'laboratory'
  ]) AS service_type
  WHERE f.tier_level >= 3
  UNION ALL
  SELECT UNNEST(ARRAY[
    'surgery',
    'icu',
    'imaging',
    'blood_bank'
  ]) AS service_type
  WHERE f.tier_level >= 5
  UNION ALL
  SELECT 'dialysis'::text AS service_type
  WHERE f.tier_level = 6
  UNION ALL
  SELECT 'ambulance'::text AS service_type
  WHERE f.has_emergency_services
) s
ON CONFLICT (facility_id, service_type) DO NOTHING;

-- ============================================================================
-- 4. REGIONAL HAZARD PROFILES
-- ============================================================================

-- Assign hazard risk profiles to each county
INSERT INTO regional_hazard_profiles (county_id, hazard, risk_level, frequency_score, intensity_score, trend, data_source, last_updated)
SELECT 
  c.id,
  h.hazard::hazard_enum,
  h.risk_level::risk_level_enum,
  h.frequency,
  h.intensity,
  h.trend::trend_enum,
  'Kenya Meteorological Department',
  CURRENT_DATE
FROM counties c
CROSS JOIN LATERAL (VALUES
  -- Nairobi: Urban flooding, storms
  ('floods', 'high', 4, 4, 'increasing'),
  ('storms', 'moderate', 3, 3, 'stable'),
  ('heatwave', 'moderate', 3, 3, 'increasing'),
  ('drought', 'moderate', 2, 3, 'stable'),
  ('sea_level_rise', 'low', 1, 1, 'stable'),
  ('wildfire', 'low', 1, 2, 'stable'),
  ('coldwave', 'low', 1, 1, 'stable')
) h(hazard, risk_level, frequency, intensity, trend)
WHERE c.name = 'Nairobi'
UNION ALL
-- Mombasa & Kwale & Kilifi: Coastal hazards
SELECT c.id, h.hazard::hazard_enum, h.risk_level::risk_level_enum, h.frequency, h.intensity, h.trend::trend_enum, 'Kenya Meteorological Department', CURRENT_DATE
FROM counties c
CROSS JOIN LATERAL (VALUES
  ('floods', 'extreme', 5, 5, 'increasing'),
  ('storms', 'high', 4, 4, 'increasing'),
  ('sea_level_rise', 'extreme', 5, 5, 'increasing'),
  ('heatwave', 'high', 4, 4, 'increasing'),
  ('drought', 'moderate', 3, 3, 'stable'),
  ('wildfire', 'low', 1, 2, 'stable'),
  ('coldwave', 'low', 1, 1, 'stable')
) h(hazard, risk_level, frequency, intensity, trend)
WHERE c.name IN ('Mombasa', 'Kwale', 'Kilifi')
UNION ALL
-- Arid regions (Kajiado, Makueni): Drought, heatwave
SELECT c.id, h.hazard::hazard_enum, h.risk_level::risk_level_enum, h.frequency, h.intensity, h.trend::trend_enum, 'Kenya Meteorological Department', CURRENT_DATE
FROM counties c
CROSS JOIN LATERAL (VALUES
  ('drought', 'extreme', 5, 5, 'increasing'),
  ('heatwave', 'extreme', 5, 5, 'increasing'),
  ('floods', 'moderate', 2, 3, 'stable'),
  ('storms', 'moderate', 2, 3, 'stable'),
  ('wildfire', 'moderate', 3, 3, 'increasing'),
  ('sea_level_rise', 'low', 1, 1, 'stable'),
  ('coldwave', 'low', 1, 1, 'stable')
) h(hazard, risk_level, frequency, intensity, trend)
WHERE c.name IN ('Kajiado', 'Makueni')
UNION ALL
-- Lake regions (Kisumu): Flooding, storms
SELECT c.id, h.hazard::hazard_enum, h.risk_level::risk_level_enum, h.frequency, h.intensity, h.trend::trend_enum, 'Kenya Meteorological Department', CURRENT_DATE
FROM counties c
CROSS JOIN LATERAL (VALUES
  ('floods', 'high', 4, 4, 'increasing'),
  ('storms', 'high', 4, 4, 'stable'),
  ('heatwave', 'moderate', 3, 3, 'increasing'),
  ('drought', 'moderate', 3, 3, 'stable'),
  ('wildfire', 'low', 2, 2, 'stable'),
  ('sea_level_rise', 'low', 1, 1, 'stable'),
  ('coldwave', 'low', 1, 1, 'stable')
) h(hazard, risk_level, frequency, intensity, trend)
WHERE c.name = 'Kisumu'
UNION ALL
-- Highland regions (Nakuru, Kiambu, Machakos): Mixed hazards
SELECT c.id, h.hazard::hazard_enum, h.risk_level::risk_level_enum, h.frequency, h.intensity, h.trend::trend_enum, 'Kenya Meteorological Department', CURRENT_DATE
FROM counties c
CROSS JOIN LATERAL (VALUES
  ('floods', 'moderate', 3, 3, 'stable'),
  ('storms', 'moderate', 3, 3, 'stable'),
  ('heatwave', 'moderate', 3, 3, 'increasing'),
  ('drought', 'moderate', 3, 3, 'stable'),
  ('wildfire', 'low', 2, 2, 'stable'),
  ('sea_level_rise', 'low', 1, 1, 'stable'),
  ('coldwave', 'moderate', 2, 2, 'stable')
) h(hazard, risk_level, frequency, intensity, trend)
WHERE c.name IN ('Nakuru', 'Kiambu', 'Machakos')
ON CONFLICT (county_id, hazard) DO NOTHING;

-- ============================================================================
-- 5. SAMPLE VULNERABILITY QUESTIONS (Floods only, for demo)
-- In production, load all ~1,200 questions from assessment framework
-- ============================================================================

-- Sample questions for Floods hazard across all 4 pillars
INSERT INTO vulnerability_questions (code, text, hazard, pillar, category, is_critical, weight, display_order)
VALUES
  -- Workforce - Human Resources
  ('FL_WF_HR_01', 'Is the health workforce provided with programmes for supporting staff with regards to mental health, injuries, medical treatment and related support measures?', 'floods', 'workforce', 'Human Resources', true, 2, 1),
  ('FL_WF_HR_02', 'Is the health workforce equipped with an emergency plan for shift relay or replacement of health professionals to ensure that staff get adequate rest?', 'floods', 'workforce', 'Human Resources', true, 2, 2),
  ('FL_WF_HR_03', 'Is the health workforce provided with full personal protective equipment, especially for clean-up crews (including waterproof safety boots, goggles, work gloves and masks)?', 'floods', 'workforce', 'Human Resources', true, 2, 3),
  
  -- Workforce - Capacity Development
  ('FL_WF_CD_01', 'Is the health workforce trained on public health and climate change hazards including health impacts related to floods?', 'floods', 'workforce', 'Capacity Development', false, 1, 10),
  ('FL_WF_CD_02', 'Is the health workforce equipped with knowledge, experience, training and resources to manage flood risk reduction at the facility and in the local communities?', 'floods', 'workforce', 'Capacity Development', true, 2, 11),
  
  -- WASH - Monitoring and Assessment
  ('FL_WA_MA_01', 'Does the health care facility verify water safety conditions, including updated risk assessments to map water resources and water supplies for the facility?', 'floods', 'wash', 'Monitoring and Assessment', true, 2, 20),
  ('FL_WA_MA_02', 'Does the health care facility have a quality monitoring plan for drinking water during and after the event?', 'floods', 'wash', 'Monitoring and Assessment', false, 1, 21),
  
  -- WASH - Risk Management
  ('FL_WA_RM_01', 'Does the health care facility have chemical, radioactive and biological hazardous waste stored in a safe place and on a level above the ground floor?', 'floods', 'wash', 'Risk Management', true, 3, 30),
  ('FL_WA_RM_02', 'Does the health care facility have water storage tanks appropriately covered to prevent access or contamination, and safety located for flooding events?', 'floods', 'wash', 'Risk Management', true, 2, 31),
  ('FL_WA_RM_03', 'Does the health care facility have nonreturn valves installed on water supply pipes to prevent backflows?', 'floods', 'wash', 'Risk Management', true, 2, 32),
  
  -- Energy - Monitoring and Assessment
  ('FL_EN_MA_01', 'Does the health care facility regularly assess its energy system to ensure that it can cope with flood events?', 'floods', 'energy', 'Monitoring and Assessment', true, 2, 40),
  ('FL_EN_MA_02', 'Does the health care facility have an emergency backup generator (including fuel, where relevant) that is able to cover at least all critical service areas and equipment during and after a flood event?', 'floods', 'energy', 'Monitoring and Assessment', true, 3, 41),
  ('FL_EN_MA_03', 'Does the health care facility periodically check emergency backup generators (including fuel, where relevant)?', 'floods', 'energy', 'Monitoring and Assessment', true, 2, 42),
  
  -- Energy - Risk Management
  ('FL_EN_RM_01', 'Does the health care facility have a secure place to protect the backup generator (e.g. an elevated place; including fuel or battery storage, where relevant) from flood waters?', 'floods', 'energy', 'Risk Management', true, 3, 50),
  ('FL_EN_RM_02', 'Does the health care facility have adequate daylight to ensure proper visibility during a power outage?', 'floods', 'energy', 'Risk Management', false, 1, 51),
  
  -- Infrastructure - Adaptation
  ('FL_IN_AD_01', 'Does the health care facility have knowledge, experience (considering previous damages) and resources (including human, material, financial, supplies chain and logistics) to manage flood risk reduction?', 'floods', 'infrastructure', 'Adaptation of Current Systems', true, 2, 60),
  ('FL_IN_AD_02', 'Does the health care facility have a safe location for critical services and equipment in a flood emergency situation?', 'floods', 'infrastructure', 'Adaptation of Current Systems', true, 3, 61),
  ('FL_IN_AD_03', 'Does the health care facility have a contingency plan in place for safe and efficient personnel evacuation (including health staff and patients) before, during and following a flood?', 'floods', 'infrastructure', 'Adaptation of Current Systems', true, 3, 62),
  ('FL_IN_AD_04', 'Does the health care facility ensure removal of equipment and power supplies from basements and ground floor level to avoid damage from flooding?', 'floods', 'infrastructure', 'Adaptation of Current Systems', true, 2, 63),
  
  -- Infrastructure - Sustainability
  ('FL_IN_SU_01', 'Does the health care facility have a defined and sustained budget as part of core budgeting for emergency preparedness and response to flood events?', 'floods', 'infrastructure', 'Sustainability of Operations', true, 2, 70),
  ('FL_IN_SU_02', 'Does the health care facility have a secure plan to ensure continuity of the facility''s supply and delivery chain?', 'floods', 'infrastructure', 'Sustainability of Operations', true, 2, 71)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- 6. SAMPLE IMPACT STATEMENTS (Floods only, for demo)
-- ============================================================================

INSERT INTO impact_statements (code, text, hazard, pillar, category, display_order)
VALUES
  -- Workforce impacts
  ('FL_WF_IM_01', 'Health workers are injured, fall ill, or experience psychological distress during flood response', 'floods', 'workforce', 'Health Workforce Safety', 1),
  ('FL_WF_IM_02', 'Inadequate staffing levels due to inability of health workers to reach facility during floods', 'floods', 'workforce', 'Human Resources', 2),
  ('FL_WF_IM_03', 'Health workers lack knowledge or training to respond effectively to flood-related health impacts', 'floods', 'workforce', 'Capacity Development', 3),
  
  -- WASH impacts
  ('FL_WA_IM_01', 'Contamination of water supply leading to waterborne disease outbreaks', 'floods', 'wash', 'Water Safety', 10),
  ('FL_WA_IM_02', 'Sewage system overflow contaminating facility environment and water sources', 'floods', 'wash', 'Sanitation Systems', 11),
  ('FL_WA_IM_03', 'Loss of safe water supply, compromising hygiene, sanitation, and medical procedures', 'floods', 'wash', 'Water Supply', 12),
  ('FL_WA_IM_04', 'Hazardous waste exposure due to flooding of waste storage areas', 'floods', 'wash', 'Waste Management', 13),
  
  -- Energy impacts
  ('FL_EN_IM_01', 'Power failure leading to cessation of critical services (surgery, dialysis, emergency care)', 'floods', 'energy', 'Service Disruption', 20),
  ('FL_EN_IM_02', 'Loss of refrigeration causing spoilage of vaccines, medicines, and blood products', 'floods', 'energy', 'Cold Chain', 21),
  ('FL_EN_IM_03', 'Damage to backup generators or fuel supplies due to flood waters', 'floods', 'energy', 'Backup Systems', 22),
  
  -- Infrastructure impacts
  ('FL_IN_IM_01', 'Flood damage or destruction of structural components (walls, foundations, roofs)', 'floods', 'infrastructure', 'Structural Integrity', 30),
  ('FL_IN_IM_02', 'Damage to medical equipment and supplies stored in flood-prone areas', 'floods', 'infrastructure', 'Equipment and Supplies', 31),
  ('FL_IN_IM_03', 'Inability to evacuate patients safely during flood emergency', 'floods', 'infrastructure', 'Emergency Evacuation', 32),
  ('FL_IN_IM_04', 'Supply chain disruption preventing delivery of essential medicines and supplies', 'floods', 'infrastructure', 'Supply Chain', 33),
  ('FL_IN_IM_05', 'Facility access roads flooded, preventing patient access and staff arrival', 'floods', 'infrastructure', 'Accessibility', 34)
ON CONFLICT (code) DO NOTHING;

COMMIT;
