#!/usr/bin/env python3
"""
Facility Data Cleaning and Deduplication Script

This script:
1. Fetches facility data from three sources:
   - Energy Data API (energydata.info)
   - Google Sheets CSV
   - Local JSONL file (KMHFR scraped data)
2. Normalizes and cleans the data
3. Deduplicates facilities using name, coordinates, and location matching
4. Maps to Supabase facilities table schema
5. Upserts cleaned data into Supabase
"""

import json
import csv
import re
import sys
import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Set
from collections import defaultdict
from dataclasses import dataclass, asdict
from urllib.request import urlopen
from urllib.parse import urlparse
import unicodedata

# Code root directory (parent of scripts)
CODE_ROOT = Path(__file__).parent.parent

# Add code root to path for imports
sys.path.insert(0, str(CODE_ROOT))

try:
    from supabase import create_client, Client
    from dotenv import load_dotenv
    # Load .env from code directory (root of codebase)
    env_path = CODE_ROOT / ".env"
    if env_path.exists():
        load_dotenv(env_path)
        print(f"Loaded .env from: {env_path}")
    else:
        load_dotenv()  # Fallback to default locations
        print("Warning: .env file not found in code directory")
    SUPABASE_AVAILABLE = True
except ImportError:
    print("Warning: supabase-py not installed. Install with: pip install supabase python-dotenv")
    Client = None
    SUPABASE_AVAILABLE = False

# Constants
ENERGY_DATA_API_URL = "https://energydata.info/api/3/action/datastore_search?resource_id=841097c2-9424-4c90-b1e7-8e942a817c3c&limit=500"
GOOGLE_SHEETS_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQdQys3Pb_5PGDNUXdx6jLuVyJj7NudnTd2rRkWu04gN9-UNZgeC1VHZ9fTp8mvX_RIAAJYq-2WLpH-/pub?output=csv"
JSONL_FILE_PATH = CODE_ROOT / "data" / "dataset_facilities.jsonl"

# Supabase configuration
SUPABASE_URL = os.getenv("SUPABASE_URL", "") or os.getenv("SUPABASE_PROJECT_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY", "") or os.getenv("SUPABASE_API", "")

# Distance threshold for coordinate-based deduplication (in degrees, ~111km per degree)
COORDINATE_THRESHOLD = 0.001  # ~111 meters

@dataclass
class FacilityRecord:
    """Normalized facility record"""
    name: str
    code: Optional[str] = None
    facility_type: Optional[str] = None
    ownership: Optional[str] = None
    tier_level: Optional[int] = None
    county: Optional[str] = None
    sub_county: Optional[str] = None
    ward: Optional[str] = None
    location: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bed_capacity: Optional[int] = None
    status: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    registration_number: Optional[str] = None
    source: Optional[str] = None  # 'api', 'csv', 'jsonl'
    source_id: Optional[str] = None  # Original ID from source
    
    def normalize_name(self) -> str:
        """Normalize facility name for comparison"""
        name = self.name.strip().upper()
        # Remove common prefixes/suffixes
        name = re.sub(r'^(THE|A|AN)\s+', '', name)
        name = re.sub(r'\s+(HOSPITAL|CLINIC|DISPENSARY|HEALTH CENTER|HEALTH CENTRE|MEDICAL CENTER|MEDICAL CENTRE)$', '', name)
        # Remove special characters
        name = re.sub(r'[^\w\s]', '', name)
        # Normalize whitespace
        name = re.sub(r'\s+', ' ', name)
        return name.strip()
    
    def get_coordinate_key(self) -> Optional[Tuple[float, float]]:
        """Get rounded coordinate key for deduplication"""
        if self.latitude is not None and self.longitude is not None:
            # Round to ~100m precision
            lat_rounded = round(self.latitude / COORDINATE_THRESHOLD) * COORDINATE_THRESHOLD
            lon_rounded = round(self.longitude / COORDINATE_THRESHOLD) * COORDINATE_THRESHOLD
            return (lat_rounded, lon_rounded)
        return None


