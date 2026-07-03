const fs = require('fs');
const s = JSON.parse(fs.readFileSync('app/public/data/squads.json', 'utf-8'));
const por = s.POR;
if (por) {
  console.log('Portugal squad:');
  por.forEach(p => console.log('  #' + p.no + ' ' + p.name + ' (' + p.pos + ')'));
} else {
  console.log('POR not found in squads.json');
  console.log('Keys:', Object.keys(s).slice(0, 10));
}
