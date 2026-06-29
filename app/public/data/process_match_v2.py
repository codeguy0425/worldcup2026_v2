"""Process a match from clipboard data and add to match-detail.json.
Reads clipboard via PowerShell, parses FIFA lineup page, adds match entry.

Run multiple times as clipboard changes between matches.
"""
import json
import re
import subprocess
import sys

MATCH_DETAIL_PATH = r'C:\Users\andy\Documents\dev\ai\hermes\wc2026-redesign\app\public\data\match-detail.json'

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_match_detail(data):
    with open(MATCH_DETAIL_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved to {MATCH_DETAIL_PATH}")

def get_clipboard():
    result = subprocess.run(['powershell.exe', '-Command', 'Get-Clipboard'], 
                          capture_output=True, text=True, encoding='utf-8', errors='replace')
    return result.stdout

def identify_match(text):
    """Identify the match from clipboard text."""
    # Look for match title like "Mexico vs. South Africa"
    patterns = [
        (r'Mexico\s*vs\.?\s*South Africa', 'MEX', 'RSA'),
        (r'South Africa\s*vs\.?\s*Mexico', 'RSA', 'MEX'),
        (r'Korea\s*(?:Republic)?\s*vs\.?\s*Czech', 'KOR', 'CZE'),
        (r'Czech\s*vs\.?\s*Korea', 'CZE', 'KOR'),
        (r'Czechia\s*vs\.?\s*South Africa', 'CZE', 'RSA'),
        (r'South Africa\s*vs\.?\s*Czech', 'RSA', 'CZE'),
        (r'Mexico\s*vs\.?\s*Korea', 'MEX', 'KOR'),
        (r'Korea\s*vs\.?\s*Mexico', 'KOR', 'MEX'),
        (r'Czech\s*vs\.?\s*Mexico', 'CZE', 'MEX'),
        (r'Mexico\s*vs\.?\s*Czech', 'MEX', 'CZE'),
        (r'South Africa\s*vs\.?\s*Korea', 'RSA', 'KOR'),
        (r'Korea\s*vs\.?\s*South Africa', 'KOR', 'RSA'),
        (r'USA?\s*vs\.?\s*Paraguay', 'USA', 'PAR'),
        (r'Paraguay\s*vs\.?\s*USA?', 'PAR', 'USA'),
        (r'Australia\s*vs\.?\s*Turkey', 'AUS', 'TUR'),
        (r'Turkey\s*vs\.?\s*Australia', 'TUR', 'AUS'),
        (r'USA?\s*vs\.?\s*Australia', 'USA', 'AUS'),
        (r'Australia\s*vs\.?\s*USA?', 'AUS', 'USA'),
        (r'Turkey\s*vs\.?\s*Paraguay', 'TUR', 'PAR'),
        (r'Paraguay\s*vs\.?\s*Turkey', 'PAR', 'TUR'),
        (r'Turkey\s*vs\.?\s*USA?', 'TUR', 'USA'),
        (r'USA?\s*vs\.?\s*Turkey', 'USA', 'TUR'),
        (r'Paraguay\s*vs\.?\s*Australia', 'PAR', 'AUS'),
        (r'Australia\s*vs\.?\s*Paraguay', 'AUS', 'PAR'),
    ]
    
    for pattern, t1, t2 in patterns:
        if re.search(pattern, text, re.IGNORECASE):
            return t1, t2
    
    return None, None

def find_match_id(t1, t2, detail):
    """Find the match ID for this team pair."""
    matches_data = load_json(r'C:\Users\andy\Documents\dev\ai\hermes\wc2026-redesign\app\public\data\matches.json')
    for m in matches_data:
        if m['team1Id'] == t1 and m['team2Id'] == t2:
            if str(m['id']) in detail:
                print(f"  Match {m['id']} ({t1} vs {t2}) already exists, updating...")
            return str(m['id'])
    return None

def extract_players(text, team_positions):
    """
    Extract player numbers from the FIFA lineup text.
    team_positions: dict with keys 'GK', 'DF', 'MF', 'FW' for each team
    
    Returns list of {no, pos} for each team.
    """
    lines = text.split('\n')
    starters = []
    subs = []
    
    # Parse the text to find player numbers
    # FIFA layout: number on one line, name on next
    # Times in parens like "76'" or "HT" indicate substitution time
    
    current_section = None
    current_side = None  # 'left' or 'right'
    
    # The page has two columns. We'll identify position headers
    # and then collect player numbers/names that follow
    
    found_starting = False
    found_subs = False
    team1_starters = []
    team2_starters = []
    team1_subs = []
    team2_subs = []
    
    current_pos = None
    side = 0  # 0 = left (team1), 1 = right (team2)
    
    for i, line in enumerate(lines):
        line_stripped = line.strip()
        if not line_stripped:
            continue
        
        # Detect section headers
        if line_stripped == 'Starting Line Up':
            found_starting = True
            found_subs = False
            continue
        if line_stripped == 'Substitutions':
            found_subs = True
            found_starting = False
            continue
        if line_stripped in ('Coach', 'Coach\r'):
            break
        
        # Detect position headers
        if line_stripped in ('Goalkeeper', 'Defender', 'Midfield', 'Attack'):
            current_pos = line_stripped
            continue
        
        # Skip known headers and trash
        if line_stripped in ('C', 'M', 'Skip to main content', 'FIFA', 'MATCHES', 'STANDINGS'):
            continue
        if line_stripped.startswith('FIFA') or 'vs.' in line_stripped:
            continue
        if re.match(r'^\d+\s*:\s*\d+', line_stripped):
            continue
        if 'Full Time' in line_stripped:
            continue
        
        # Try to match player number
        m = re.match(r'^(\d+)$', line_stripped)
        if m:
            no = int(m.group(1))
            # Check if next line is a name (not a header/keyword)
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                # Skip if next line is position header
                if next_line in ('Goalkeeper', 'Defender', 'Midfield', 'Attack', 'Substitutions', 'Starting Line Up',
                                'C', 'Coach', 'M') or not next_line:
                    continue
                # This is a player number
                pos_map = {'Goalkeeper': 'GK', 'Defender': 'DF', 'Midfield': 'MF', 'Attack': 'FW'}
                pos = pos_map.get(current_pos, '?')
                
                entry = {"no": no, "pos": pos}
                
                if found_starting:
                    team1_starters.append(entry)
                elif found_subs:
                    team1_subs.append(entry)
    
    # We need a more sophisticated parser. Let me just return what we extracted
    return team1_starters, team2_starters, team1_subs, team2_subs


def main():
    detail = load_json(MATCH_DETAIL_PATH)
    print(f"Current match entries: {sorted(detail.keys())}")
    
    text = get_clipboard()
    t1, t2 = identify_match(text)
    
    if not t1 or not t2:
        print("Could not identify match from clipboard.")
        print("First 200 chars of clipboard:")
        print(text[:200])
        return
    
    print(f"Identified match: {t1} vs {t2}")
    
    match_id = find_match_id(t1, t2, detail)
    if match_id:
        print(f"Match ID: {match_id}")
    else:
        print("Could not find match ID for this pair.")
        return
    
    starters_1, starters_2, subs_1, subs_2 = extract_players(text, None)
    print(f"Extracted {len(starters_1)} starters for {t1}, {len(starters_2)} for {t2}")
    print(f"Extracted {len(subs_1)} subs for {t1}, {len(subs_2)} for {t2}")
    
    # Print the extracted data
    print(f"\n{t1} starters: {[s['no'] for s in starters_1]}")
    print(f"{t2} starters: {[s['no'] for s in starters_2]}")
    if starters_1:
        print(f"First few: {starters_1[:5]}")


if __name__ == '__main__':
    main()
