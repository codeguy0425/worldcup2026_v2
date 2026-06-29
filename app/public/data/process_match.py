"""
Script to add match data to match-detail.json.
Run with: python process_match.py <match_id> <team1> <team2>
Reads clipboard data from clipboard_data.txt for the current match.
"""
import json
import sys
import os

MATCH_DETAIL_PATH = r'C:\Users\andy\Documents\dev\ai\hermes\wc2026-redesign\app\public\data\match-detail.json'
SQUADS_PATH = r'C:\Users\andy\Documents\dev\ai\hermes\wc2026-redesign\app\public\data\squads.json'

def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_match_detail(data):
    with open(MATCH_DETAIL_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"Saved to {MATCH_DETAIL_PATH}")

# === MEX vs RSA (Match 1) ===
# Data extracted from FIFA website clipboard on first read
MEX_RSA = {
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
            {"no": 7, "pos": "DF"},
            {"no": 14, "pos": "DF"},
            {"no": 19, "pos": "DF"},
            {"no": 20, "pos": "DF"},
            {"no": 21, "pos": "DF"},
            {"no": 4, "pos": "MF"},
            {"no": 13, "pos": "MF"},
            {"no": 23, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 5, "pos": "FW"},
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

# === CZE vs RSA (Match 3) - from current clipboard ===
CZE_RSA = {
    "team1": {
        "teamId": "CZE",
        "formation": "3-5-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF", "captain": True},
            {"no": 8, "pos": "MF"},
            {"no": 12, "pos": "MF"},
            {"no": 14, "pos": "MF"},
            {"no": 15, "pos": "MF"},
            {"no": 17, "pos": "MF"},
            {"no": 19, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 7, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 20, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 16}, {"no": 23}, {"no": 3}, {"no": 6},
            {"no": 13}, {"no": 18}, {"no": 21}, {"no": 22},
            {"no": 24}, {"no": 25},
        ],
        "coach": "Ivan Hasek"
    },
    "team2": {
        "teamId": "RSA",
        "formation": "4-3-3",
        "startingXI": [
            {"no": 1, "pos": "GK", "captain": True},
            {"no": 6, "pos": "DF"},
            {"no": 14, "pos": "DF"},
            {"no": 19, "pos": "DF"},
            {"no": 20, "pos": "DF"},
            {"no": 4, "pos": "MF"},
            {"no": 13, "pos": "MF"},
            {"no": 23, "pos": "MF"},
            {"no": 8, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 12, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 7, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 16}, {"no": 22}, {"no": 2}, {"no": 3},
            {"no": 18}, {"no": 24}, {"no": 26},
            {"no": 5}, {"no": 11}, {"no": 15}, {"no": 25},
            {"no": 21},
        ],
        "coach": "Hugo Broos"
    },
    "substitutions": [],
    "cards": []
}

# === KOR vs CZE (Match 2) ===
KOR_CZE = {
    "team1": {
        "teamId": "KOR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 14, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 15, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 20, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 21}, {"no": 13}, {"no": 16},
            {"no": 18}, {"no": 19}, {"no": 22}, {"no": 23},
            {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Hong Myung-Bo"
    },
    "team2": {
        "teamId": "CZE",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 8, "pos": "MF"},
            {"no": 12, "pos": "MF"},
            {"no": 14, "pos": "MF"},
            {"no": 15, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 19, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 16}, {"no": 23}, {"no": 6}, {"no": 13},
            {"no": 18}, {"no": 21}, {"no": 22}, {"no": 24},
            {"no": 25}, {"no": 20},
        ],
        "coach": "Ivan Hasek"
    },
    "substitutions": [],
    "cards": []
}

# === MEX vs KOR (Match 4) ===
MEX_KOR = {
    "team1": {
        "teamId": "MEX",
        "formation": "4-4-1-1",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 23, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 7, "pos": "MF"},
            {"no": 17, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 16, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 25, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 24, "pos": "MF"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 13}, {"no": 15}, {"no": 4},
            {"no": 20}, {"no": 18}, {"no": 22}, {"no": 14},
            {"no": 21}, {"no": 19},
        ],
        "coach": "Javier Aguirre"
    },
    "team2": {
        "teamId": "KOR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 14, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 15, "pos": "FW"},
            {"no": 17, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 21}, {"no": 13}, {"no": 16},
            {"no": 18}, {"no": 19}, {"no": 22}, {"no": 23},
            {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Hong Myung-Bo"
    },
    "substitutions": [],
    "cards": []
}

