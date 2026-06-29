"""Build complete match-detail.json with all Group A and Group D matches."""
import json
import sys

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

# ======================================================================
# Match 1: MEX vs RSA 
# Data from FIFA website clipboard (captured in earlier session)
# Formation: MEX 4-1-2-3, RSA 5-3-2
# ======================================================================
detail["1"] = {
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
print("Added Match 1: MEX vs RSA")

# ======================================================================
# Match 2: KOR vs CZE
# Formation: KOR 4-4-2, CZE 4-3-3  (from FIFA website)
# KOR: Kim Seung-gyu (GK), Lee Han-beom, Kim Min-jae (C), Kim Tae-hyeon, 
#       Lee Gi-hyuk, Hwang In-beom, Paik Seung-ho, Lee Jae-sung, 
#       Son Heung-min, Cho Gue-sung, Hwang Hee-chan, etc.
# CZE: Matej Kovar (GK), David Zima, Robin Hranac, Vladimir Coufal,
#       Tomas Holes, Vladimir Darida, Lukas Cerv, Michal Sadilek,
#       Patrik Schick, Adam Hlozek, etc.
# ======================================================================
detail["2"] = {
    "team1": {
        "teamId": "KOR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 3, "pos": "MF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 17, "pos": "MF"},
            {"no": 18, "pos": "FW"},
            {"no": 19, "pos": "MF"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 21}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 16}, {"no": 20},
            {"no": 22}, {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Hong Myung-Bo"
    },
    "team2": {
        "teamId": "CZE",
        "formation": "4-3-3",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF"},
            {"no": 7, "pos": "DF", "captain": True},
            {"no": 3, "pos": "DF"},
            {"no": 8, "pos": "MF"},
            {"no": 12, "pos": "MF"},
            {"no": 18, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 17, "pos": "MF"},
            {"no": 19, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 16}, {"no": 23}, {"no": 2}, {"no": 6},
            {"no": 13}, {"no": 14}, {"no": 15}, {"no": 20},
            {"no": 21}, {"no": 22}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Ivan Hasek"
    },
    "substitutions": [
        {"minute": 59, "teamId": "CZE", "off": {"no": 9}, "on": {"no": 11}},
        {"minute": 73, "teamId": "KOR", "off": {"no": 11}, "on": {"no": 17}},
        {"minute": 80, "teamId": "KOR", "off": {"no": 9}, "on": {"no": 18}},
    ],
    "cards": [
        {"minute": 42, "teamId": "KOR", "player": {"no": 4}, "card": "yellow"},
        {"minute": 55, "teamId": "CZE", "player": {"no": 7}, "card": "yellow"},
    ]
}
print("Added Match 2: KOR vs CZE")

# ======================================================================
# Match 3: CZE vs RSA (from current clipboard)
# Formation: CZE 3-5-2, RSA 4-3-3
# ======================================================================
detail["3"] = {
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
        {"minute": 6, "teamId": "CZE", "player": {"no": 18}, "card": "yellow"},  
        {"minute": 83, "teamId": "RSA", "player": {"no": 4}, "card": "yellow"},
    ]
}
print("Added Match 3: CZE vs RSA")

# ======================================================================
# Match 4: MEX vs KOR
# ======================================================================
detail["4"] = {
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
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 17, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 16, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 24, "pos": "MF"},
            {"no": 25, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 13}, {"no": 4}, {"no": 15},
            {"no": 18}, {"no": 19}, {"no": 20},
            {"no": 11}, {"no": 14}, {"no": 21}, {"no": 22},
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
            {"no": 11, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 17, "pos": "MF"},
            {"no": 18, "pos": "FW"},
            {"no": 19, "pos": "MF"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 21}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 16}, {"no": 20},
            {"no": 22}, {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Hong Myung-Bo"
    },
    "substitutions": [
        {"minute": 75, "teamId": "MEX", "off": {"no": 24}, "on": {"no": 20}},
        {"minute": 83, "teamId": "MEX", "off": {"no": 16}, "on": {"no": 11}},
    ],
    "cards": [
        {"minute": 42, "teamId": "KOR", "player": {"no": 2}, "card": "yellow"},
        {"minute": 68, "teamId": "MEX", "player": {"no": 5}, "card": "yellow"},
    ]
}
print("Added Match 4: MEX vs KOR")

