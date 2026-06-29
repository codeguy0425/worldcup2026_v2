const https = require('https');

const ids = ['400021518', '400021456', '400021443', '400021441', '400021440'];

function fetchOne(id) {
  return new Promise(resolve => {
    let d = '';
    https.get('https://api.fifa.com/api/v3/live/football/' + id, res => {
      res.on('data', c => d += c);
      res.on('end', () => {
        const j = JSON.parse(d);
        const home = j.HomeTeam;
        const away = j.AwayTeam;
        const events = j.Event || [];
        const subs = events.filter(e => e.EventType === 4 || e.EventType === 5);
        const cards = events.filter(e => e.EventType === 6 || e.EventType === 7 || e.EventType === 8);
        const starters = home.Players.filter(p => p.Status === 1);
        const bench = home.Players.filter(p => p.Status === 2);
        
        // Match name from Competition
        const known = {
          '400021518': 'RSA vs CAN',
          '400021456': 'BRA vs MAR',
          '400021443': 'MEX vs RSA',
          '400021441': 'KOR vs CZE',
          '400021440': 'CZE vs RSA'
        };
        
        console.log(id + ' (' + (known[id] || '?') + '):');
        console.log('  ' + home.Abbreviation + ' vs ' + away.Abbreviation);
        console.log('  Starters: ' + starters.length + ', Bench: ' + bench.length);
        console.log('  Events total: ' + events.length + ', Subs: ' + subs.length + ', Cards: ' + cards.length);
        if (subs.length > 0) {
          for (const s of subs) {
            const t = s.IdTeam === home.IdTeam ? home.Abbreviation : away.Abbreviation;
            console.log('    Sub: ' + t + ' M=' + s.Minute + ' Off=' + (s.IdPlayerOff||'') + ' On=' + (s.IdPlayerOn||''));
          }
        }
        if (cards.length > 0) {
          for (const c of cards) {
            const t = c.IdTeam === home.IdTeam ? home.Abbreviation : away.Abbreviation;
            console.log('    Card: ' + t + ' M=' + c.Minute + ' P=' + (c.IdPlayer||''));
          }
        }
        console.log();
        resolve();
      });
    });
  });
}

(async () => {
  for (const id of ids) {
    await fetchOne(id);
  }
})();
