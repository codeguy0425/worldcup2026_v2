const { execSync } = require('child_process');
const fs = require('fs');

const oldMatches = JSON.parse(execSync('git show HEAD~1:app/public/data/matches.json'));
const newMatches = JSON.parse(fs.readFileSync('app/public/data/matches.json', 'utf-8'));

const changed = [];
for (let i = 0; i < oldMatches.length; i++) {
  if (!oldMatches[i].goals) continue;
  for (let j = 0; j < oldMatches[i].goals.length; j++) {
    const oldG = oldMatches[i].goals[j];
    const newG = newMatches[i].goals[j];
    if (oldG.scorerNo == null && newG.scorerNo != null) {
      const matchNum = oldMatches[i].num || oldMatches[i].id;
      changed.push({
        match: matchNum,
        team: newG.teamId,
        scorer: newG.scorer,
        no: newG.scorerNo,
        og: !!newG.ownGoal,
        pen: !!newG.penalty,
        minute: newG.minute
      });
    }
  }
}

// Group by match
let currentMatch = -1;
changed.sort((a, b) => a.match - b.match);
for (const c of changed) {
  if (c.match !== currentMatch) {
    console.log(`\nMatch ${c.match}:`);
    currentMatch = c.match;
  }
  console.log(`  ${c.team} #${c.no} ${c.scorer} ${c.minute}'${c.og ? '(OG)' : ''}${c.pen ? '(PEN)' : ''}`);
}
console.log(`\nTotal: ${changed.length} goals enriched`);