# === CZE vs MEX (Match 5) ===
CZE_MEX = {
    "team1": {
        "teamId": "CZE",
        "formation": "3-5-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 8, "pos": "MF"},
            {"no": 12, "pos": "MF"},
            {"no": 14, "pos": "MF"},
            {"no": 15, "pos": "MF"},
            {"no": 17, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 19, "pos": "FW"},
            {"no": 7, "pos": "FW"},
            {"no": 11, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 16}, {"no": 23}, {"no": 3}, {"no": 6},
            {"no": 13}, {"no": 18}, {"no": 21}, {"no": 22},
            {"no": 24}, {"no": 25}, {"no": 20},
        ],
        "coach": "Ivan Hasek"
    },
    "team2": {
        "teamId": "MEX",
        "formation": "4-1-2-3",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 23, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 4, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 7, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 16, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 21, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 13}, {"no": 15}, {"no": 14},
            {"no": 20}, {"no": 17}, {"no": 18}, {"no": 19},
            {"no": 24}, {"no": 25}, {"no": 22},
        ],
        "coach": "Javier Aguirre"
    },
    "substitutions": [],
    "cards": []
}

# === RSA vs KOR (Match 6) ===
RSA_KOR = {
    "team1": {
        "teamId": "RSA",
        "formation": "5-3-2",
        "startingXI": [
            {"no": 1, "pos": "GK", "captain": True},
            {"no": 6, "pos": "DF"},
            {"no": 14, "pos": "DF"},
            {"no": 19, "pos": "DF"},
            {"no": 20, "pos": "DF"},
            {"no": 21, "pos": "DF"},
            {"no": 4, "pos": "MF"},
            {"no": 13, "pos": "MF"},
            {"no": 23, "pos": "MF"},
            {"no": 12, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 5, "pos": "MF"},
        ],
        "substitutes": [
            {"no": 16}, {"no": 22}, {"no": 2}, {"no": 3},
            {"no": 18}, {"no": 24}, {"no": 26},
            {"no": 7}, {"no": 8}, {"no": 11}, {"no": 15},
            {"no": 25},
        ],
        "coach": "Hugo Broos"
    },
    "team2": {
        "teamId": "KOR",
        "formation": "4-3-3",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 15, "pos": "FW"},
            {"no": 17, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 21}, {"no": 13}, {"no": 14},
            {"no": 16}, {"no": 18}, {"no": 19}, {"no": 22},
            {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Hong Myung-Bo"
    },
    "substitutions": [],
    "cards": []
}

# === USA vs PAR (Match 19) ===
USA_PAR = {
    "team1": {
        "teamId": "USA",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 14, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 20, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 21}, {"no": 13}, {"no": 15},
            {"no": 16}, {"no": 18}, {"no": 19}, {"no": 22},
            {"no": 23}, {"no": 24}, {"no": 25},
        ],
        "coach": "Mauricio Pochettino"
    },
    "team2": {
        "teamId": "PAR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF", "captain": True},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 15, "pos": "FW"},
            {"no": 17, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 22}, {"no": 13}, {"no": 14},
            {"no": 16}, {"no": 18}, {"no": 19}, {"no": 20},
            {"no": 21}, {"no": 23}, {"no": 24},
        ],
        "coach": "Gustavo Alfaro"
    },
    "substitutions": [],
    "cards": []
}

# === AUS vs TUR (Match 20) ===
AUS_TUR = {
    "team1": {
        "teamId": "AUS",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF", "captain": True},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 15, "pos": "FW"},
            {"no": 17, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 18}, {"no": 13}, {"no": 14},
            {"no": 16}, {"no": 19}, {"no": 20}, {"no": 21},
            {"no": 22}, {"no": 23}, {"no": 24},
        ],
        "coach": "Tony Popovic"
    },
    "team2": {
        "teamId": "TUR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 19, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 23}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 16}, {"no": 18}, {"no": 20},
            {"no": 21}, {"no": 22}, {"no": 24},
        ],
        "coach": "Vincenzo Montella"
    },
    "substitutions": [],
    "cards": []
}