# ======================================================================
# Match 5: CZE vs MEX
# ======================================================================
detail["5"] = {
    "team1": {
        "teamId": "CZE",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF"},
            {"no": 7, "pos": "DF", "captain": True},
            {"no": 8, "pos": "MF"},
            {"no": 12, "pos": "MF"},
            {"no": 14, "pos": "DF"},
            {"no": 18, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 17, "pos": "MF"},
            {"no": 19, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 16}, {"no": 23}, {"no": 3}, {"no": 6},
            {"no": 13}, {"no": 15}, {"no": 20},
            {"no": 21}, {"no": 22}, {"no": 24}, {"no": 25}, {"no": 26},
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
            {"no": 4, "pos": "MF"},
            {"no": 6, "pos": "MF"},
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 16, "pos": "FW"},
            {"no": 21, "pos": "FW"},
            {"no": 25, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 13}, {"no": 14}, {"no": 15},
            {"no": 17}, {"no": 18}, {"no": 19},
            {"no": 20}, {"no": 22}, {"no": 24},
        ],
        "coach": "Javier Aguirre"
    },
    "substitutions": [
        {"minute": 61, "teamId": "MEX", "off": {"no": 16}, "on": {"no": 11}},
        {"minute": 78, "teamId": "MEX", "off": {"no": 6}, "on": {"no": 17}},
    ],
    "cards": [
        {"minute": 33, "teamId": "CZE", "player": {"no": 5}, "card": "yellow"},
        {"minute": 55, "teamId": "MEX", "player": {"no": 3}, "card": "yellow"},
    ]
}
print("Added Match 5: CZE vs MEX")

# ======================================================================
# Match 6: RSA vs KOR
# ======================================================================
detail["6"] = {
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
            {"no": 9, "pos": "FW"},
            {"no": 12, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 5, "pos": "MF"},
        ],
        "substitutes": [
            {"no": 16}, {"no": 22}, {"no": 2}, {"no": 3},
            {"no": 18}, {"no": 24}, {"no": 26},
            {"no": 7}, {"no": 8}, {"no": 11}, {"no": 15}, {"no": 25},
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
            {"no": 3, "pos": "MF"},
            {"no": 6, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 17, "pos": "MF"},
            {"no": 18, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 21}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 16}, {"no": 19},
            {"no": 20}, {"no": 22}, {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Hong Myung-Bo"
    },
    "substitutions": [
        {"minute": 63, "teamId": "RSA", "off": {"no": 10}, "on": {"no": 12}},
        {"minute": 70, "teamId": "KOR", "off": {"no": 11}, "on": {"no": 17}},
        {"minute": 80, "teamId": "KOR", "off": {"no": 9}, "on": {"no": 18}},
    ],
    "cards": [
        {"minute": 45, "teamId": "RSA", "player": {"no": 13}, "card": "yellow"},
        {"minute": 75, "teamId": "KOR", "player": {"no": 6}, "card": "yellow"},
    ]
}
print("Added Match 6: RSA vs KOR")

# ======================================================================
# Match 19: USA vs PAR
# ======================================================================
detail["19"] = {
    "team1": {
        "teamId": "USA",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "MF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 6, "pos": "DF"},
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 14, "pos": "MF"},
            {"no": 20, "pos": "FW"},
            {"no": 17, "pos": "MF"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 13}, {"no": 15}, {"no": 16},
            {"no": 18}, {"no": 19}, {"no": 21}, {"no": 22},
            {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
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
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 16, "pos": "MF"},
            {"no": 18, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 22}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 19}, {"no": 20}, {"no": 21},
            {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Gustavo Alfaro"
    },
    "substitutions": [
        {"minute": 65, "teamId": "USA", "off": {"no": 20}, "on": {"no": 14}},
        {"minute": 78, "teamId": "PAR", "off": {"no": 17}, "on": {"no": 19}},
    ],
    "cards": [
        {"minute": 55, "teamId": "PAR", "player": {"no": 3}, "card": "yellow"},
    ]
}
print("Added Match 19: USA vs PAR")

# ======================================================================
# Match 20: AUS vs TUR
# ======================================================================
detail["20"] = {
    "team1": {
        "teamId": "AUS",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK", "captain": True},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 14, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 21, "pos": "DF"},
            {"no": 22, "pos": "MF"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 18}, {"no": 6}, {"no": 13},
            {"no": 15}, {"no": 16}, {"no": 19}, {"no": 20},
            {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
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
            {"no": 5, "pos": "MF"},
            {"no": 6, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 8, "pos": "FW"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 21, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 23}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 16}, {"no": 18}, {"no": 19},
            {"no": 20}, {"no": 22}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Vincenzo Montella"
    },
    "substitutions": [
        {"minute": 75, "teamId": "AUS", "off": {"no": 10}, "on": {"no": 17}},
        {"minute": 80, "teamId": "TUR", "off": {"no": 8}, "on": {"no": 18}},
    ],
    "cards": [
        {"minute": 55, "teamId": "TUR", "player": {"no": 5}, "card": "yellow"},
    ]
}
print("Added Match 20: AUS vs TUR")

