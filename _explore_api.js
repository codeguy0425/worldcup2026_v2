const https = require('https');
let d = '';
https.get('https://api.fifa.com/api/v3/live/football/400021456', res => {
  res.on('data', c => d += c);
  res.on('end', () => {
    const j = JSON.parse(d);
    
    console.log('=== TOP-LEVEL KEYS ===');
    Object.keys(j).forEach(k => {
      const v = j[k];
      if (v === null || v === undefined) return;
      const type = Array.isArray(v) ? 'array[' + v.length + ']' : typeof v;
      const val = typeof v === 'object' ? '' : String(v).substring(0, 60);
      console.log('  ' + k + ': ' + type + ' ' + val);
    });
    
    const home = j.HomeTeam;
    const away = j.AwayTeam;
    
    console.log('\n=== HOME TEAM KEYS ===');
    Object.keys(home).forEach(k => {
      const v = home[k];
      if (v === null || v === undefined) return;
      const type = Array.isArray(v) ? 'array[' + v.length + ']' : typeof v;
      console.log('  ' + k + ': ' + type);
    });
    
    console.log('\n=== GOALS ===');
    if (home.Goals && home.Goals.length) {
      home.Goals.forEach((g, i) => {
        const name = g.PlayerName ? (g.PlayerName[0] ? g.PlayerName[0].Description : '') : '';
        console.log('  [Home] Goal ' + (i+1) + ': Min=' + g.Minute + ' Player=' + name + ' Type=' + g.Type + ' IsOG=' + g.IsOwnGoal + ' IsPen=' + g.IsPenalty);
      });
    } else console.log('  [Home] (no goals listed)');
    if (away.Goals && away.Goals.length) {
      away.Goals.forEach((g, i) => {
        const name = g.PlayerName ? (g.PlayerName[0] ? g.PlayerName[0].Description : '') : '';
        console.log('  [Away] Goal ' + (i+1) + ': Min=' + g.Minute + ' Player=' + name + ' Type=' + g.Type);
      });
    } else console.log('  [Away] (no goals listed)');
    
    console.log('\n=== STATS ===');
    console.log('  BallPossession:', JSON.stringify(j.BallPossession));
    console.log('  Attendance:', j.Attendance);
    console.log('  MatchTime:', j.MatchTime);
    console.log('  Period:', j.Period);
    console.log('  Winner:', j.Winner);
    
    console.log('\n=== PLAYER FIELDS (first home player) ===');
    if (home.Players && home.Players.length > 0) {
      const p = home.Players[0];
      Object.keys(p).forEach(k => {
        const v = p[k];
        if (v === null || v === undefined) return;
        const type = Array.isArray(v) ? 'array[' + v.length + ']' : typeof v;
        const val = typeof v === 'object' ? '' : String(v).substring(0, 40);
        console.log('  ' + k + ': ' + type + ' ' + val);
      });
    }
    
    console.log('\n=== OFFICIALS ===');
    if (j.Officials) {
      j.Officials.forEach(o => {
        const name = o.NameShort ? (o.NameShort[0] ? o.NameShort[0].Description : '') : '';
        const full = o.Name ? (o.Name[0] ? o.Name[0].Description : '') : '';
        console.log('  ' + name + ' (' + full + ') Type=' + o.OfficialType);
      });
    }
    
    console.log('\n=== STADIUM ===');
    if (j.Stadium) {
      const name = j.Stadium.Name ? (j.Stadium.Name[0] ? j.Stadium.Name[0].Description : '') : '';
      const city = j.Stadium.CityName ? (j.Stadium.CityName[0] ? j.Stadium.CityName[0].Description : '') : '';
      console.log('  ' + name + ', ' + city + ' (Capacity: ' + j.Stadium.Capacity + ', Attendance: ' + j.Attendance + ')');
    }
  });
});