def normalize_text(text: str) -> str:
    """Normalize text for comparison"""
    if not text:
        return ""
    # Remove accents and special characters
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    # Convert to uppercase and strip
    text = text.upper().strip()
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    return text


def normalize_county_name(county: str) -> str:
    """Normalize county name"""
    if not county:
        return ""
    county = normalize_text(county)
    # Common variations
    county = county.replace("COUNTY", "").strip()
    return county


def map_facility_type(source_type: str) -> Optional[str]:
    """Map source facility type to Supabase enum"""
    if not source_type:
        return None
    
    source_type = source_type.lower().strip()
    
    # Mapping dictionary
    type_mapping = {
        'hospital': 'hospital',
        'referral hospital': 'referral_hospital',
        'secondary care hospital': 'referral_hospital',
        'primary care hospital': 'hospital',
        'sub-district hospital': 'hospital',
        'district hospital': 'hospital',
        'specialized hospital': 'specialized_hospital',
        'specialized treatment centre': 'specialized_hospital',
        'health centre': 'health_center',
        'health center': 'health_center',
        'basic health centre': 'health_center',
        'comprehensive health centre': 'health_center',
        'dispensary': 'dispensary',
        'clinic': 'clinic',
        'medical clinic': 'clinic',
        'medical centre': 'clinic',
        'medical center': 'clinic',
        'dental clinic': 'clinic',
        'dental centre': 'clinic',
        'nursing home': 'clinic',
        'maternity home': 'clinic',
        'vct centre': 'clinic',
    }
    
    # Try exact match first
    if source_type in type_mapping:
        return type_mapping[source_type]
    
    # Try partial match
    for key, value in type_mapping.items():
        if key in source_type or source_type in key:
            return value
    
    # Default mapping based on keywords
    if 'hospital' in source_type:
        return 'hospital'
    elif 'health centre' in source_type or 'health center' in source_type:
        return 'health_center'
    elif 'dispensary' in source_type:
        return 'dispensary'
    elif 'clinic' in source_type or 'centre' in source_type or 'center' in source_type:
        return 'clinic'
    
    return None


def map_ownership(source_owner: str) -> Optional[str]:
    """Map source ownership to Supabase enum"""
    if not source_owner:
        return None
    
    source_owner = source_owner.lower().strip()
    
    # Mapping dictionary
    ownership_mapping = {
        'ministry of health': 'public',
        'public': 'public',
        'government': 'public',
        'private practice': 'private',
        'private enterprise': 'private',
        'private': 'private',
        'faith based': 'faith_based',
        'faith-based': 'faith_based',
        'christian health association': 'faith_based',
        'ngo': 'ngo',
        'non-governmental organization': 'ngo',
        'non-governmental organisations': 'ngo',
        'community': 'community',
    }
    
    # Try exact match first
    if source_owner in ownership_mapping:
        return ownership_mapping[source_owner]
    
    # Try partial match
    for key, value in ownership_mapping.items():
        if key in source_owner:
            return value
    
    return None


def map_status(source_status: str) -> Optional[str]:
    """Map source status to Supabase enum"""
    if not source_status:
        return 'active'  # Default to active
    
    source_status = source_status.lower().strip()
    
    status_mapping = {
        'active': 'active',
        'operational': 'active',
        'inactive': 'inactive',
        'non-operational': 'inactive',
        'closed': 'inactive',
        'under construction': 'under_construction',
        'temporarily closed': 'temporarily_closed',
    }
    
    if source_status in status_mapping:
        return status_mapping[source_status]
    
    return 'active'  # Default


def extract_tier_level(level_str: str) -> Optional[int]:
    """Extract tier level from string"""
    if not level_str:
        return None
    
    # Extract number from strings like "LEVEL 2", "Level 3", etc.
    match = re.search(r'level\s*(\d+)', level_str.lower())
    if match:
        return int(match.group(1))
    
    # Try direct number
    try:
        level = int(level_str.strip())
        if 1 <= level <= 6:
            return level
    except ValueError:
        pass
    
    return None