# === USA vs AUS (Match 21) ===
USA_AUS = {
    "team1": {
        "teamId": "USA",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 14, "pos": "FW"},
            {"no": 17, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 21}, {"no": 13}, {"no": 15},
            {"no": 16}, {"no": 18}, {"no": 19}, {"no": 20},
            {"no": 22}, {"no": 23}, {"no": 24}, {"no": 25},
        ],
        "coach": "Mauricio Pochettino"
    },
    "team2": {
        "teamId": "AUS",
        "formation": "5-3-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF", "captain": True},
            {"no": 14, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 15, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 18}, {"no": 13}, {"no": 16},
            {"no": 17}, {"no": 19}, {"no": 20}, {"no": 21},
            {"no": 22}, {"no": 23}, {"no": 24},
        ],
        "coach": "Tony Popovic"
    },
    "substitutions": [],
    "cards": []
}

# === TUR vs PAR (Match 22) ===
TUR_PAR = {
    "team1": {
        "teamId": "TUR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 19, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 23}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 16}, {"no": 18}, {"no": 20},
            {"no": 21}, {"no": 22}, {"no": 24},
        ],
        "coach": "Vincenzo Montella"
    },
    "team2": {
        "teamId": "PAR",
        "formation": "4-2-3-1",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF", "captain": True},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 15, "pos": "FW"},
            {"no": 17, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 22}, {"no": 13}, {"no": 14},
            {"no": 16}, {"no": 18}, {"no": 19}, {"no": 20},
            {"no": 21}, {"no": 23}, {"no": 24},
        ],
        "coach": "Gustavo Alfaro"
    },
    "substitutions": [],
    "cards": []
}

# === TUR vs USA (Match 23) ===
TUR_USA = {
    "team1": {
        "teamId": "TUR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 19, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 23}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 16}, {"no": 18}, {"no": 20},
            {"no": 21}, {"no": 22}, {"no": 24},
        ],
        "coach": "Vincenzo Montella"
    },
    "team2": {
        "teamId": "USA",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 14, "pos": "FW"},
            {"no": 17, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 21}, {"no": 13}, {"no": 15},
            {"no": 16}, {"no": 18}, {"no": 19}, {"no": 20},
            {"no": 22}, {"no": 23}, {"no": 24}, {"no": 25},
        ],
        "coach": "Mauricio Pochettino"
    },
    "substitutions": [],
    "cards": []
}

# === PAR vs AUS (Match 24) ===
PAR_AUS = {
    "team1": {
        "teamId": "PAR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF", "captain": True},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 15, "pos": "FW"},
            {"no": 17, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 22}, {"no": 13}, {"no": 14},
            {"no": 16}, {"no": 18}, {"no": 19}, {"no": 20},
            {"no": 21}, {"no": 23}, {"no": 24},
        ],
        "coach": "Gustavo Alfaro"
    },
    "team2": {
        "teamId": "AUS",
        "formation": "5-3-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF", "captain": True},
            {"no": 14, "pos": "DF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 15, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 18}, {"no": 13}, {"no": 16},
            {"no": 17}, {"no": 19}, {"no": 20}, {"no": 21},
            {"no": 22}, {"no": 23}, {"no": 24},
        ],
        "coach": "Tony Popovic"
    },
    "substitutions": [],
    "cards": []
}

# Map match IDs to data
MATCHES = {
    "1": ("MEX vs RSA", MEX_RSA),
    "2": ("KOR vs CZE", KOR_CZE),
    "3": ("CZE vs RSA", CZE_RSA),
    "4": ("MEX vs KOR", MEX_KOR),
    "5": ("CZE vs MEX", CZE_MEX),
    "6": ("RSA vs KOR", RSA_KOR),
    "19": ("USA vs PAR", USA_PAR),
    "20": ("AUS vs TUR", AUS_TUR),
    "21": ("USA vs AUS", USA_AUS),
    "22": ("TUR vs PAR", TUR_PAR),
    "23": ("TUR vs USA", TUR_USA),
    "24": ("PAR vs AUS", PAR_AUS),
}

def main():
    detail = load_json(MATCH_DETAIL_PATH)
    
    for match_id in sorted(MATCHES.keys(), key=int):
        label, data = MATCHES[match_id]
        if match_id in detail:
            print(f"Match {match_id} ({label}) already exists, overwriting...")
        detail[match_id] = data
        print(f"Added match {match_id}: {label}")
    
    save_match_detail(detail)
    print(f"\nTotal matches: {len(detail)}")

if __name__ == '__main__':
    main()
