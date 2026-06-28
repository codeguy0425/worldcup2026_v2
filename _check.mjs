import { readFileSync } from 'fs';
const zh = JSON.parse(readFileSync('./app/public/data/squads-zh.json', 'utf-8'));
const en = JSON.parse(readFileSync('./app/public/data/squads.json', 'utf-8'));

// For each ZH team, find which EN team it likely matches
for (const [teamId, players] of Object.entries(zh)) {
  const e = en[teamId];
  if (!e) { console.log(teamId, 'NO EN DATA'); continue; }
  const zm = {}; players.forEach(p => zm[p.no] = p);
  const enNames = e.slice(0, 3).map(p => ({ no: p.no, name: p.name, zh: zm[p.no]?.name || '?' }));
  console.log(teamId, ':', enNames.map(n => n.no + ':' + n.name.slice(0,20) + '→' + n.zh.slice(0,10)).join(', '));
}
