const https = require('https');
let d = '';
https.get('https://api.fifa.com/api/v3/live/football/400021443', res => {
  res.on('data', c => d += c);
  res.on('end', () => {
    const j = JSON.parse(d);
    const home = j.HomeTeam;
    console.log('Home:', home.Abbreviation, 'Tactics:', home.Tactics);
    console.log('Players:');
    for (const p of home.Players) {
      console.log('  #' + p.ShirtNumber + ' FS=' + p.FieldStatus + ' S=' + p.Status + ' P=' + p.Position +
        ' Name=' + (p.ShortName?.[0]?.Description || ''));
    }
    const events = j.Event || [];
    console.log('\nEvents:', events.length);
    for (const e of events.slice(0, 15)) {
      console.log('  T' + e.EventType + ' M=' + e.Minute + ' POff=' + (e.IdPlayerOff||'') + ' POn=' + (e.IdPlayerOn||'') +
        ' Player=' + (e.IdPlayer||'') + ' Team=' + (e.IdTeam||''));
    }
    // Check Status values
    const statuses = [...new Set(home.Players.map(p => p.Status))];
    const fieldStatuses = [...new Set(home.Players.map(p => p.FieldStatus))];
    console.log('\nStatus values:', statuses);
    console.log('FieldStatus values:', fieldStatuses);
  });
});
