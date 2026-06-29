// Paste FIFA LINE UP clipboard text here: save file, then run:
// node pipeline/parse-clipboard.js < match-id > path/to/clipboard.txt
// Example: node pipeline/parse-clipboard.js 24 _clipboard_raw.txt

const fs = require('fs');
const mid = process.argv[2];  // match ID
const filePath = process.argv[3];
const text = fs.readFileSync(filePath, 'utf8');

function parseClipboard(matchId, raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  
  // Find formations and team names
  const titleMatch = raw.match(/(\w+(?:\s+\w+)*)\s+vs\.\s+(\w+(?:\s+\w+)*)/);
  const team1Name = titleMatch?.[1]?.trim() || 'Team1';
  const team2Name = titleMatch?.[2]?.trim() || 'Team2';
  
  // Find formations
  let team1Form = '4-4-2', team2Form = '4-4-2';
  const formMatch = raw.match(/(\w+(?:\s+\w+)*)\n(\d-\d-\d+)\n\n(\w+(?:\s+\w+)*)\n(\d-\d-\d+)/);
  if (formMatch) {
    team1Form = formMatch[2];
    team2Form = formMatch[4];
  }
  
  // Team code mapping
  const teamCodes = {
    'Mexico': 'MEX', 'South Africa': 'RSA', 'Korea Republic': 'KOR',
    'Czechia': 'CZE', 'Bosnia and Herzegovina': 'BIH', 'Canada': 'CAN',
    'Qatar': 'QAT', 'Switzerland': 'SUI', 'Brazil': 'BRA',
    'Morocco': 'MAR', 'Haiti': 'HAI', 'Scotland': 'SCO',
    'USA': 'USA', 'Paraguay': 'PAR', 'Australia': 'AUS',
    'Türkiye': 'TUR', 'Germany': 'GER', 'Curaçao': 'CUW',
    "C\u00f4te d'Ivoire": 'CIV', 'Côte d\'Ivoire': 'CIV', 'Ecuador': 'ECU',
    'Netherlands': 'NED', 'Japan': 'JPN', 'Sweden': 'SWE',
    'Tunisia': 'TUN', 'Belgium': 'BEL', 'Egypt': 'EGY',
    'IR Iran': 'IRN', 'New Zealand': 'NZL', 'Spain': 'ESP',
    'Cabo Verde': 'CPV', 'Saudi Arabia': 'KSA', 'Uruguay': 'URU',
    'France': 'FRA', 'Senegal': 'SEN', 'Iraq': 'IRQ',
    'Norway': 'NOR', 'Argentina': 'ARG', 'Algeria': 'ALG',
    'Austria': 'AUT', 'Jordan': 'JOR', 'Portugal': 'POR',
    'Congo DR': 'COD', 'Uzbekistan': 'UZB', 'Colombia': 'COL',
    'England': 'ENG', 'Croatia': 'CRO', 'Ghana': 'GHA',
    'Panama': 'PAN'
  };
  const t1Code = teamCodes[team1Name] || team1Name.substring(0,3).toUpperCase();
  const t2Code = teamCodes[team2Name] || team2Name.substring(0,3).toUpperCase();
  
  // Extract coach names
  const coachMatch = raw.match(/Coach\n\w\n([^\n]+)\nCoach\n\w\n([^\n]+)/);
  const coach1 = coachMatch?.[1]?.trim() || '';
  const coach2 = coachMatch?.[2]?.trim() || '';
  
  // Parse Starting Line Up section
  // The Starting Line Up contains ALL participants, some with time markers
  // Players with time markers (like 67', HT) in Starting Line Up = subbed OFF
  // Players with time markers in Substitutions = came ON
  
  // Split into Starting Line Up and Substitutions
  const parts = raw.split(/Substitutions\n\n/);
  // parts[0] = everything before first Substitutions (includes both starting XIs)
  // parts[1] = substitutions for team1
  // parts[2] = substitutions for team2
  
  let team1StartingSection = '';
  let team2StartingSection = '';
  const startSplit = parts[0].split(/Starting Line Up\n/);
  if (startSplit.length >= 3) {
    // [0] = header, [1] = team1 starting section, [2] = team2 starting section
    const t1StartRaw = startSplit[1];
    const t2StartRaw = startSplit[2];
    
    // Remove formations section
    const t1Parts = t1StartRaw.split(team1Name);
    // last part is the actual lineup
    const t1Lines = t1Parts[t1Parts.length - 1]?.split('\n').map(l => l.trim()).filter(Boolean) || [];
    const t2Lines = t2StartRaw?.split('\n').map(l => l.trim()).filter(Boolean) || [];
    
    team1StartingSection = t1Lines.join('\n');
    team2StartingSection = t2Lines.join('\n');
  }
  
  console.log(JSON.stringify({
    matchId,
    team1: { name: team1Name, code: t1Code, formation: team1Form, coach: coach1 },
    team2: { name: team2Name, code: t2Code, formation: team2Form, coach: coach2 },
    rawLength: raw.length
  }, null, 2));
}

parseClipboard(mid, text);
