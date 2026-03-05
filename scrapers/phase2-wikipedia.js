#!/usr/bin/env node
/**
 * Phase 2: Wikipedia Structured Data Scraper
 *
 * Wikipedia has complete, structured lists of clubs for every level of the
 * English, Scottish, Welsh and Northern Irish football pyramids.
 * This is the most RELIABLE source for professional and semi-pro clubs.
 *
 * Strategy: Use Wikipedia API to fetch list articles, parse club names from tables.
 *
 * Usage:
 *   node scrapers/phase2-wikipedia.js
 *   node scrapers/phase2-wikipedia.js --resume
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { upsertClubs, upsertLeagues, logRun, getClubCount, sleep } = require('./supabase');

const STATE_FILE = path.join(__dirname, '..', 'state-phase2.json');

// ─── Wikipedia articles with club lists ───────────────────────────────────────
const WIKI_SOURCES = [
  // ENGLISH PROFESSIONAL
  { article: 'Premier_League', league: 'Premier League', category: 'Professional', level: 1, region: 'England', country: 'England' },
  { article: 'EFL_Championship', league: 'EFL Championship', category: 'Professional', level: 2, region: 'England', country: 'England' },
  { article: 'EFL_League_One', league: 'EFL League One', category: 'Professional', level: 3, region: 'England', country: 'England' },
  { article: 'EFL_League_Two', league: 'EFL League Two', category: 'Professional', level: 4, region: 'England', country: 'England' },

  // ENGLISH NON-LEAGUE
  { article: 'National_League_(English_football)', league: 'National League', category: 'Semi-Pro', level: 5, region: 'England', country: 'England' },
  { article: 'National_League_North', league: 'National League North', category: 'Semi-Pro', level: 6, region: 'North', country: 'England' },
  { article: 'National_League_South', league: 'National League South', category: 'Semi-Pro', level: 6, region: 'South', country: 'England' },
  { article: 'Northern_Premier_League', league: 'Northern Premier League', category: 'Semi-Pro', level: 7, region: 'North', country: 'England' },
  { article: 'Southern_Football_League', league: 'Southern Football League', category: 'Semi-Pro', level: 7, region: 'South', country: 'England' },
  { article: 'Isthmian_League', league: 'Isthmian League', category: 'Semi-Pro', level: 7, region: 'South East', country: 'England' },

  // Step 5-6 leagues (Wikipedia has good lists)
  { article: 'Combined_Counties_Football_League', league: 'Combined Counties League', category: 'Semi-Pro', level: 9, region: 'South', country: 'England' },
  { article: 'Eastern_Counties_Football_League', league: 'Eastern Counties League', category: 'Semi-Pro', level: 9, region: 'East', country: 'England' },
  { article: 'Essex_Senior_Football_League', league: 'Essex Senior League', category: 'Semi-Pro', level: 9, region: 'East', country: 'England' },
  { article: 'Hellenic_Football_League', league: 'Hellenic League', category: 'Semi-Pro', level: 9, region: 'South West', country: 'England' },
  { article: 'Midland_Football_League', league: 'Midland Football League', category: 'Semi-Pro', level: 9, region: 'Midlands', country: 'England' },
  { article: 'North_West_Counties_Football_League', league: 'North West Counties League', category: 'Semi-Pro', level: 9, region: 'North West', country: 'England' },
  { article: 'Northern_Counties_East_Football_League', league: 'Northern Counties East League', category: 'Semi-Pro', level: 9, region: 'North East', country: 'England' },
  { article: 'Northern_Football_League', league: 'Northern League', category: 'Semi-Pro', level: 9, region: 'North East', country: 'England' },
  { article: 'South_West_Peninsula_League', league: 'South West Peninsula League', category: 'Semi-Pro', level: 9, region: 'South West', country: 'England' },
  { article: 'Southern_Combination_Football_League', league: 'Southern Combination League', category: 'Semi-Pro', level: 9, region: 'South', country: 'England' },
  { article: 'Spartan_South_Midlands_Football_League', league: 'Spartan South Midlands League', category: 'Semi-Pro', level: 9, region: 'South Midlands', country: 'England' },
  { article: 'United_Counties_League', league: 'United Counties League', category: 'Semi-Pro', level: 9, region: 'Midlands', country: 'England' },
  { article: 'Wessex_Football_League', league: 'Wessex League', category: 'Semi-Pro', level: 9, region: 'South', country: 'England' },
  { article: 'Western_Football_League', league: 'Western League', category: 'Semi-Pro', level: 9, region: 'South West', country: 'England' },
  { article: 'West_Midlands_(Regional)_League', league: 'West Midlands Regional League', category: 'Semi-Pro', level: 9, region: 'West Midlands', country: 'England' },

  // Big list articles
  { article: 'List_of_football_clubs_in_England', league: 'Various', category: 'Various', level: 0, region: 'England', country: 'England' },
  { article: 'English_football_league_system', league: 'Various', category: 'Various', level: 0, region: 'England', country: 'England' },

  // SCOTTISH
  { article: 'Scottish_Premiership', league: 'Scottish Premiership', category: 'Professional', level: 1, region: 'Scotland', country: 'Scotland' },
  { article: 'Scottish_Championship', league: 'Scottish Championship', category: 'Professional', level: 2, region: 'Scotland', country: 'Scotland' },
  { article: 'Scottish_League_One', league: 'Scottish League One', category: 'Professional', level: 3, region: 'Scotland', country: 'Scotland' },
  { article: 'Scottish_League_Two', league: 'Scottish League Two', category: 'Professional', level: 4, region: 'Scotland', country: 'Scotland' },
  { article: 'Highland_Football_League', league: 'Highland Football League', category: 'Semi-Pro', level: 5, region: 'Scotland', country: 'Scotland' },
  { article: 'Lowland_Football_League', league: 'Lowland Football League', category: 'Semi-Pro', level: 5, region: 'Scotland', country: 'Scotland' },
  { article: 'East_of_Scotland_Football_League', league: 'East of Scotland League', category: 'Semi-Pro', level: 6, region: 'Scotland', country: 'Scotland' },
  { article: 'West_of_Scotland_Football_League', league: 'West of Scotland League', category: 'Semi-Pro', level: 6, region: 'Scotland', country: 'Scotland' },
  { article: 'South_of_Scotland_Football_League', league: 'South of Scotland League', category: 'Semi-Pro', level: 6, region: 'Scotland', country: 'Scotland' },
  { article: 'North_Caledonian_Football_League', league: 'North Caledonian League', category: 'Grassroots', level: 7, region: 'Scotland', country: 'Scotland' },
  { article: 'List_of_football_clubs_in_Scotland', league: 'Various', category: 'Various', level: 0, region: 'Scotland', country: 'Scotland' },

  // WELSH
  { article: 'Cymru_Premier', league: 'Cymru Premier', category: 'Professional', level: 1, region: 'Wales', country: 'Wales' },
  { article: 'Cymru_North', league: 'Cymru North', category: 'Semi-Pro', level: 2, region: 'Wales', country: 'Wales' },
  { article: 'Cymru_South', league: 'Cymru South', category: 'Semi-Pro', level: 2, region: 'Wales', country: 'Wales' },
  { article: 'List_of_football_clubs_in_Wales', league: 'Various', category: 'Various', level: 0, region: 'Wales', country: 'Wales' },

  // NORTHERN IRELAND
  { article: 'NIFL_Premiership', league: 'NIFL Premiership', category: 'Professional', level: 1, region: 'Northern Ireland', country: 'Northern Ireland' },
  { article: 'NIFL_Championship', league: 'NIFL Championship', category: 'Semi-Pro', level: 2, region: 'Northern Ireland', country: 'Northern Ireland' },
  { article: 'List_of_association_football_clubs_in_Northern_Ireland', league: 'Various', category: 'Various', level: 0, region: 'Northern Ireland', country: 'Northern Ireland' },

  // WOMEN'S
  { article: "Women's_Super_League", league: "Women's Super League", category: 'Women', level: 1, region: 'England', country: 'England' },
  { article: "Women's_Championship_(England)", league: "Women's Championship", category: 'Women', level: 2, region: 'England', country: 'England' },
  { article: "FA_Women's_National_League", league: "FA Women's National League", category: 'Women', level: 3, region: 'England', country: 'England' },
  { article: "Scottish_Women's_Premier_League", league: "Scottish Women's Premier League", category: 'Women', level: 1, region: 'Scotland', country: 'Scotland' },

  // DISABILITY
  { article: 'Powerchair_football', league: 'Powerchair Football', category: 'Disability', level: 1, region: 'England', country: 'England' },

  // FUTSAL
  { article: 'National_Futsal_Series', league: 'National Futsal Series', category: 'Futsal', level: 1, region: 'England', country: 'England' },
];

// ─── Wikipedia API ────────────────────────────────────────────────────────────
async function fetchWikiPage(article) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(article)}&prop=wikitext&format=json&redirects=1`;
  const res = await fetch(url, { headers: { 'User-Agent': 'SportsCRM/1.0 (contact@example.com)' } });
  if (!res.ok) throw new Error(`Wiki API ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.info);
  return data.parse?.wikitext?.['*'] || '';
}

// ─── Extract club names from wikitext ─────────────────────────────────────────
function extractClubsFromWikitext(wikitext, source) {
  const clubs = [];
  const seen = new Set();

  // Pattern 1: [[Club Name]] or [[Club Name|Display Name]]
  const linkPattern = /\[\[([^\]|]+?)(?:\|([^\]]+))?\]\]/g;
  for (const m of wikitext.matchAll(linkPattern)) {
    const target = m[1].trim();
    const display = (m[2] || m[1]).trim();

    // Filter: must look like a football club
    const isClub =
      /\b(F\.?C\.?|A\.?F\.?C\.?|United|City|Town|Rovers|Wanderers|Athletic|Rangers|Albion|Hotspur|Wednesday|Forest|Borough|Academicals|Thistle|Celtic|Hearts|Hibs|Ladies|Women)\b/i.test(target) ||
      /\b(F\.?C\.?|A\.?F\.?C\.?|United|City|Town|Rovers|Wanderers|Athletic|Rangers|Albion)\b/i.test(display);

    // Or it's in a club list article
    const inClubList = source.article.includes('List_of_football_clubs') || source.article.includes('List_of_association_football');

    if ((isClub || inClubList) && display.length > 2 && display.length < 60) {
      // Filter out non-club links
      if (/\b(stadium|ground|season|league|cup|manager|coach|category|wikipedia|template|file|image)\b/i.test(target)) continue;
      if (/^\d{4}/.test(display)) continue; // year links

      const name = display.replace(/\s*F\.?C\.?\s*$/, ' FC').trim();
      const key = name.toLowerCase();

      if (!seen.has(key)) {
        seen.add(key);
        clubs.push({
          club_name: name,
          league_name: source.league !== 'Various' ? source.league : null,
          sport: 'Football',
          category: source.category !== 'Various' ? source.category : 'Professional',
          pyramid_level: source.level || null,
          region: source.region,
          country: source.country,
          source: 'wikipedia',
          source_url: `https://en.wikipedia.org/wiki/${source.article}`,
          stage: 'Not Contacted',
          est_value: 0
        });
      }
    }
  }

  return clubs;
}

// ─── State ────────────────────────────────────────────────────────────────────
function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  return { completed: [], clubsFound: 0 };
}

function saveState(state) {
  state.lastRun = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const isResume = process.argv.includes('--resume');

  console.log('\n=== PHASE 2: Wikipedia Structured Data ===');
  console.log('==========================================\n');

  const state = isResume ? loadState() : { completed: [], clubsFound: 0 };
  const startCount = await getClubCount();
  console.log(`Database currently has ${startCount} clubs\n`);

  if (isResume && state.completed.length) {
    console.log(`Resuming — ${state.completed.length}/${WIKI_SOURCES.length} done\n`);
  }

  await logRun('wikipedia', 'running');

  const pending = WIKI_SOURCES.filter(s => !state.completed.includes(s.article));
  let totalNew = 0;

  for (let i = 0; i < pending.length; i++) {
    const src = pending[i];
    const progress = `[${i + 1}/${pending.length}]`;

    console.log(`${progress} ${src.league} (${src.country})`);
    console.log(`  Article: ${src.article}`);

    try {
      const wikitext = await fetchWikiPage(src.article);
      const clubs = extractClubsFromWikitext(wikitext, src);
      console.log(`  Extracted: ${clubs.length} clubs`);

      if (clubs.length) {
        const { inserted, errors } = await upsertClubs(clubs);
        totalNew += inserted;
        state.clubsFound += inserted;
        console.log(`  -> Inserted: ${inserted} | Errors: ${errors}`);
      }

      // Also add as a league
      if (src.league !== 'Various') {
        await upsertLeagues([{
          league_name: src.league,
          category: src.category,
          pyramid_level: src.level,
          region: src.region,
          country: src.country,
          website: `https://en.wikipedia.org/wiki/${src.article}`,
          club_count: clubs.length,
          scraped: true,
          scraped_at: new Date().toISOString()
        }]);
      }

      state.completed.push(src.article);
      saveState(state);
      await sleep(500); // Be nice to Wikipedia

    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      await sleep(2000);
    }

    console.log('');
  }

  const endCount = await getClubCount();
  await logRun('wikipedia', 'completed', { found: state.clubsFound, inserted: totalNew });

  console.log('==========================================');
  console.log(`Phase 2 complete! ${totalNew} new clubs. Total: ${endCount}\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
