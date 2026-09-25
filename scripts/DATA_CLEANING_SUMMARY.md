# Facility Data Cleaning Summary

## Overview

This document summarizes the facility data cleaning and deduplication process implemented for PathwaysHealth.

## Data Sources Reviewed

### 1. Energy Data API
- **URL**: `https://energydata.info/api/3/action/datastore_search?resource_id=841097c2-9424-4c90-b1e7-8e942a817c3c`
- **Total Records**: ~10,013 facilities
- **Fields**: Facility_N, Type, Owner, County, Sub_County, Location, Latitude, Longitude
- **Quality**: High - includes coordinates and detailed location data

### 2. Google Sheets CSV
- **URL**: `https://docs.google.com/spreadsheets/d/e/2PACX-1vQdQys3Pb_5PGDNUXdx6jLuVyJj7NudnTd2rRkWu04gN9-UNZgeC1VHZ9fTp8mvX_RIAAJYq-2WLpH-/pub?output=csv`
- **Total Records**: ~14,931 facilities
- **Fields**: FacilityName, RegNo, Address, FacilityType, Level, County, Status
- **Quality**: Medium - includes registration numbers but limited location data

### 3. Local JSONL File
- **Path**: `data/dataset_facilities.jsonl`
- **Total Records**: ~1,213 facilities
- **Fields**: Scraped HTML from KMHFR with detailed facility information
- **Quality**: High - comprehensive data but requires parsing

## Cleaning Process

### 1. Data Normalization
- **Name Normalization**: Removes common prefixes/suffixes, special characters, normalizes whitespace
- **County Normalization**: Standardizes county names (removes "County" suffix, handles variations)
- **Type Mapping**: Maps various facility type names to standardized enum values
- **Ownership Mapping**: Maps ownership categories to standardized enum values
- **Status Mapping**: Maps status values to standardized enum values

### 2. Deduplication Strategy

The script uses a multi-layered deduplication approach:

#### a. Name-Based Deduplication
- Normalizes facility names for comparison
- Groups facilities by normalized name
- Checks for exact matches

#### b. Coordinate-Based Deduplication
- Uses coordinate threshold of ~111 meters (0.001 degrees)
- Groups facilities by rounded coordinates
- Identifies facilities at the same location with different names

#### c. Location-Based Deduplication
- Matches facilities by county and similar names
- Used when coordinates are not available

#### d. Source Priority
- API data: Priority 3 (highest)
- CSV data: Priority 2
- JSONL data: Priority 1 (lowest)
- When duplicates are found, data from higher priority sources is preserved

### 3. Data Merging

For facilities identified as duplicates:
- Combines data from all sources
- Preserves highest priority source as base
- Fills missing fields from other sources
- Ensures no data loss during merging

## Database Schema Mapping

### Facilities Table Fields

| Source Field | Database Field | Mapping Logic |
|-------------|---------------|---------------|
| Facility_N / FacilityName | name | Direct mapping |
| RegNo / Registration Number | code | Direct mapping, generates if missing |
| Type / FacilityType | facility_type | Mapped to enum |
| Owner | ownership | Mapped to enum |
| Level | tier_level | Extracted integer (1-6) |
| County | county | Normalized, used to find ward_id |
| Sub_County | sub_county | Normalized |
| Ward / Sub_Locati | ward | Normalized, used to find ward_id |
| Address / Nearest_To | address | Normalized |
| Latitude | latitude | Direct mapping (float) |
| Longitude | longitude | Direct mapping (float) |
| Status | status | Mapped to enum |
| Contact info | contact_phone, contact_email | Direct mapping if available |

### Foreign Key Handling

- **ward_id**: Looked up from existing wards table based on county, sub_county, and ward name
- If ward doesn't exist, attempts to create it (requires county and sub_county to exist)
- Facilities without ward_id are still inserted (can be updated later)

## Output

### 1. Console Output
- Progress updates for each data source
- Deduplication statistics
- Database upsert progress
- Final summary

### 2. JSON File
- **Location**: `data/cleaned_facilities.json`
- **Format**: Array of facility objects
- **Use**: Backup, analysis, or re-import

### 3. Database
- **Table**: `facilities`
- **Upsert Strategy**: Conflict on `code` field
- **Batch Size**: 100 facilities per batch

## Statistics

### Expected Results
- **Total Input**: ~26,157 facilities (10,013 + 14,931 + 1,213)
- **After Deduplication**: Estimated 15,000-20,000 unique facilities
- **Deduplication Rate**: ~20-40% (depending on overlap)

### Quality Metrics
- Facilities with coordinates: ~60-70% (from API and JSONL)
- Facilities with registration numbers: ~50-60% (from CSV)
- Facilities with complete location data: ~40-50%

## Next Steps

1. **Review Results**: Check `cleaned_facilities.json` and database for quality
2. **Update Ward IDs**: For facilities without ward_id, manually match or create wards
3. **Set Geography**: Ensure location geography field is populated from lat/lon
4. **Validation**: Run data quality checks on inserted facilities
5. **Iteration**: Re-run script with improvements based on results

## Script Location

- **Main Script**: `scripts/clean_and_deduplicate_facilities.py`
- **Requirements**: `scripts/requirements.txt`
- **Documentation**: `scripts/README.md`

## Usage

```bash
# Install dependencies
pip install -r scripts/requirements.txt

# Set environment variables
export SUPABASE_URL=your_url
export SUPABASE_SERVICE_ROLE_KEY=your_key

# Run script
python scripts/clean_and_deduplicate_facilities.py
```

## Notes

- The script is idempotent - can be run multiple times safely
- Uses upsert with conflict on `code` field
- Facilities without coordinates can still be inserted
- Ward matching is best-effort - may need manual review



