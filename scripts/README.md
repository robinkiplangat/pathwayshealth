# Facility Data Cleaning and Deduplication

This script cleans and deduplicates facility data from three sources and uploads it to Supabase.

## Data Sources

1. **Energy Data API** (`energydata.info`)
   - ~10,013 facilities
   - Contains: name, type, owner, location, coordinates

2. **Google Sheets CSV**
   - ~14,931 facilities
   - Contains: name, registration number, address, type, level, county, status

3. **Local JSONL File** (`data/dataset_facilities.jsonl`)
   - ~1,213 facilities (scraped from KMHFR)
   - Contains: detailed facility information from Kenya Master Health Facility Registry

## Features

- **Data Normalization**: Standardizes facility names, types, ownership, and status across all sources
- **Deduplication**: Uses multiple strategies:
  - Name matching (normalized)
  - Coordinate-based matching (within ~111 meters)
  - County/location matching
- **Data Merging**: Combines data from multiple sources, prioritizing API > CSV > JSONL
- **Database Integration**: Upserts cleaned data to Supabase with proper foreign key handling

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Create a `.env` file in the project root with:
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Usage

```bash
python scripts/clean_and_deduplicate_facilities.py
```

The script will:
1. Fetch and parse all three data sources
2. Normalize and clean the data
3. Deduplicate facilities
4. Merge data from multiple sources
5. Upsert to Supabase
6. Save cleaned data to `data/cleaned_facilities.json`

## Output

- **Console**: Progress updates and statistics
- **JSON File**: `data/cleaned_facilities.json` - All cleaned facilities in JSON format
- **Database**: Facilities upserted to Supabase `facilities` table

## Data Mapping

### Facility Types
- Hospital → `hospital`
- Health Centre/Center → `health_center`
- Dispensary → `dispensary`
- Clinic/Medical Centre → `clinic`
- Specialized Hospital → `specialized_hospital`
- Referral Hospital → `referral_hospital`

### Ownership
- Ministry of Health/Government → `public`
- Private Practice/Enterprise → `private`
- Faith Based/Christian Health Association → `faith_based`
- NGO/Non-Governmental Organization → `ngo`
- Community → `community`

### Status
- Active/Operational → `active`
- Inactive/Closed → `inactive`
- Under Construction → `under_construction`
- Temporarily Closed → `temporarily_closed`

## Notes

- Facilities without ward_id will still be inserted (ward_id can be updated later)
- The script uses `code` field for conflict resolution during upsert
- Coordinate-based deduplication uses a threshold of ~111 meters
- Name normalization removes common prefixes/suffixes and special characters



