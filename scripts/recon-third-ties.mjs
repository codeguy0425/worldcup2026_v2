#!/usr/bin/env node
/**
 * Recon script: check if FIFA ranking would change third-placed order.
 *
 * The tiebreaker chain for third-placed ranking is:
 *   Pts → GD → GF → Fair Play → FIFA Ranking
 *
 * Fair play data is mostly unavailable (all zeros), so the effective chain is:
 *   Pts → GD → GF → FIFA Ranking
 *
 * This script finds teams tied on Pts + GD + GF, applies FIFA ranking,
 * and reports any differences vs the current sort (which uses teamId as fallback).
 *
 * Usage: node scripts/recon-third-ties.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const thirdPlaced = JSON.parse(readFileSync(resolve(ROOT, 'app/public/data/third-placed.json'), 'utf-8'))
const fifaRanking = JSON.parse(readFileSync(resolve(ROOT, 'data/fifa-ranking.json'), 'utf-8'))

const entries = thirdPlaced.rankings

// Group by Pts | GD | GF
const groups = {}
for (const e of entries) {
  const key = `${e.pts}|${e.gd}|${e.gf}`
  if (!groups[key]) groups[key] = []
  groups[key].push(e)
}

console.log('═══ Third-Placed Tie Recon ═══')
console.log(`Total entries: ${entries.length}\n`)

let anyTies = false
let anyImpact = false

for (const [key, tied] of Object.entries(groups)) {
  if (tied.length < 2) continue
  anyTies = true

  const [pts, gd, gf] = key.split('|')
  console.log(`🔗 Tie cluster: ${pts}pts | GD ${gd} | GF ${gf} (${tied.length} teams)\n`)

  // Sort by FIFA ranking (lower rank number = higher ranking = better)
  const sorted = [...tied].sort((a, b) => {
    const ra = fifaRanking[a.teamId]?.rank ?? 999
    const rb = fifaRanking[b.teamId]?.rank ?? 999
    return ra - rb
  })

  // Show current order vs FIFA-ranked order
  const currentOrder = tied.map(t => `${t.team} (${t.group})`).join(', ')
  const fifaOrder = sorted.map(t => `${t.team} (${t.group}) #${fifaRanking[t.teamId]?.rank ?? '?'}`).join(', ')

  console.log(`  Current ranking order: ${currentOrder}`)
  console.log(`  FIFA ranking order:   ${fifaOrder}`)

  // Check if FIFA ranking changes positions
  let changed = false
  for (let i = 0; i < tied.length; i++) {
    if (tied[i].teamId !== sorted[i].teamId) {
      changed = true
      break
    }
  }

  if (changed) {
    anyImpact = true
    console.log(`\n  ⚠️  FIFA ranking WOULD change the order!`)
    for (let i = 0; i < tied.length; i++) {
      if (tied[i].teamId !== sorted[i].teamId) {
        const old = tied[i]
        const nu = sorted[i]
        console.log(`     Current #${old.overall_rank}: ${old.team} → should be #${nu.overall_rank}: ${nu.team}`)
      }
    }
  } else {
    console.log(`\n  ✅ FIFA ranking confirms current order`)
  }
  console.log()
}

if (!anyTies) {
  console.log('✅ No ties on Pts+GD+GF — FIFA ranking not needed.\n')
}

console.log('═══ Summary ═══')
console.log(`Ties found:          ${anyTies ? 'yes' : 'no'}`)
console.log(`Would change order:  ${anyImpact ? '⚠️  YES' : '✅ no'}`)

if (anyImpact) {
  console.log('\n⚠️  Pipeline tiebreaker needs updating (group letter → FIFA ranking).')
} else {
  console.log('\n✅ Current sort (teamId fallback) produces same order as FIFA ranking.')
}
