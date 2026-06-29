"""Save captured clipboard match data to match-detail.json.
We have data for:
1. MEX vs RSA (Match 1) - captured from first clipboard read
3. CZE vs RSA (Match 3) - captured from second clipboard read  
24. PAR vs AUS (Match 24) - captured from third clipboard read
"""
import json

MATCH_DETAIL_PATH = r'C:\Users\andy\Documents\dev\ai\hermes\wc2026-redesign\app\public\data\match-detail.json'
SQUADS_PATH = r'C:\Users\andy\Documents\dev\ai\hermes\wc2026-redesign\app\public\data\squads.json'

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_match_detail(data):
    with open(MATCH_DETAIL_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved to {MATCH_DETAIL_PATH}")

squads = load_json(SQUADS_PATH)
detail = load_json(MATCH_DETAIL_PATH)

# ===============================================================
# Match 1: MEX vs RSA (Group A)
# From FIFA clipboard - MEX 4-1-2-3, RSA 5-3-2
# ===============================================================
def build_mex_rsa():
    """Build MEX vs RSA from captured clipboard data."""
    return {
        "team1": {
            "teamId": "MEX",
            "formation": "4-1-2-3",
            "startingXI": [
                {"no": 1, "pos": "GK"},
                {"no": 3, "pos": "DF", "captain": True},
                {"no": 5, "pos": "DF"},
                {"no": 15, "pos": "DF"},
                {"no": 23, "pos": "DF"},
                {"no": 6, "pos": "MF"},
                {"no": 4, "pos": "MF"},
                {"no": 8, "pos": "MF"},
                {"no": 19, "pos": "MF"},
                {"no": 24, "pos": "MF"},
                {"no": 9, "pos": "FW"},
                {"no": 14, "pos": "FW"},
                {"no": 16, "pos": "FW"},
                {"no": 10, "pos": "FW"},
                {"no": 25, "pos": "FW"},
            ],
            "substitutes": [
                {"no": 12}, {"no": 13}, {"no": 2}, {"no": 20},
                {"no": 7}, {"no": 17}, {"no": 18},
                {"no": 11}, {"no": 21}, {"no": 22},
            ],
            "coach": "Javier Aguirre"
        },
        "team2": {
            "teamId": "RSA",
            "formation": "5-3-2",
            "startingXI": [
                {"no": 1, "pos": "GK", "captain": True},
                {"no": 6, "pos": "DF"},
                {"no": 7, "pos": "FW"},
                {"no": 14, "pos": "DF"},
                {"no": 19, "pos": "DF"},
                {"no": 20, "pos": "DF"},
                {"no": 21, "pos": "DF"},
                {"no": 4, "pos": "MF"},
                {"no": 13, "pos": "MF"},
                {"no": 23, "pos": "MF"},
                {"no": 11, "pos": "MF"},
                {"no": 9, "pos": "FW"},
                {"no": 5, "pos": "MF"},
                {"no": 15, "pos": "FW"},
                {"no": 17, "pos": "FW"},
            ],
            "substitutes": [
                {"no": 16}, {"no": 22}, {"no": 2}, {"no": 3},
                {"no": 18}, {"no": 24}, {"no": 26},
                {"no": 8}, {"no": 10}, {"no": 12}, {"no": 25},
            ],
            "coach": "Hugo Broos"
        },
        "substitutions": [
            {"minute": 66, "teamId": "MEX", "off": {"no": 19}, "on": {"no": 20}},
            {"minute": 66, "teamId": "MEX", "off": {"no": 24}, "on": {"no": 7}},
            {"minute": 76, "teamId": "MEX", "off": {"no": 4}, "on": {"no": 2}},
            {"minute": 76, "teamId": "MEX", "off": {"no": 14}, "on": {"no": 11}},
            {"minute": 79, "teamId": "MEX", "off": {"no": 10}, "on": {"no": 21}},
            {"minute": 56, "teamId": "RSA", "off": {"no": 5}, "on": {"no": 8}},
            {"minute": 61, "teamId": "RSA", "off": {"no": 11}, "on": {"no": 10}},
            {"minute": 76, "teamId": "RSA", "off": {"no": 7}, "on": {"no": 12}},
            {"minute": 76, "teamId": "RSA", "off": {"no": 17}, "on": {"no": 25}},
        ],
        "cards": [
            {"minute": 9, "teamId": "MEX", "player": {"no": 16}, "card": "yellow"},
            {"minute": 49, "teamId": "RSA", "player": {"no": 13}, "card": "yellow"},
            {"minute": 67, "teamId": "MEX", "player": {"no": 9}, "card": "yellow"},
            {"minute": 84, "teamId": "RSA", "player": {"no": 11}, "card": "yellow"},
            {"minute": 90, "teamId": "MEX", "player": {"no": 3}, "card": "yellow", "stoppageTime": 2},
        ]
    }

# ===============================================================
# Match 3: CZE vs RSA (Group A)
# From FIFA clipboard - CZE 3-5-2, RSA 4-3-3
# ===============================================================
def build_cze_rsa():
    """Build CZE vs RSA from clipboard data (clipboard_data.txt)."""
    return {
        "team1": {
            "teamId": "CZE",
            "formation": "3-5-2",
            "startingXI": [
                {"no": 1, "pos": "GK"},
                {"no": 3, "pos": "DF"},
                {"no": 4, "pos": "DF"},
                {"no": 5, "pos": "DF"},
                {"no": 7, "pos": "DF", "captain": True},
                {"no": 8, "pos": "MF"},
                {"no": 12, "pos": "MF"},
                {"no": 18, "pos": "MF"},
                {"no": 24, "pos": "MF"},
                {"no": 9, "pos": "FW"},
                {"no": 10, "pos": "FW"},
                {"no": 2, "pos": "DF"},
                {"no": 15, "pos": "FW"},
                {"no": 17, "pos": "MF"},
                {"no": 20, "pos": "DF"},
                {"no": 22, "pos": "MF"},
            ],
            "substitutes": [
                {"no": 16}, {"no": 23}, {"no": 6}, {"no": 11},
                {"no": 13}, {"no": 19}, {"no": 21}, {"no": 25},
                {"no": 26},
            ],
            "coach": "Miroslav Koubek"
        },
        "team2": {
            "teamId": "RSA",
            "formation": "4-3-3",
            "startingXI": [
                {"no": 1, "pos": "GK", "captain": True},
                {"no": 6, "pos": "DF"},
                {"no": 14, "pos": "DF"},
                {"no": 20, "pos": "DF"},
                {"no": 21, "pos": "DF"},
                {"no": 4, "pos": "MF"},
                {"no": 5, "pos": "MF"},
                {"no": 23, "pos": "MF"},
                {"no": 7, "pos": "FW"},
                {"no": 12, "pos": "FW"},
                {"no": 15, "pos": "FW"},
                {"no": 10, "pos": "FW"},
                {"no": 17, "pos": "FW"},
                {"no": 25, "pos": "FW"},
            ],
            "substitutes": [
                {"no": 16}, {"no": 22}, {"no": 2}, {"no": 3},
                {"no": 18}, {"no": 19}, {"no": 24}, {"no": 26},
                {"no": 8}, {"no": 9},
            ],
            "coach": "Hugo Broos"
        },
        "substitutions": [
            {"minute": 45, "teamId": "RSA", "off": {"no": 10}, "on": {"no": 8}},
            {"minute": 55, "teamId": "CZE", "off": {"no": 15}, "on": {"no": 6}},
            {"minute": 55, "teamId": "CZE", "off": {"no": 20}, "on": {"no": 21}},
            {"minute": 66, "teamId": "RSA", "off": {"no": 17}, "on": {"no": 9}},
            {"minute": 67, "teamId": "CZE", "off": {"no": 17}, "on": {"no": 11}},
            {"minute": 67, "teamId": "CZE", "off": {"no": 22}, "on": {"no": 13}},
            {"minute": 78, "teamId": "CZE", "off": {"no": 2}, "on": {"no": 19}},
            {"minute": 84, "teamId": "RSA", "off": {"no": 25}, "on": {"no": 26}},
        ],
        "cards": [
            {"minute": 83, "teamId": "RSA", "player": {"no": 4}, "card": "yellow"},
        ]
    }

# ===============================================================
# Match 24: PAR vs AUS (Group D)
# From FIFA clipboard - PAR 5-3-2, AUS 3-4-3
# ===============================================================
def build_par_aus():
    """Build PAR vs AUS from clipboard data (clip_par_aus.txt)."""
    return {
        "team1": {
            "teamId": "PAR",
            "formation": "5-3-2",
            "startingXI": [
                {"no": 12, "pos": "GK"},
                {"no": 2, "pos": "DF"},
                {"no": 3, "pos": "DF"},
                {"no": 13, "pos": "DF"},
                {"no": 4, "pos": "DF"},
                {"no": 15, "pos": "DF", "captain": True},
                {"no": 26, "pos": "DF"},
                {"no": 11, "pos": "MF"},
                {"no": 8, "pos": "MF"},
                {"no": 16, "pos": "MF"},
                {"no": 14, "pos": "MF"},
                {"no": 23, "pos": "MF"},
                {"no": 6, "pos": "DF"},
                {"no": 19, "pos": "FW"},
                {"no": 21, "pos": "FW"},
                {"no": 18, "pos": "FW"},
            ],
            "substitutes": [
                {"no": 1}, {"no": 22}, {"no": 5}, {"no": 7},
                {"no": 20}, {"no": 24}, {"no": 9},
                {"no": 17}, {"no": 25},
            ],
            "coach": "Gustavo Alfaro"
        },
        "team2": {
            "teamId": "AUS",
            "formation": "3-4-3",
            "startingXI": [
                {"no": 18, "pos": "GK"},
                {"no": 3, "pos": "DF"},
                {"no": 5, "pos": "DF"},
                {"no": 16, "pos": "DF"},
                {"no": 19, "pos": "DF", "captain": True},
                {"no": 25, "pos": "DF"},
                {"no": 8, "pos": "MF"},
                {"no": 13, "pos": "MF"},
                {"no": 22, "pos": "MF"},
                {"no": 24, "pos": "MF"},
                {"no": 17, "pos": "FW"},
                {"no": 26, "pos": "FW"},
                {"no": 20, "pos": "FW"},
                {"no": 10, "pos": "FW"},
            ],
            "substitutes": [
                {"no": 1}, {"no": 12}, {"no": 2}, {"no": 6},
                {"no": 15}, {"no": 21}, {"no": 14},
                {"no": 9}, {"no": 11}, {"no": 23},
            ],
            "coach": "Tony Popovic"
        },
        "substitutions": [
            {"minute": 45, "teamId": "PAR", "off": {"no": 11}, "on": {"no": 7}},
            {"minute": 58, "teamId": "AUS", "off": {"no": 10}, "on": {"no": 9}},
            {"minute": 67, "teamId": "PAR", "off": {"no": 18}, "on": {"no": 9}},
            {"minute": 84, "teamId": "PAR", "off": {"no": 13}, "on": {"no": 5}},
            {"minute": 84, "teamId": "AUS", "off": {"no": 24}, "on": {"no": 14}},
            {"minute": 84, "teamId": "AUS", "off": {"no": 26}, "on": {"no": 23}},
            {"minute": 90, "teamId": "PAR", "off": {"no": 16}, "on": {"no": 20}},
            {"minute": 90, "teamId": "PAR", "off": {"no": 6}, "on": {"no": 25}},
        ],
        "cards": [
            {"minute": 78, "teamId": "PAR", "player": {"no": 8}, "card": "yellow"},
        ]
    }

# Add the three matches
matches_to_add = {
    "1": ("MEX vs RSA (Group A)", build_mex_rsa()),
    "3": ("CZE vs RSA (Group A)", build_cze_rsa()),
    "24": ("PAR vs AUS (Group D)", build_par_aus()),
}

for mid, (label, data) in matches_to_add.items():
    if mid in detail:
        print(f"Overwriting existing match {mid} ({label})")
    else:
        print(f"Adding match {mid} ({label})")
    detail[mid] = data

save_match_detail(detail)

# Print summary
print(f"\nTotal match entries: {len(detail)}")
print(f"Newly added: {', '.join(sorted(matches_to_add.keys()))}")