def parse_api_data() -> List[FacilityRecord]:
    """Fetch and parse data from Energy Data API"""
    print("Fetching data from Energy Data API...")
    records = []
    
    try:
        with urlopen(ENERGY_DATA_API_URL) as response:
            data = json.loads(response.read())
            
        if not data.get('success'):
            print(f"API request failed: {data.get('help', 'Unknown error')}")
            return records
        
        result = data.get('result', {})
        api_records = result.get('records', [])
        total = result.get('total', len(api_records))
        
        print(f"Found {total} total records, processing {len(api_records)}...")
        
        for record in api_records:
            facility = FacilityRecord(
                name=record.get('Facility_N', '').strip(),
                facility_type=map_facility_type(record.get('Type', '')),
                ownership=map_ownership(record.get('Owner', '')),
                county=normalize_county_name(record.get('County', '')),
                sub_county=normalize_text(record.get('Sub_County', '')),
                ward=normalize_text(record.get('Sub_Locati', '') or record.get('Location', '')),
                location=normalize_text(record.get('Location', '')),
                address=normalize_text(record.get('Nearest_To', '')),
                latitude=record.get('Latitude'),
                longitude=record.get('Longitude'),
                source='api',
                source_id=str(record.get('_id', ''))
            )
            
            if facility.name:
                records.append(facility)
        
        print(f"Parsed {len(records)} facilities from API")
        
    except Exception as e:
        print(f"Error fetching API data: {e}")
    
    return records


def parse_csv_data() -> List[FacilityRecord]:
    """Fetch and parse data from Google Sheets CSV"""
    print("Fetching data from Google Sheets CSV...")
    records = []
    
    try:
        with urlopen(GOOGLE_SHEETS_CSV_URL) as response:
            content = response.read().decode('utf-8')
            reader = csv.DictReader(content.splitlines())
            
            for row in reader:
                # CSV has duplicate columns, use the first non-empty value
                facility_name = row.get('FacilityName', '').strip() or row.get('FacilityName', '').strip()
                reg_no = row.get('RegNo', '').strip() or row.get('Reg', '').strip()
                address = row.get('Address', '').strip() or row.get('address2', '').strip()
                facility_type = row.get('FacilityType', '').strip()
                level = row.get('Level', '').strip() or row.get('Level', '').strip()
                county = row.get('County', '').strip() or row.get('County', '').strip()
                status = row.get('Status', '').strip()
                
                facility = FacilityRecord(
                    name=facility_name,
                    code=reg_no if reg_no else None,
                    registration_number=reg_no if reg_no else None,
                    facility_type=map_facility_type(facility_type),
                    tier_level=extract_tier_level(level),
                    county=normalize_county_name(county),
                    address=normalize_text(address),
                    status=map_status(status),
                    source='csv',
                    source_id=reg_no if reg_no else None
                )
                
                if facility.name:
                    records.append(facility)
        
        print(f"Parsed {len(records)} facilities from CSV")
        
    except Exception as e:
        print(f"Error fetching CSV data: {e}")
    
    return records


