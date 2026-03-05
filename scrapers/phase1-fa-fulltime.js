#!/usr/bin/env node
/**
 * Phase 1: FA Full-Time Scraper
 *
 * FA Full-Time (fulltime.thefa.com) is the FA's official league management system.
 * It contains thousands of grassroots, junior, women's, and amateur leagues.
 * This is the SINGLE BIGGEST source for UK football clubs.
 *
 * Strategy:
 * 1. Use SERP API to discover FA Full-Time league pages
 * 2. Fetch each league page and extract club listings
 * 3. Also scrape FA county association pages for coverage
 *
 * Usage:
 *   node scrapers/phase1-fa-fulltime.js
 *   node scrapers/phase1-fa-fulltime.js --resume
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { upsertClubs, upsertLeagues, logRun, getClubCount, sleep } = require('./supabase');

const SERP_API_KEY = process.env.SERP_API_KEY;
const STATE_FILE = path.join(__dirname, '..', 'state-phase1.json');
const RATE_MS = 1500;

if (!SERP_API_KEY) { console.error('Missing SERP_API_KEY'); process.exit(1); }

// ─── All 43 County FAs + sub-regions ──────────────────────────────────────────
const COUNTY_FAS = [
  'Bedfordshire', 'Berkshire & Buckinghamshire', 'Birmingham',
  'Cambridgeshire', 'Cheshire', 'Cornwall', 'Cumberland',
  'Derbyshire', 'Devon', 'Dorset', 'Durham', 'East Riding',
  'Essex', 'Gloucestershire', 'Hampshire', 'Herefordshire',
  'Hertfordshire', 'Huntingdonshire', 'Kent', 'Lancashire',
  'Leicestershire & Rutland', 'Lincolnshire', 'Liverpool',
  'London', 'Manchester', 'Middlesex', 'Norfolk',
  'Northamptonshire', 'Northumberland', 'North Riding',
  'Nottinghamshire', 'Oxfordshire', 'Sheffield & Hallamshire',
  'Shropshire', 'Somerset', 'Staffordshire', 'Suffolk',
  'Surrey', 'Sussex', 'Westmorland', 'Wiltshire',
  'Worcestershire', 'West Riding'
];

// ─── Search queries to discover FA Full-Time leagues ──────────────────────────
function getSearchQueries() {
  const queries = [];

  // County FA junior/youth leagues
  for (const county of COUNTY_FAS) {
    queries.push({
      search: `site:fulltime.thefa.com "${county}" league clubs`,
      category: 'Junior',
      region: county,
      country: 'England'
    });
    queries.push({
      search: `"${county} FA" youth junior football league clubs teams list`,
      category: 'Junior',
      region: county,
      country: 'England'
    });
    queries.push({
      search: `"${county}" women's football league clubs teams`,
      category: 'Women',
      region: county,
      country: 'England'
    });
    queries.push({
      search: `"${county}" sunday league football clubs teams`,
      category: 'Grassroots',
      region: county,
      country: 'England'
    });
  }

  // Direct FA Full-Time discovery
  queries.push({ search: 'site:fulltime.thefa.com league table clubs', category: 'Grassroots', region: 'England', country: 'England' });
  queries.push({ search: 'site:fulltime.thefa.com junior youth mini soccer league', category: 'Junior', region: 'England', country: 'England' });
  queries.push({ search: 'site:fulltime.thefa.com women ladies league', category: 'Women', region: 'England', country: 'England' });
  queries.push({ search: 'site:fulltime.thefa.com disability league', category: 'Disability', region: 'England', country: 'England' });
  queries.push({ search: 'site:fulltime.thefa.com walking football league', category: 'Walking Football', region: 'England', country: 'England' });

  // Scottish FA
  queries.push({ search: 'site:scottishfa.co.uk clubs league list', category: 'Grassroots', region: 'Scotland', country: 'Scotland' });
  queries.push({ search: 'Scottish amateur football league clubs teams list', category: 'Grassroots', region: 'Scotland', country: 'Scotland' });
  queries.push({ search: 'Scottish youth junior football clubs teams list', category: 'Junior', region: 'Scotland', country: 'Scotland' });

  // Welsh FA
  queries.push({ search: 'site:faw.cymru clubs league list', category: 'Grassroots', region: 'Wales', country: 'Wales' });
  queries.push({ search: 'Welsh football league clubs teams amateur grassroots list', category: 'Grassroots', region: 'Wales', country: 'Wales' });

  // Northern Ireland FA
  queries.push({ search: 'site:irishfa.com clubs league list', category: 'Grassroots', region: 'Northern Ireland', country: 'Northern Ireland' });
  queries.push({ search: 'Northern Ireland amateur football league clubs list', category: 'Grassroots', region: 'Northern Ireland', country: 'Northern Ireland' });

  return queries;
}

// ─── SERP API ─────────────────────────────────────────────────────────────────
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

// ─── Extract clubs from search results ────────────────────────────────────────
function extractFromSerp(serpData, queryInfo) {
  const clubs = [];
  const leagues = [];
  const seen = new Set();

  const results = serpData.organic_results || [];

  for (const r of results) {
    const title = r.title || '';
    const snippet = r.snippet || '';
    const link = r.link || '';
    const text = `${title} ${snippet}`;

    // Extract FA Full-Time league names from URLs
    if (link.includes('fulltime.thefa.com')) {
      const leagueMatch = title.match(/^(.+?)(?:\s*[-–|]\s*(?:Table|Fixtures|Results|Teams|Full-Time))/i);
      if (leagueMatch) {
        const leagueName = leagueMatch[1].trim();
        if (leagueName.length > 3 && !seen.has(`league:${leagueName.toLowerCase()}`)) {
          seen.add(`league:${leagueName.toLowerCase()}`);
          leagues.push({
            league_name: leagueName,
            category: queryInfo.category,
            region: queryInfo.region,
            country: queryInfo.country,
            fa_full_time_id: link,
            website: link
          });
        }
      }
    }

    // Extract club names with common football suffixes
    const clubPatterns = [
      // Standard club names
      /\b([A-Z][a-zA-Z\s&'-]{2,40}(?:FC|A\.?F\.?C\.?|United|City|Town|Rovers|Wanderers|Athletic|Rangers|Albion|Hotspur|Wednesday|Forest|Orient|Palace|Argyle|Harriers|Stanley|Alexandra|Swifts|Dynamo|Borough|Academicals|Thistle|Celtic|Hearts|Hibs))\b/g,
      // Junior/youth club names
      /\b([A-Z][a-zA-Z\s&'-]{2,40}(?:Juniors|Youth|Colts|Boys|Girls|Minors|Academy|Under \d+s?))\b/g,
      // Ladies/women's
      /\b([A-Z][a-zA-Z\s&'-]{2,40}(?:Ladies|Women|Girls)(?:\s+FC)?)\b/g,
      // Generic "Club" suffix
      /\b([A-Z][a-zA-Z\s&'-]{2,40}(?:Football Club|Soccer Club|Sports Club))\b/g,
    ];

    for (const pat of clubPatterns) {
      for (const m of text.matchAll(pat)) {
        const name = m[1].trim();
        const key = name.toLowerCase();
        // Filter out junk matches
        if (name.length < 4 || name.length > 55) continue;
        if (/^(The |This |That |Their |These |From |With |About )/i.test(name)) continue;
        if (/\b(Premier League|Championship|National League|Football Association|Full Time)\b/i.test(name)) continue;

        if (!seen.has(key)) {
          seen.add(key);

          // Try to determine league from context
          let leagueName = queryInfo.region;
          for (const l of leagues) {
            if (text.includes(l.league_name)) {
              leagueName = l.league_name;
              break;
            }
          }

          clubs.push({
            club_name: name,
            league_name: leagueName,
            sport: 'Football',
            category: queryInfo.category,
            region: queryInfo.region,
            country: queryInfo.country,
            website: link.includes(name.toLowerCase().replace(/\s+/g, '')) ? link : null,
            source: link.includes('fulltime.thefa.com') ? 'fa_fulltime' : 'serp_api',
            source_url: link,
            stage: 'Not Contacted',
            est_value: 0
          });
        }
      }
    }
  }

  return { clubs, leagues };
}

// ─── Fetch and parse an FA Full-Time league page ──────────────────────────────
async function scrapeFullTimePage(url, queryInfo) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; SportsCRM/1.0)' }
    });
    if (!res.ok) return [];

    const html = await res.text();
    const clubs = [];
    const seen = new Set();

    // Extract team names from table rows (common FA Full-Time format)
    // Pattern: <a ...>Team Name</a> within table cells
    const teamPattern = /<td[^>]*class="[^"]*team[^"]*"[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/gi;
    for (const m of html.matchAll(teamPattern)) {
      const name = m[1].trim();
      if (name.length > 2 && name.length < 60 && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        clubs.push({
          club_name: name,
          league_name: queryInfo.league || queryInfo.region,
          sport: 'Football',
          category: queryInfo.category,
          region: queryInfo.region,
          country: queryInfo.country,
          source: 'fa_fulltime',
          source_url: url,
          stage: 'Not Contacted',
          est_value: 0
        });
      }
    }

    // Also try generic link text extraction
    const linkPattern = /<a[^>]*href="[^"]*(?:team|club)[^"]*"[^>]*>([^<]+)<\/a>/gi;
    for (const m of html.matchAll(linkPattern)) {
      const name = m[1].trim();
      if (name.length > 2 && name.length < 60 && !seen.has(name.toLowerCase())) {
        seen.add(name.toLowerCase());
        clubs.push({
          club_name: name,
          league_name: queryInfo.league || queryInfo.region,
          sport: 'Football',
          category: queryInfo.category,
          region: queryInfo.region,
          country: queryInfo.country,
          source: 'fa_fulltime',
          source_url: url,
          stage: 'Not Contacted',
          est_value: 0
        });
      }
    }

    return clubs;
  } catch (e) {
    console.log(`  Could not fetch ${url}: ${e.message}`);
    return [];
  }
}

// ─── State ────────────────────────────────────────────────────────────────────
function loadState() {
  if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  return { completed: [], clubsFound: 0, leaguesFound: 0, fullTimePages: [] };
}

function saveState(state) {
  state.lastRun = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const isResume = process.argv.includes('--resume');

  console.log('\n=== PHASE 1: FA Full-Time & County FA Scraper ===');
  console.log('================================================\n');

  const state = isResume ? loadState() : { completed: [], clubsFound: 0, leaguesFound: 0, fullTimePages: [] };
  const startCount = await getClubCount();
  console.log(`Database currently has ${startCount} clubs\n`);

  if (isResume && state.completed.length) {
    console.log(`Resuming — ${state.completed.length} queries done, ${state.clubsFound} clubs found so far\n`);
  }

  await logRun('fa_fulltime', 'running');

  const queries = getSearchQueries();
  const pending = queries.filter((_, i) => !state.completed.includes(i));
  let totalNew = 0;
  let totalLeagues = 0;

  for (let i = 0; i < pending.length; i++) {
    const queryIdx = queries.indexOf(pending[i]);
    const q = pending[i];
    const progress = `[${i + 1}/${pending.length}]`;

    console.log(`${progress} ${q.category} | ${q.region} | ${q.country}`);
    console.log(`  Query: "${q.search.slice(0, 80)}..."`);

    try {
      const serpData = await serpSearch(q.search);
      const { clubs, leagues } = extractFromSerp(serpData, q);

      console.log(`  Found: ${clubs.length} clubs, ${leagues.length} leagues`);

      // Scrape any FA Full-Time pages we found
      const ftPages = (serpData.organic_results || [])
        .filter(r => r.link?.includes('fulltime.thefa.com'))
        .map(r => r.link);

      for (const pageUrl of ftPages) {
        if (state.fullTimePages.includes(pageUrl)) continue;
        state.fullTimePages.push(pageUrl);

        const pageClubs = await scrapeFullTimePage(pageUrl, q);
        if (pageClubs.length) {
          console.log(`  +${pageClubs.length} from Full-Time page`);
          clubs.push(...pageClubs);
        }
        await sleep(800);
      }

      // Deduplicate within this batch
      const uniqueClubs = [];
      const seenNames = new Set();
      for (const c of clubs) {
        const key = `${c.club_name.toLowerCase()}|${c.league_name?.toLowerCase()}`;
        if (!seenNames.has(key)) {
          seenNames.add(key);
          uniqueClubs.push(c);
        }
      }

      // Upsert
      if (uniqueClubs.length) {
        const { inserted, errors } = await upsertClubs(uniqueClubs);
        totalNew += inserted;
        state.clubsFound += inserted;
        console.log(`  -> Inserted: ${inserted} | Errors: ${errors}`);
      }

      if (leagues.length) {
        const lInserted = await upsertLeagues(leagues);
        totalLeagues += lInserted;
        state.leaguesFound += lInserted;
      }

      state.completed.push(queryIdx);
      saveState(state);
      await sleep(RATE_MS);

    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      // Don't mark as completed — will retry on resume
      await sleep(3000); // back off on error
    }

    console.log('');
  }

  const endCount = await getClubCount();
  await logRun('fa_fulltime', 'completed', {
    found: state.clubsFound,
    inserted: totalNew,
    errors: 0,
    log: `${totalNew} clubs, ${totalLeagues} leagues from ${state.completed.length} queries`
  });

  console.log('================================================');
  console.log(`Phase 1 complete!`);
  console.log(`  New clubs this run: ${totalNew}`);
  console.log(`  New leagues: ${totalLeagues}`);
  console.log(`  Total in database: ${endCount}`);
  console.log(`  State saved — run with --resume to continue\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
