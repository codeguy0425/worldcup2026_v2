/**
 * FIFA 2026 World Cup — Third-placed Combination Matrix (Annex C)
 *
 * When all 12 groups have completed, 8 of the 12 third-placed teams qualify.
 * FIFA's combination matrix (495 entries) maps each possible set of 8 qualifying
 * groups to a deterministic assignment of third-placed teams to the 8 Round-of-32
 * slots that play against group winners (1A, 1B, 1D, 1E, 1G, 1I, 1K, 1L).
 *
 * Matrix key: the 8 qualifying group letters sorted alphabetically and concatenated
 *   (e.g. "DEFGHIJKL" means groups D through L qualified, A/B/C did not).
 * Matrix value: an object mapping winner-slot → third-placed group.
 *
 * Only the first 9 rows (of 495) are embedded below. The remaining 486 rows
 * need to be filled in from the full FIFA Annex C table.
 */

// ─── Winner-slot to match-ID lookup ──────────────────────────────────────────
// These are the 8 Round-of-32 matches where a group winner plays a third-placed
// team. The third-placed team always occupies team2Id in these matches.
const WINNER_TO_MATCH = {
  '1A': 79,
  '1B': 85,
  '1D': 81,
  '1E': 74,
  '1G': 82,
  '1I': 77,
  '1K': 87,
  '1L': 80,
}

// ─── Combination Matrix ──────────────────────────────────────────────────────
// Key:  8 qualifying groups, sorted A–L, concatenated (e.g. "DEFGHIJKL")
// Value: { winnerSlot: thirdGroup }   e.g. "1A":"3E"
//
// ═══════════════════════════════════════════════════════════════════════════════
//  NOTE: Only the first 9 rows of 495 are listed below.  The remaining
//  486 rows must be filled in from the official FIFA Annex C table.
//  Each entry represents one combination of which 4 groups' third-placed teams
//  are EXCLUDED (i.e. which 4 of the 12 groups do NOT qualify a third-placed).
// ═══════════════════════════════════════════════════════════════════════════════
const MATRIX_ENTRIES = [
  // Row 1: excluded={A,B,C,D}  qualifying={E,F,G,H,I,J,K,L}
  { key: 'EFGHIJKL', assign: { '1A':'3E', '1B':'3J', '1D':'3I', '1E':'3F', '1G':'3H', '1I':'3G', '1K':'3L', '1L':'3K' } },
  // Row 2: excluded={A,B,C,E}  qualifying={D,F,G,H,I,J,K,L}
  { key: 'DFGHIJKL', assign: { '1A':'3H', '1B':'3G', '1D':'3I', '1E':'3D', '1G':'3J', '1I':'3F', '1K':'3L', '1L':'3K' } },
  // Row 3: excluded={A,B,C,F}  qualifying={D,E,G,H,I,J,K,L}
  { key: 'DEGHIJKL', assign: { '1A':'3E', '1B':'3J', '1D':'3I', '1E':'3D', '1G':'3H', '1I':'3G', '1K':'3L', '1L':'3K' } },
  // Row 4: excluded={A,B,C,G}  qualifying={D,E,F,H,I,J,K,L}
  { key: 'DEFHIJKL', assign: { '1A':'3E', '1B':'3J', '1D':'3I', '1E':'3D', '1G':'3H', '1I':'3F', '1K':'3L', '1L':'3K' } },
  // Row 5: excluded={A,B,C,H}  qualifying={D,E,F,G,I,J,K,L}
  { key: 'DEFGIJKL', assign: { '1A':'3E', '1B':'3G', '1D':'3I', '1E':'3D', '1G':'3J', '1I':'3F', '1K':'3L', '1L':'3K' } },
  // Row 6: excluded={A,B,C,I}  qualifying={D,E,F,G,H,J,K,L}
  { key: 'DEFGHJKL', assign: { '1A':'3E', '1B':'3G', '1D':'3J', '1E':'3D', '1G':'3H', '1I':'3F', '1K':'3L', '1L':'3K' } },
  // Row 7: excluded={A,B,C,J}  qualifying={D,E,F,G,H,I,K,L}
  { key: 'DEFGHIKL', assign: { '1A':'3E', '1B':'3G', '1D':'3I', '1E':'3D', '1G':'3H', '1I':'3F', '1K':'3L', '1L':'3K' } },
  // Row 8: excluded={A,B,C,K}  qualifying={D,E,F,G,H,I,J,L}
  { key: 'DEFGHIJL', assign: { '1A':'3E', '1B':'3G', '1D':'3J', '1E':'3D', '1G':'3H', '1I':'3F', '1K':'3L', '1L':'3I' } },
  // Row 9: excluded={A,B,C,L}  qualifying={D,E,F,G,H,I,J,K}
  { key: 'DEFGHIJK', assign: { '1A':'3E', '1B':'3G', '1D':'3J', '1E':'3D', '1G':'3H', '1I':'3F', '1K':'3I', '1L':'3K' } },
  // Row 10: excluded={A,C,G,H}  qualifying={B,D,E,F,I,J,K,L}
  { key: 'BDEFIJKL', assign: { '1A':'3E', '1B':'3J', '1D':'3B', '1E':'3D', '1G':'3I', '1I':'3F', '1K':'3L', '1L':'3K' } },
  // ═══ ADD ROWS 10–495 HERE ═══
]

// Build the lookup Map
export const COMBINATION_MATRIX = new Map(MATRIX_ENTRIES.map(e => [e.key, e.assign]))


/**
 * Resolve third-placed team assignment using the FIFA combination matrix.
 *
 * @param {string[]} qualifiedGroups  – Sorted array of 8 qualifying group letters
 * @param {Array}    thirdEntries     – Output of computeThirdPlaced()
 * @param {Object}   teamsMap         – Team ID → team info lookup
 * @returns {Object<number,string>}   Map of matchId → resolved teamId, or empty {}
 *                                     if the combination is not yet in the matrix.
 */
export function resolveThirdPlaced(qualifiedGroups, thirdEntries, teamsMap) {
  if (!qualifiedGroups || qualifiedGroups.length !== 8) return {}

  const key = [...qualifiedGroups].sort().join('')
  const assignment = COMBINATION_MATRIX.get(key)
  if (!assignment) return {}

  // Build a quick lookup: group letter → third-placed teamId
  const thirdByGroup = {}
  for (const entry of thirdEntries) {
    thirdByGroup[entry.group] = entry.teamId
  }

  const result = {}
  for (const [winnerSlot, thirdGroup] of Object.entries(assignment)) {
    // thirdGroup is like "3E" → extract group letter "E"
    const g = thirdGroup.replace(/^3/, '')
    const teamId = thirdByGroup[g]
    if (!teamId) {
      // Shouldn't happen if all 8 qualifying groups have a third-placed entry
      continue
    }
    const matchId = WINNER_TO_MATCH[winnerSlot]
    if (matchId) {
      result[matchId] = teamId
    }
  }

  return result
}
