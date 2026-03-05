#!/usr/bin/env node
/**
 * FIND ALL CLUBS — The Definitive UK Football Scraper
 *
 * Goes through the ENTIRE UK football pyramid systematically:
 *   1. Loads the master structure (every league, every level)
 *   2. Queries YOUR Supabase CRM to see what you already have
 *   3. For each league: searches SERP API, extracts clubs, deduplicates
 *   4. Upserts ONLY new clubs into your CRM
 *
 * Fully resumable. Tracks state per-league.
 *
 * Usage:
 *   node scrapers/find-all-clubs.js                         # full run
 *   node scrapers/find-all-clubs.js --resume                # continue
 *   node scrapers/find-all-clubs.js --category Junior       # one category
 *   node scrapers/find-all-clubs.js --country Scotland      # one country
 *   node scrapers/find-all-clubs.js --dry-run               # don't write to DB
 *   node scrapers/find-all-clubs.js --stats                 # show DB stats only
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const STRUCTURE = require('./uk-football-structure');

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SERP_API_KEY = process.env.SERP_API_KEY;
const TABLE = process.env.SUPABASE_TABLE || 'clubs';
const STATE_FILE = path.join(__dirname, '..', 'scraper-state.json');
const RATE_MS = 1500; // ms between SERP calls

if (!SUPABASE_URL || !SUPABASE_KEY) { console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env'); process.exit(1); }
if (!SERP_API_KEY) { console.error('Missing SERP_API_KEY in .env'); process.exit(1); }

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE — Read existing data for deduplication
// ═══════════════════════════════════════════════════════════════════════════════

async function getExistingClubs() {
  console.log('  Loading existing clubs from CRM...');

  // Get total count first
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1`, {
    headers: { ...headers, 'Prefer': 'count=exact' }
  });
  if (!countRes.ok) throw new Error(`Supabase error: ${countRes.status}`);
  const total = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0');
  console.log(`  Found ${total.toLocaleString()} existing clubs`);

  // Fetch all club names + league names for dedup (only these two fields)
  const existing = new Set();
  const batchSize = 1000;

  for (let offset = 0; offset < total; offset += batchSize) {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${TABLE}?select=club_name,league_name&offset=${offset}&limit=${batchSize}`,
      { headers }
    );
    if (!res.ok) continue;
    const rows = await res.json();
    for (const r of rows) {
      // Dedupe key: lowercase name + league
      const key = `${(r.club_name || '').toLowerCase().trim()}||${(r.league_name || '').toLowerCase().trim()}`;
      existing.add(key);
    }
    process.stdout.write(`\r  Loaded ${Math.min(offset + batchSize, total).toLocaleString()}/${total.toLocaleString()} for dedup`);
  }
  console.log('');

  return existing;
}

async function getDBStats() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${TABLE}?select=category,league_name&limit=50000`,
    { headers }
  );
  if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
  const rows = await res.json();

  const byCategory = {};
  const byLeague = {};

  for (const r of rows) {
    const cat = r.category || 'Unknown';
    const league = r.league_name || 'Unknown';
    byCategory[cat] = (byCategory[cat] || 0) + 1;
    byLeague[league] = (byLeague[league] || 0) + 1;
  }

  return { total: rows.length, byCategory, byLeague };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE — Write new clubs
// ═══════════════════════════════════════════════════════════════════════════════

async function upsertClubs(clubs, dryRun = false) {
  if (!clubs.length || dryRun) return { inserted: clubs.length, errors: 0 };

  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < clubs.length; i += 200) {
    const batch = clubs.slice(i, i + 200);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(batch)
      });

      if (res.ok) {
        const data = await res.json();
        inserted += data.length;
      } else {
        // Fallback: one-by-one
        for (const club of batch) {
          try {
            const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
              method: 'POST',
              headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=minimal' },
              body: JSON.stringify(club)
            });
            if (r.ok) inserted++;
            else errors++;
          } catch { errors++; }
        }
      }
    } catch (e) {
      console.error(`    Batch error: ${e.message}`);
      errors += batch.length;
    }
  }

  return { inserted, errors };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERP API — Search Google
// ═══════════════════════════════════════════════════════════════════════════════

async function serpSearch(query, num = 100) {
  const params = new URLSearchParams({
    api_key: SERP_API_KEY,
    q: query,
    num: String(num),
    gl: 'gb',
    hl: 'en'
  });

  const res = await fetch(`https://serpapi.com/search.json?${params}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SERP ${res.status}: ${text.slice(0, 200)}`);
  }
  return res.json();
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXTRACTION — Pull club names from search results
// ═══════════════════════════════════════════════════════════════════════════════

// Words that are definitely NOT club names
const BLACKLIST = new Set([
  'premier league', 'championship', 'national league', 'football association',
  'full time', 'wikipedia', 'bbc sport', 'sky sports', 'the guardian',
  'the telegraph', 'the athletic', 'football league', 'league table',
  'transfer news', 'match report', 'highlights', 'fixtures and results',
  'how to watch', 'live stream', 'breaking news', 'latest news',
  'season review', 'league cup', 'fa cup', 'carabao cup', 'efl trophy',
]);

function extractClubsFromSerp(serpData, entry) {
  const clubs = [];
  const seen = new Set();
  const results = serpData.organic_results || [];

  for (const r of results) {
    const title = r.title || '';
    const snippet = r.snippet || '';
    const link = r.link || '';
    const text = `${title} ${snippet}`;

    // ── Pattern 1: Standard club names with known suffixes ──
    const suffixPattern = /\b([A-Z][a-zA-Z\s&'.()-]{1,42}(?:FC|A\.?F\.?C\.?|United|City|Town|Rovers|Wanderers|Athletic|Rangers|Albion|Hotspur|Wednesday|Forest|Orient|Palace|Argyle|Harriers|Stanley|Alexandra|Borough|Academicals|Thistle|Celtic|Hearts|Hibs|Swifts|Dynamo|Casuals|Corinthians))\b/g;
    for (const m of text.matchAll(suffixPattern)) {
      addClub(m[1], link);
    }

    // ── Pattern 2: Junior/youth clubs ──
    const juniorPattern = /\b([A-Z][a-zA-Z\s&'.()-]{1,42}(?:Juniors|Youth|Colts|Boys|Girls|Minors|Academy|Under[-\s]?\d+s?))\b/g;
    for (const m of text.matchAll(juniorPattern)) {
      addClub(m[1], link);
    }

    // ── Pattern 3: Ladies/women's clubs ──
    const womenPattern = /\b([A-Z][a-zA-Z\s&'.()-]{1,42}(?:Ladies|Women|Girls)(?:\s+FC)?)\b/g;
    for (const m of text.matchAll(womenPattern)) {
      addClub(m[1], link);
    }

    // ── Pattern 4: Soccer schools / academies ──
    if (entry.category === 'Soccer School') {
      const schoolPattern = /\b([A-Z][a-zA-Z\s&'.()-]{1,42}(?:Soccer School|Football Academy|Football School|Coaching Academy|Soccer Academy))\b/gi;
      for (const m of text.matchAll(schoolPattern)) {
        addClub(m[1], link);
      }
      // Also try title-based extraction for businesses
      const titleMatch = title.match(/^(.+?(?:Soccer|Football)\s*(?:School|Academy|Coaching))/i);
      if (titleMatch) addClub(titleMatch[1], link);
    }

    // ── Pattern 5: Disability-specific ──
    if (entry.category === 'Disability') {
      const disPattern = /\b([A-Z][a-zA-Z\s&'.()-]{1,42}(?:Powerchair|Blind|Deaf|Amputee|Frame|Wheelchair)(?:\s+Football)?(?:\s+Club)?)\b/g;
      for (const m of text.matchAll(disPattern)) {
        addClub(m[1], link);
      }
    }

    // ── Pattern 6: Walking football ──
    if (entry.category === 'Walking Football') {
      const walkPattern = /\b([A-Z][a-zA-Z\s&'.()-]{1,42}Walking Football(?:\s+Club)?)\b/g;
      for (const m of text.matchAll(walkPattern)) {
        addClub(m[1], link);
      }
    }

    // ── Pattern 7: Generic "Football Club" / "Sports Club" ──
    const genericPattern = /\b([A-Z][a-zA-Z\s&'.()-]{1,42}(?:Football Club|Sports Club|Soccer Club))\b/g;
    for (const m of text.matchAll(genericPattern)) {
      addClub(m[1], link);
    }
  }

  function addClub(rawName, sourceUrl) {
    let name = rawName.trim()
      .replace(/\s+/g, ' ')
      .replace(/^(?:The|A)\s+/i, '');

    if (name.length < 3 || name.length > 55) return;
    if (BLACKLIST.has(name.toLowerCase())) return;
    if (/^(This|That|Their|These|From|With|About|How|What|When|Where|Which|Who|Why|Our|Your|All|New|Top|Best|Most)\s/i.test(name)) return;
    if (/^\d{4}/.test(name)) return;
    if (/\b(league|cup|trophy|season|division|round|match|final|semi|quarter)\s*$/i.test(name)) return;

    const key = name.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      clubs.push({
        club_name: name,
        league_name: entry.league,
        sport: 'Football',
        category: entry.category,
        pyramid_level: entry.level,
        region: entry.region,
        country: entry.country,
        source: 'serp_api',
        source_url: sourceUrl || null,
        stage: 'Not Contacted',
        est_value: 0
      });
    }
  }

  return clubs;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATE — Resumable progress tracking
// ═══════════════════════════════════════════════════════════════════════════════

function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  return { completed: [], totalInserted: 0, totalFound: 0, errors: 0 };
}

function saveState(state) {
  state.lastRun = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

async function main() {
  const args = process.argv.slice(2);
  const isResume = args.includes('--resume');
  const dryRun = args.includes('--dry-run');
  const statsOnly = args.includes('--stats');
  const categoryFilter = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;
  const countryFilter = args.includes('--country') ? args[args.indexOf('--country') + 1] : null;

  console.log('\n');
  console.log('  ╔══════════════════════════════════════════════════════╗');
  console.log('  ║     UK FOOTBALL PYRAMID — COMPLETE CLUB FINDER      ║');
  console.log('  ║     Every club. Every level. No duplicates.         ║');
  console.log('  ╚══════════════════════════════════════════════════════╝');
  console.log('');

  // ── Stats mode ──
  if (statsOnly) {
    console.log('  Fetching database stats...\n');
    const stats = await getDBStats();
    console.log(`  Total clubs in CRM: ${stats.total.toLocaleString()}\n`);
    console.log('  BY CATEGORY:');
    for (const [cat, count] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
      console.log(`    ${cat.padEnd(25)} ${count.toLocaleString()}`);
    }
    console.log(`\n  BY LEAGUE (top 20):`);
    const topLeagues = Object.entries(stats.byLeague).sort((a, b) => b[1] - a[1]).slice(0, 20);
    for (const [league, count] of topLeagues) {
      console.log(`    ${league.padEnd(45)} ${count.toLocaleString()}`);
    }
    return;
  }

  // ── Load state ──
  const state = isResume ? loadState() : { completed: [], totalInserted: 0, totalFound: 0, errors: 0 };

  if (isResume && state.completed.length) {
    console.log(`  Resuming: ${state.completed.length} leagues done, ${state.totalInserted.toLocaleString()} clubs inserted\n`);
  }

  if (dryRun) console.log('  ** DRY RUN — no data will be written **\n');

  // ── Filter structure ──
  let entries = [...STRUCTURE];
  if (categoryFilter) {
    entries = entries.filter(e => e.category.toLowerCase() === categoryFilter.toLowerCase());
    console.log(`  Category filter: ${categoryFilter} (${entries.length} entries)\n`);
  }
  if (countryFilter) {
    entries = entries.filter(e => e.country.toLowerCase() === countryFilter.toLowerCase());
    console.log(`  Country filter: ${countryFilter} (${entries.length} entries)\n`);
  }

  // ── Load existing clubs for dedup ──
  let existingSet;
  if (!dryRun) {
    existingSet = await getExistingClubs();
  } else {
    existingSet = new Set();
  }

  // ── Filter to pending ──
  const pending = entries.filter(e => !state.completed.includes(e.id));

  // Show what we're about to do
  const totalSearches = pending.reduce((s, e) => s + e.searches.length, 0);
  console.log(`  Structure: ${STRUCTURE.length} total leagues defined`);
  console.log(`  Remaining: ${pending.length} leagues to scrape`);
  console.log(`  Searches:  ${totalSearches} SERP API calls needed`);
  console.log(`  Est. time: ~${Math.ceil(totalSearches * RATE_MS / 60000)} minutes\n`);
  console.log('  ──────────────────────────────────────────────────────\n');

  let sessionInserted = 0;
  let sessionFound = 0;
  let sessionSkipped = 0;

  for (let i = 0; i < pending.length; i++) {
    const entry = pending[i];
    const pct = Math.round((i / pending.length) * 100);
    console.log(`  [${i + 1}/${pending.length}] (${pct}%) ${entry.category} | ${entry.league}`);
    console.log(`    ${entry.country} > ${entry.region} > Level ${entry.level}`);

    let allClubs = [];

    // Run each search query for this league
    for (let s = 0; s < entry.searches.length; s++) {
      const query = entry.searches[s];
      try {
        const serpData = await serpSearch(query);
        const clubs = extractClubsFromSerp(serpData, entry);

        // Deduplicate within this batch
        const newClubs = clubs.filter(c => {
          const key = `${c.club_name.toLowerCase().trim()}||${(c.league_name || '').toLowerCase().trim()}`;
          return !existingSet.has(key);
        });

        allClubs.push(...newClubs);
        console.log(`    Search ${s + 1}/${entry.searches.length}: ${clubs.length} found, ${newClubs.length} new`);

        await sleep(RATE_MS);

      } catch (e) {
        console.error(`    Search error: ${e.message}`);
        state.errors++;

        if (e.message.includes('429') || e.message.includes('rate')) {
          console.log('    Rate limited — waiting 60s...');
          await sleep(60000);
        } else {
          await sleep(3000);
        }
      }
    }

    // Deduplicate within allClubs (across multiple searches for same league)
    const uniqueMap = new Map();
    for (const c of allClubs) {
      const key = c.club_name.toLowerCase().trim();
      if (!uniqueMap.has(key)) uniqueMap.set(key, c);
    }
    const uniqueClubs = [...uniqueMap.values()];

    // Upsert to CRM
    if (uniqueClubs.length > 0) {
      const { inserted, errors } = await upsertClubs(uniqueClubs, dryRun);
      sessionInserted += inserted;
      sessionFound += uniqueClubs.length;
      state.totalInserted += inserted;
      state.totalFound += uniqueClubs.length;

      // Add to existing set so next leagues don't duplicate
      for (const c of uniqueClubs) {
        existingSet.add(`${c.club_name.toLowerCase().trim()}||${(c.league_name || '').toLowerCase().trim()}`);
      }

      console.log(`    => ${inserted} inserted to CRM (${errors} errors) | Running total: ${state.totalInserted.toLocaleString()}`);
    } else {
      sessionSkipped++;
      console.log(`    => No new clubs found`);
    }

    // Save state after each league
    state.completed.push(entry.id);
    saveState(state);
    console.log('');
  }

  // ── Summary ──
  console.log('  ══════════════════════════════════════════════════════');
  console.log('  COMPLETE!\n');
  console.log(`  This session:`);
  console.log(`    Leagues processed:  ${pending.length}`);
  console.log(`    New clubs found:    ${sessionFound.toLocaleString()}`);
  console.log(`    Clubs inserted:     ${sessionInserted.toLocaleString()}`);
  console.log(`    Leagues with 0 new: ${sessionSkipped}`);
  console.log(`    Errors:             ${state.errors}`);
  console.log('');
  console.log(`  All time:`);
  console.log(`    Total inserted:     ${state.totalInserted.toLocaleString()}`);
  console.log(`    Leagues completed:  ${state.completed.length}/${STRUCTURE.length}`);
  console.log('');
  console.log(`  State saved to ${STATE_FILE}`);
  console.log(`  Run with --resume to continue from where you stopped`);
  console.log(`  Run with --stats to see current DB breakdown\n`);
}

main().catch(e => {
  console.error('\n  FATAL ERROR:', e.message);
  console.error('  State has been saved. Run with --resume to continue.\n');
  process.exit(1);
});