# ======================================================================
# Match 21: USA vs AUS
# ======================================================================
detail["21"] = {
    "team1": {
        "teamId": "USA",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 6, "pos": "DF"},
            {"no": 4, "pos": "MF"},
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 14, "pos": "MF"},
            {"no": 17, "pos": "MF"},
            {"no": 20, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 16}, {"no": 18}, {"no": 19},
            {"no": 21}, {"no": 22}, {"no": 23}, {"no": 24},
            {"no": 25}, {"no": 26},
        ],
        "coach": "Mauricio Pochettino"
    },
    "team2": {
        "teamId": "AUS",
        "formation": "5-3-2",
        "startingXI": [
            {"no": 1, "pos": "GK", "captain": True},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF"},
            {"no": 14, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 7, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 21, "pos": "DF"},
            {"no": 22, "pos": "MF"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 18}, {"no": 6}, {"no": 13},
            {"no": 15}, {"no": 16}, {"no": 19}, {"no": 20},
            {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Tony Popovic"
    },
    "substitutions": [],
    "cards": [
        {"minute": 35, "teamId": "AUS", "player": {"no": 2}, "card": "yellow"},
    ]
}
print("Added Match 21: USA vs AUS")

# ======================================================================
# Match 22: TUR vs PAR
# ======================================================================
detail["22"] = {
    "team1": {
        "teamId": "TUR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "MF"},
            {"no": 6, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 8, "pos": "FW"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 21, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 23}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 16}, {"no": 18}, {"no": 19},
            {"no": 20}, {"no": 22}, {"no": 24}, {"no": 25}, {"no": 26},
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
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 18, "pos": "FW"},
            {"no": 16, "pos": "MF"},
            {"no": 19, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 22}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 17}, {"no": 20}, {"no": 21},
            {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Gustavo Alfaro"
    },
    "substitutions": [
        {"minute": 60, "teamId": "TUR", "off": {"no": 8}, "on": {"no": 18}},
        {"minute": 75, "teamId": "PAR", "off": {"no": 18}, "on": {"no": 17}},
    ],
    "cards": [
        {"minute": 44, "teamId": "TUR", "player": {"no": 5}, "card": "yellow"},
    ]
}
print("Added Match 22: TUR vs PAR")

# ======================================================================
# Match 23: TUR vs USA
# ======================================================================
detail["23"] = {
    "team1": {
        "teamId": "TUR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF", "captain": True},
            {"no": 5, "pos": "MF"},
            {"no": 6, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 8, "pos": "FW"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "FW"},
            {"no": 17, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 21, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 23}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 16}, {"no": 18}, {"no": 19},
            {"no": 20}, {"no": 22}, {"no": 24}, {"no": 25}, {"no": 26},
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
            {"no": 4, "pos": "MF", "captain": True},
            {"no": 5, "pos": "DF"},
            {"no": 6, "pos": "DF"},
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 14, "pos": "MF"},
            {"no": 20, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 13}, {"no": 15}, {"no": 16},
            {"no": 17}, {"no": 18}, {"no": 19}, {"no": 21},
            {"no": 22}, {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Mauricio Pochettino"
    },
    "substitutions": [
        {"minute": 46, "teamId": "TUR", "off": {"no": 11}, "on": {"no": 21}},
        {"minute": 70, "teamId": "USA", "off": {"no": 20}, "on": {"no": 17}},
    ],
    "cards": [
        {"minute": 62, "teamId": "TUR", "player": {"no": 4}, "card": "yellow"},
        {"minute": 85, "teamId": "USA", "player": {"no": 3}, "card": "yellow"},
    ]
}
print("Added Match 23: TUR vs USA")

# ======================================================================
# Match 24: PAR vs AUS
# ======================================================================
detail["24"] = {
    "team1": {
        "teamId": "PAR",
        "formation": "4-4-2",
        "startingXI": [
            {"no": 1, "pos": "GK"},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 4, "pos": "DF"},
            {"no": 5, "pos": "DF", "captain": True},
            {"no": 7, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 10, "pos": "MF"},
            {"no": 11, "pos": "MF"},
            {"no": 9, "pos": "FW"},
            {"no": 18, "pos": "FW"},
            {"no": 16, "pos": "MF"},
            {"no": 19, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 22}, {"no": 13}, {"no": 14},
            {"no": 15}, {"no": 17}, {"no": 20}, {"no": 21},
            {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Gustavo Alfaro"
    },
    "team2": {
        "teamId": "AUS",
        "formation": "5-3-2",
        "startingXI": [
            {"no": 1, "pos": "GK", "captain": True},
            {"no": 2, "pos": "DF"},
            {"no": 3, "pos": "DF"},
            {"no": 5, "pos": "DF"},
            {"no": 21, "pos": "DF"},
            {"no": 22, "pos": "MF"},
            {"no": 8, "pos": "MF"},
            {"no": 14, "pos": "MF"},
            {"no": 7, "pos": "FW"},
            {"no": 9, "pos": "FW"},
            {"no": 10, "pos": "FW"},
            {"no": 11, "pos": "FW"},
            {"no": 17, "pos": "FW"},
        ],
        "substitutes": [
            {"no": 12}, {"no": 18}, {"no": 4}, {"no": 6},
            {"no": 13}, {"no": 15}, {"no": 16}, {"no": 19},
            {"no": 20}, {"no": 23}, {"no": 24}, {"no": 25}, {"no": 26},
        ],
        "coach": "Tony Popovic"
    },
    "substitutions": [],
    "cards": [
        {"minute": 78, "teamId": "PAR", "player": {"no": 8}, "card": "yellow"},
    ]
}
print("Added Match 24: PAR vs AUS")

# Save
save_match_detail(detail)
print(f"\nTotal match entries: {len(detail)}")
print(f"Newly added: 1, 2, 3, 4, 5, 6, 19, 20, 21, 22, 23, 24")
