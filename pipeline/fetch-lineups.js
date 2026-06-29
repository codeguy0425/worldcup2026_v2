// Fetch lineup/sub/card data from FIFA API for all remaining group matches
const fs = require('fs');
const https = require('https');

const urlMap = require('./fifa-urls').urlMap;
const matches = JSON.parse(fs.readFileSync('./app/public/data/matches.json', 'utf8'));
const matchDetail = JSON.parse(fs.readFileSync('./app/public/data/match-detail.json', 'utf8'));

function mapPosition(pos) {
  return ['GK', 'DF', 'MF', 'FW'][pos] || 'MF';
}

function cleanMinute(raw) {
  if (!raw || raw === '') return null;
  if (raw === 'HT') return 45;
  const m = raw.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : null;
}

function getStoppage(raw) {
  if (!raw || !raw.includes('+')) return undefined;
  const parts = raw.split('+');
  return parts.length > 1 ? parseInt(parts[1], 10) : undefined;
}

function getCoach(team) {
  const hc = (team.Coaches || []).find(c => c.Role === 0);
  if (!hc) return '';
  const name = hc.Alias?.[0]?.Description || hc.Name?.[0]?.Description || '';
  return name;
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    let d = '';
    https.get(url, res => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve(JSON.parse(d)); }
        catch(e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function processMatch(matchId, fifaUrl) {
  const fifaId = fifaUrl.split('/').pop();
  const url = `https://api.fifa.com/api/v3/live/football/${fifaId}`;
  const data = await fetchJSON(url);
  
  const home = data.HomeTeam;
  const away = data.AwayTeam;
  const homeCode = home.Abbreviation;
  const awayCode = away.Abbreviation;
  
  const homePlayers = home.Players || [];
  const awayPlayers = away.Players || [];
  
  const homeStarters = homePlayers.filter(p => p.Status === 1);
  const homeBench = homePlayers.filter(p => p.Status === 2);
  const awayStarters = awayPlayers.filter(p => p.Status === 1);
  const awayBench = awayPlayers.filter(p => p.Status === 2);
  
  // Process substitutions
  const subs = [];
  const homeSubs = home.Substitutions || [];
  const awaySubs = away.Substitutions || [];
  
  for (const ev of homeSubs) {
    const minute = cleanMinute(ev.Minute);
    if (!minute) continue;
    const pOff = homePlayers.find(p => p.IdPlayer === ev.IdPlayerOff);
    const pOn = homePlayers.find(p => p.IdPlayer === ev.IdPlayerOn);
    const s = { minute, teamId: homeCode, off: { no: pOff?.ShirtNumber || 0 }, on: { no: pOn?.ShirtNumber || 0 } };
    const st = getStoppage(ev.Minute);
    if (st) s.stoppageTime = st;
    subs.push(s);
  }
  
  for (const ev of awaySubs) {
    const minute = cleanMinute(ev.Minute);
    if (!minute) continue;
    const pOff = awayPlayers.find(p => p.IdPlayer === ev.IdPlayerOff);
    const pOn = awayPlayers.find(p => p.IdPlayer === ev.IdPlayerOn);
    const s = { minute, teamId: awayCode, off: { no: pOff?.ShirtNumber || 0 }, on: { no: pOn?.ShirtNumber || 0 } };
    const st = getStoppage(ev.Minute);
    if (st) s.stoppageTime = st;
    subs.push(s);
  }
  
  // Process cards
  const cards = [];
  const homeBookings = home.Bookings || [];
  const awayBookings = away.Bookings || [];
  
  for (const ev of homeBookings) {
    const minute = cleanMinute(ev.Minute);
    if (!minute) continue;
    const player = homePlayers.find(p => p.IdPlayer === ev.IdPlayer);
    const cardType = ev.CardType === 1 ? 'yellow' : ev.CardType === 2 ? 'second-yellow' : 'red';
    cards.push({ minute, teamId: homeCode, player: { no: player?.ShirtNumber || 0 }, card: cardType });
  }
  
  for (const ev of awayBookings) {
    const minute = cleanMinute(ev.Minute);
    if (!minute) continue;
    const player = awayPlayers.find(p => p.IdPlayer === ev.IdPlayer);
    const cardType = ev.CardType === 1 ? 'yellow' : ev.CardType === 2 ? 'second-yellow' : 'red';
    cards.push({ minute, teamId: awayCode, player: { no: player?.ShirtNumber || 0 }, card: cardType });
  }
  
  subs.sort((a, b) => (a.minute - b.minute) || ((a.stoppageTime || 0) - (b.stoppageTime || 0)));
    
  return {
    team1: {
      teamId: homeCode,
      formation: home.Tactics || '4-4-2',
      startingXI: homeStarters.map(p => ({
        no: p.ShirtNumber,
        pos: mapPosition(p.Position),
        captain: p.Captain || undefined
      })),
      substitutes: homeBench.map(p => ({ no: p.ShirtNumber })),
      coach: getCoach(home)
    },
    team2: {
      teamId: awayCode,
      formation: away.Tactics || '4-4-2',
      startingXI: awayStarters.map(p => ({
        no: p.ShirtNumber,
        pos: mapPosition(p.Position),
        captain: p.Captain || undefined
      })),
      substitutes: awayBench.map(p => ({ no: p.ShirtNumber })),
      coach: getCoach(away)
    },
    substitutions: subs,
    cards: cards
  };
}

async function main() {
  const target = process.argv[2];
  
  if (target === 'all') {
    const done = new Set(Object.keys(matchDetail));
    let added = 0, skipped = 0, failed = 0;
    
    for (const [matchId, fifaUrl] of Object.entries(urlMap)) {
      if (done.has(String(matchId))) {
        skipped++;
        continue;
      }
      
      process.stdout.write(`Match ${matchId}...`);
      try {
        const entry = await processMatch(matchId, fifaUrl);
        matchDetail[matchId] = entry;
        added++;
        console.log(` ✅ ${entry.team1.teamId} vs ${entry.team2.teamId} (${entry.substitutions.length} subs, ${entry.cards.length} cards)`);
      } catch (e) {
        failed++;
        console.log(` ❌ ${e.message}`);
      }
      
      // Small delay
      await new Promise(r => setTimeout(r, 200));
    }
    
    console.log(`\nDone! Added ${added}, skipped ${skipped}, failed ${failed}. Total: ${Object.keys(matchDetail).length}`);
    fs.writeFileSync('./app/public/data/match-detail.json', JSON.stringify(matchDetail, null, 2));
    
  } else if (target) {
    const fifaUrl = urlMap[target];
    if (!fifaUrl) {
      console.error(`Match ${target} not found in URL map`);
      process.exit(1);
    }
    const entry = await processMatch(target, fifaUrl);
    matchDetail[target] = entry;
    fs.writeFileSync('./app/public/data/match-detail.json', JSON.stringify(matchDetail, null, 2));
    console.log(`Added match ${target}: ${entry.team1.teamId} vs ${entry.team2.teamId}`);
    console.log(`  Starters: ${entry.team1.startingXI.length} vs ${entry.team2.startingXI.length}`);
    console.log(`  Subs events: ${entry.substitutions.length}, Cards: ${entry.cards.length}`);
  } else {
    console.log('Usage: node pipeline/fetch-lineups.js <matchId|all>');
  }
}

main().catch(console.error);