def parse_jsonl_data() -> List[FacilityRecord]:
    """Parse data from local JSONL file"""
    print(f"Parsing data from JSONL file: {JSONL_FILE_PATH}...")
    records = []
    
    if not JSONL_FILE_PATH.exists():
        print(f"JSONL file not found: {JSONL_FILE_PATH}")
        return records
    
    try:
        with open(JSONL_FILE_PATH, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    data = json.loads(line)
                    text = data.get('text', '')
                    url = data.get('url', '')
                    
                    # Extract facility ID from URL if available
                    facility_id = None
                    if 'facilities/' in url:
                        match = re.search(r'facilities/([a-f0-9-]+)', url)
                        if match:
                            facility_id = match.group(1)
                    
                    # Parse facility details from HTML text
                    # This is a simplified parser - you may need to enhance it
                    facility_name = None
                    facility_type = None
                    ownership = None
                    county = None
                    sub_county = None
                    ward = None
                    latitude = None
                    longitude = None
                    status = None
                    
                    # Extract facility name (usually in title or first line)
                    name_match = re.search(r'Facilities/([^/\n]+)', text)
                    if name_match:
                        facility_name = name_match.group(1).strip()
                    
                    # Extract from structured text
                    if 'Facility Type' in text:
                        type_match = re.search(r'Facility Type([^\n]+)', text)
                        if type_match:
                            facility_type = type_match.group(1).strip()
                    
                    if 'Owner' in text:
                        owner_match = re.search(r'Owner([^\n]+)', text)
                        if owner_match:
                            ownership = owner_match.group(1).strip()
                    
                    if 'County' in text:
                        county_match = re.search(r'County([^\n]+)', text)
                        if county_match:
                            county = county_match.group(1).strip()
                    
                    if 'Sub County' in text:
                        sub_county_match = re.search(r'Sub County([^\n]+)', text)
                        if sub_county_match:
                            sub_county = sub_county_match.group(1).strip()
                    
                    if 'Ward' in text:
                        ward_match = re.search(r'Ward([^\n]+)', text)
                        if ward_match:
                            ward = ward_match.group(1).strip()
                    
                    if 'Latitude' in text:
                        lat_match = re.search(r'Latitude([^\n]+)', text)
                        if lat_match:
                            try:
                                latitude = float(lat_match.group(1).strip())
                            except ValueError:
                                pass
                    
                    if 'Longitude' in text:
                        lon_match = re.search(r'Longitude([^\n]+)', text)
                        if lon_match:
                            try:
                                longitude = float(lon_match.group(1).strip())
                            except ValueError:
                                pass
                    
                    if 'Status' in text:
                        status_match = re.search(r'Status([^\n]+)', text)
                        if status_match:
                            status = status_match.group(1).strip()
                    
                    if facility_name:
                        facility = FacilityRecord(
                            name=facility_name,
                            facility_type=map_facility_type(facility_type) if facility_type else None,
                            ownership=map_ownership(ownership) if ownership else None,
                            county=normalize_county_name(county) if county else None,
                            sub_county=normalize_text(sub_county) if sub_county else None,
                            ward=normalize_text(ward) if ward else None,
                            latitude=latitude,
                            longitude=longitude,
                            status=map_status(status) if status else None,
                            source='jsonl',
                            source_id=facility_id
                        )
                        records.append(facility)
                
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSONL line {line_num}: {e}")
                    continue
        
        print(f"Parsed {len(records)} facilities from JSONL")
        
    except Exception as e:
        print(f"Error reading JSONL file: {e}")
    
    return records


def deduplicate_facilities(records: List[FacilityRecord]) -> List[FacilityRecord]:
    """Deduplicate facilities using name, coordinates, and location matching"""
    print(f"Deduplicating {len(records)} facilities...")
    
    # Group by normalized name
    name_groups: Dict[str, List[FacilityRecord]] = defaultdict(list)
    for record in records:
        normalized_name = record.normalize_name()
        if normalized_name:
            name_groups[normalized_name].append(record)
    
    # Group by coordinates
    coord_groups: Dict[Tuple[float, float], List[FacilityRecord]] = defaultdict(list)
    for record in records:
        coord_key = record.get_coordinate_key()
        if coord_key:
            coord_groups[coord_key].append(record)
    
    # Deduplication logic
    seen: Set[str] = set()
    deduplicated: List[FacilityRecord] = []
    
    # Priority: API > CSV > JSONL (based on data quality)
    source_priority = {'api': 3, 'csv': 2, 'jsonl': 1}
    
    for record in records:
        # Create unique key
        name_key = record.normalize_name()
        coord_key = record.get_coordinate_key()
        
        # Check if we've seen this facility
        if name_key and name_key in seen:
            continue
        
        # Check for duplicates by name and coordinates
        is_duplicate = False
        
        # Check name-based duplicates
        if name_key and name_key in name_groups:
            duplicates = [r for r in name_groups[name_key] if r != record]
            if duplicates:
                # Check if any duplicate has same coordinates
                if coord_key:
                    for dup in duplicates:
                        dup_coord = dup.get_coordinate_key()
                        if dup_coord and abs(dup_coord[0] - coord_key[0]) < COORDINATE_THRESHOLD and \
                           abs(dup_coord[1] - coord_key[1]) < COORDINATE_THRESHOLD:
                            # Same name and coordinates - keep higher priority source
                            if source_priority.get(record.source, 0) <= source_priority.get(dup.source, 0):
                                is_duplicate = True
                                break
                # If no coordinates, check county match
                if not coord_key and not is_duplicate:
                    for dup in duplicates:
                        if record.county and dup.county and normalize_county_name(record.county) == normalize_county_name(dup.county):
                            if source_priority.get(record.source, 0) <= source_priority.get(dup.source, 0):
                                is_duplicate = True
                                break
        
        # Check coordinate-based duplicates (different name but same location)
        if not is_duplicate and coord_key and coord_key in coord_groups:
            duplicates = [r for r in coord_groups[coord_key] if r != record]
            if duplicates:
                # Very close coordinates with similar names
                for dup in duplicates:
                    dup_name = dup.normalize_name()
                    if name_key and dup_name:
                        # Calculate name similarity (simple)
                        if name_key == dup_name or \
                           (len(name_key) > 5 and len(dup_name) > 5 and 
                            (name_key in dup_name or dup_name in name_key)):
                            if source_priority.get(record.source, 0) <= source_priority.get(dup.source, 0):
                                is_duplicate = True
                                break
        
        if not is_duplicate:
            seen.add(name_key)
            deduplicated.append(record)
    
    print(f"Deduplicated to {len(deduplicated)} unique facilities")
    return deduplicated


def merge_facility_data(records: List[FacilityRecord]) -> List[FacilityRecord]:
    """Merge data from multiple sources for the same facility"""
    # Group by normalized name and coordinates
    facility_groups: Dict[Tuple[str, Optional[Tuple[float, float]]], List[FacilityRecord]] = defaultdict(list)
    
    for record in records:
        name_key = record.normalize_name()
        coord_key = record.get_coordinate_key()
        group_key = (name_key, coord_key)
        facility_groups[group_key].append(record)
    
    merged: List[FacilityRecord] = []
    
    for group_key, group_records in facility_groups.items():
        if len(group_records) == 1:
            merged.append(group_records[0])
        else:
            # Merge multiple records
            # Priority: API > CSV > JSONL
            source_priority = {'api': 3, 'csv': 2, 'jsonl': 1}
            group_records.sort(key=lambda x: source_priority.get(x.source, 0), reverse=True)
            
            base_record = group_records[0]
            
            # Merge data from other records
            for other_record in group_records[1:]:
                if not base_record.code and other_record.code:
                    base_record.code = other_record.code
                if not base_record.facility_type and other_record.facility_type:
                    base_record.facility_type = other_record.facility_type
                if not base_record.ownership and other_record.ownership:
                    base_record.ownership = other_record.ownership
                if not base_record.tier_level and other_record.tier_level:
                    base_record.tier_level = other_record.tier_level
                if not base_record.county and other_record.county:
                    base_record.county = other_record.county
                if not base_record.sub_county and other_record.sub_county:
                    base_record.sub_county = other_record.sub_county
                if not base_record.ward and other_record.ward:
                    base_record.ward = other_record.ward
                if not base_record.address and other_record.address:
                    base_record.address = other_record.address
                if base_record.latitude is None and other_record.latitude is not None:
                    base_record.latitude = other_record.latitude
                if base_record.longitude is None and other_record.longitude is not None:
                    base_record.longitude = other_record.longitude
                if not base_record.contact_phone and other_record.contact_phone:
                    base_record.contact_phone = other_record.contact_phone
                if not base_record.contact_email and other_record.contact_email:
                    base_record.contact_email = other_record.contact_email
                if not base_record.registration_number and other_record.registration_number:
                    base_record.registration_number = other_record.registration_number
            
            merged.append(base_record)
    
    return merged


def get_or_create_ward(supabase: Client, county_name: str, sub_county_name: str, ward_name: str) -> Optional[str]:
    """Get or create ward and return its ID"""
    if not supabase or not county_name:
        return None
    
    try:
        # First, get county
        county_response = supabase.table('counties').select('id').eq('name', county_name).limit(1).execute()
        if not county_response.data:
            # County doesn't exist, try to find by code or create
            # For now, return None - we'll handle this later
            return None
        
        county_id = county_response.data[0]['id']
        
        # Get sub_county
        sub_county_response = supabase.table('sub_counties').select('id').eq('county_id', county_id).eq('name', sub_county_name).limit(1).execute()
        if not sub_county_response.data and sub_county_name:
            # Create sub_county if it doesn't exist
            sub_county_code = f"{county_response.data[0].get('code', 'XX')}-{sub_county_name[:2].upper()}"
            sub_county_data = {
                'county_id': county_id,
                'code': sub_county_code,
                'name': sub_county_name
            }
            sub_county_response = supabase.table('sub_counties').insert(sub_county_data).execute()
            if sub_county_response.data:
                sub_county_id = sub_county_response.data[0]['id']
            else:
                return None
        elif sub_county_response.data:
            sub_county_id = sub_county_response.data[0]['id']
        else:
            return None
        
        # Get ward
        if ward_name:
            ward_response = supabase.table('wards').select('id').eq('sub_county_id', sub_county_id).eq('name', ward_name).limit(1).execute()
            if not ward_response.data:
                # Create ward if it doesn't exist
                ward_code = f"{sub_county_code}-W{hash(ward_name) % 1000:03d}"
                ward_data = {
                    'sub_county_id': sub_county_id,
                    'code': ward_code,
                    'name': ward_name
                }
                ward_response = supabase.table('wards').insert(ward_data).execute()
                if ward_response.data:
                    return ward_response.data[0]['id']
                else:
                    return None
            else:
                return ward_response.data[0]['id']
        
    except Exception as e:
        print(f"Error getting/creating ward: {e}")
        return None
    
    return None


def upsert_to_supabase(records: List[FacilityRecord], supabase: Client) -> None:
    """Upsert facilities to Supabase"""
    if not supabase:
        print("Supabase client not available. Skipping database update.")
        return
    
    print(f"Upserting {len(records)} facilities to Supabase...")
    
    # Load existing counties for quick lookup
    try:
        counties_response = supabase.table('counties').select('id, name, code').execute()
        county_map = {c['name'].upper(): c['id'] for c in counties_response.data}
        print(f"Loaded {len(county_map)} counties from database")
    except Exception as e:
        print(f"Error loading counties: {e}")
        county_map = {}
    
    batch_size = 100
    total_upserted = 0
    skipped_no_ward = 0
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        batch_data = []
        
        for record in batch:
            # Try to find ward_id
            ward_id = None
            if record.county and record.ward:
                # Try to find ward by county and ward name
                county_name_upper = normalize_county_name(record.county).upper()
                if county_name_upper in county_map:
                    county_id = county_map[county_name_upper]
                    try:
                        # Try to find ward
                        ward_response = supabase.table('wards').select('id').eq('name', record.ward).limit(1).execute()
                        if ward_response.data:
                            # Verify it's in the right county by checking sub_county
                            ward_id_candidate = ward_response.data[0]['id']
                            ward_details = supabase.table('wards').select('sub_county_id').eq('id', ward_id_candidate).execute()
                            if ward_details.data:
                                sub_county_id = ward_details.data[0]['sub_county_id']
                                sub_county_details = supabase.table('sub_counties').select('county_id').eq('id', sub_county_id).execute()
                                if sub_county_details.data and sub_county_details.data[0]['county_id'] == county_id:
                                    ward_id = ward_id_candidate
                    except Exception:
                        pass
            
            # If no ward_id found, try to create one
            if not ward_id and record.county and record.ward:
                ward_id = get_or_create_ward(supabase, record.county, record.sub_county or '', record.ward)
            
            # For facilities without ward_id, we'll allow NULL (ward_id is now optional)
            if not ward_id:
                skipped_no_ward += 1
            
            # Prepare data for Supabase
            facility_data = {
                'name': record.name,
                'code': record.code or record.registration_number or f"FAC-{hash(record.name) % 1000000:06d}",
                'facility_type': record.facility_type or 'clinic',
                'ownership': record.ownership or 'private',
                'tier_level': record.tier_level,
                'latitude': float(record.latitude) if record.latitude is not None else None,
                'longitude': float(record.longitude) if record.longitude is not None else None,
                'address': record.address,
                'contact_phone': record.contact_phone,
                'contact_email': record.contact_email,
                'status': record.status or 'active',
            }
            
            # Add ward_id if available (now optional)
            if ward_id:
                facility_data['ward_id'] = ward_id
            
            # Note: Geography type (location) will be set automatically by database trigger
            # or can be set via SQL: ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
            # For now, we rely on lat/lon columns and let the database handle geography
            
            batch_data.append(facility_data)
        
        try:
            # Remove duplicates within batch (by code) before upserting
            seen_codes = set()
            unique_batch_data = []
            for facility_data in batch_data:
                code = facility_data.get('code')
                if code and code not in seen_codes:
                    seen_codes.add(code)
                    unique_batch_data.append(facility_data)
                elif not code:
                    # Include facilities without code (shouldn't happen, but handle it)
                    unique_batch_data.append(facility_data)
            
            if not unique_batch_data:
                print(f"Skipping batch {i//batch_size + 1} (all duplicates)")
                continue
            
            # Upsert with conflict on code
            response = supabase.table('facilities').upsert(
                unique_batch_data,
                on_conflict='code',
                ignore_duplicates=False
            ).execute()
            
            total_upserted += len(unique_batch_data)
            print(f"Upserted batch {i//batch_size + 1} ({len(unique_batch_data)} facilities)")
            
        except Exception as e:
            print(f"Error upserting batch {i//batch_size + 1}: {e}")
            import traceback
            traceback.print_exc()
            continue
    
    print(f"Successfully upserted {total_upserted} facilities to Supabase")
    if skipped_no_ward > 0:
        print(f"Note: {skipped_no_ward} facilities were inserted without ward_id (ward_id is now optional)")


def main():
    """Main execution function"""
    print("=" * 80)
    print("Facility Data Cleaning and Deduplication")
    print("=" * 80)
    
    # Parse all data sources
    api_records = parse_api_data()
    csv_records = parse_csv_data()
    jsonl_records = parse_jsonl_data()
    
    # Combine all records
    all_records = api_records + csv_records + jsonl_records
    print(f"\nTotal records from all sources: {len(all_records)}")
    print(f"  - API: {len(api_records)}")
    print(f"  - CSV: {len(csv_records)}")
    print(f"  - JSONL: {len(jsonl_records)}")
    
    # Deduplicate
    deduplicated = deduplicate_facilities(all_records)
    
    # Merge data from multiple sources
    merged = merge_facility_data(deduplicated)
    
    print(f"\nFinal cleaned facilities: {len(merged)}")
    
    # Initialize Supabase client
    supabase = None
    if SUPABASE_AVAILABLE and SUPABASE_URL and SUPABASE_KEY:
        try:
            supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
            print("Supabase client initialized")
        except Exception as e:
            print(f"Error initializing Supabase client: {e}")
    elif not SUPABASE_AVAILABLE:
        print("Supabase library not available")
    elif not SUPABASE_URL:
        print("SUPABASE_URL not set in .env file")
    elif not SUPABASE_KEY:
        print("SUPABASE_ANON_KEY not set in .env file")
    
    # Upsert to Supabase
    if supabase:
        upsert_to_supabase(merged, supabase)
    else:
        print("\nSkipping Supabase upsert (client not available)")
        print("To enable database updates:")
        print("  1. Install: pip install supabase python-dotenv")
        print("  2. Set SUPABASE_URL and SUPABASE_ANON_KEY in .env file")
    
    # Save cleaned data to JSON file
    output_file = CODE_ROOT / "data" / "cleaned_facilities.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump([asdict(r) for r in merged], f, indent=2, default=str)
    
    print(f"\nCleaned data saved to: {output_file}")
    print("=" * 80)
    print("Done!")


if __name__ == "__main__":
    main()




