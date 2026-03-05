#!/usr/bin/env node
/**
 * UK Football Pyramid Scraper
 *
 * Systematically scrapes the entire UK football structure into Supabase:
 * - Professional (Premier League → League Two)
 * - Semi-Professional (National League → Step 6)
 * - Grassroots / Amateur (Steps 7+, county leagues)
 * - Junior Football (U7 → U18, academies)
 * - Women's Football (WSL → grassroots)
 * - Disability Football
 * - Soccer Schools & Academies
 * - Walking Football, Veterans, Futsal
 *
 * Uses SERP API for discovery, then enriches with direct page scraping.
 * Resumable — tracks progress in scraper-state.json.
 *
 * Usage:
 *   npm install
 *   cp .env.example .env   # add your keys
 *   node scraper.js
 *   node scraper.js --resume          # continue from where you stopped
 *   node scraper.js --category junior # run only one category
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hbaxhbxqiwvmrtmwvmss.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';
const SERP_API_KEY = process.env.SERP_API_KEY || '';
const TABLE = process.env.SUPABASE_TABLE || 'clubs';
const STATE_FILE = path.join(__dirname, 'scraper-state.json');
const RATE_LIMIT_MS = 1200; // delay between SERP API calls

if (!SUPABASE_KEY) { console.error('Missing SUPABASE_KEY in .env'); process.exit(1); }
if (!SERP_API_KEY) { console.error('Missing SERP_API_KEY in .env'); process.exit(1); }

// ─── The Full UK Football Pyramid ─────────────────────────────────────────────
const PYRAMID = [
  // === PROFESSIONAL ===
  { level: 1, category: 'Professional', league: 'Premier League', search: 'Premier League clubs list all teams', region: 'England' },
  { level: 2, category: 'Professional', league: 'EFL Championship', search: 'EFL Championship clubs list all teams', region: 'England' },
  { level: 3, category: 'Professional', league: 'EFL League One', search: 'EFL League One clubs list all teams', region: 'England' },
  { level: 4, category: 'Professional', league: 'EFL League Two', search: 'EFL League Two clubs list all teams', region: 'England' },

  // === NATIONAL LEAGUE SYSTEM (Semi-Pro) ===
  { level: 5, category: 'Semi-Pro', league: 'National League', search: 'National League football clubs list England', region: 'England' },
  { level: 6, category: 'Semi-Pro', league: 'National League North', search: 'National League North clubs list all teams', region: 'England' },
  { level: 6, category: 'Semi-Pro', league: 'National League South', search: 'National League South clubs list all teams', region: 'England' },

  // Step 3
  { level: 7, category: 'Semi-Pro', league: 'Northern Premier League Premier Division', search: 'Northern Premier League Premier Division clubs list', region: 'North' },
  { level: 7, category: 'Semi-Pro', league: 'Southern Football League Premier Division South', search: 'Southern League Premier Division South clubs list', region: 'South' },
  { level: 7, category: 'Semi-Pro', league: 'Southern Football League Premier Division Central', search: 'Southern League Premier Division Central clubs list', region: 'Midlands' },
  { level: 7, category: 'Semi-Pro', league: 'Isthmian League Premier Division', search: 'Isthmian League Premier Division clubs list', region: 'South East' },

  // Step 4
  { level: 8, category: 'Semi-Pro', league: 'Northern Premier League Division One East', search: 'Northern Premier League Division One East clubs', region: 'North East' },
  { level: 8, category: 'Semi-Pro', league: 'Northern Premier League Division One West', search: 'Northern Premier League Division One West clubs', region: 'North West' },
  { level: 8, category: 'Semi-Pro', league: 'Southern Football League Division One South', search: 'Southern League Division One South clubs', region: 'South' },
  { level: 8, category: 'Semi-Pro', league: 'Southern Football League Division One Central', search: 'Southern League Division One Central clubs', region: 'Midlands' },
  { level: 8, category: 'Semi-Pro', league: 'Isthmian League Division One North', search: 'Isthmian League Division One North clubs', region: 'North London' },
  { level: 8, category: 'Semi-Pro', league: 'Isthmian League Division One South Central', search: 'Isthmian League Division One South Central clubs', region: 'South' },
  { level: 8, category: 'Semi-Pro', league: 'Isthmian League Division One South East', search: 'Isthmian League Division One South East clubs', region: 'South East' },

  // Step 5-6 (key feeder leagues)
  { level: 9, category: 'Semi-Pro', league: 'Combined Counties League Premier Division', search: 'Combined Counties League Premier Division clubs', region: 'South' },
  { level: 9, category: 'Semi-Pro', league: 'Eastern Counties League Premier Division', search: 'Eastern Counties League Premier Division clubs', region: 'East' },
  { level: 9, category: 'Semi-Pro', league: 'Essex Senior League', search: 'Essex Senior League clubs list', region: 'East' },
  { level: 9, category: 'Semi-Pro', league: 'Hellenic League Premier Division', search: 'Hellenic League Premier Division clubs', region: 'South West' },
  { level: 9, category: 'Semi-Pro', league: 'Midland Football League Premier Division', search: 'Midland Football League Premier Division clubs', region: 'Midlands' },
  { level: 9, category: 'Semi-Pro', league: 'North West Counties League Premier Division', search: 'North West Counties Football League Premier Division clubs', region: 'North West' },
  { level: 9, category: 'Semi-Pro', league: 'Northern Counties East League Premier Division', search: 'Northern Counties East Football League Premier Division clubs', region: 'North East' },
  { level: 9, category: 'Semi-Pro', league: 'Northern League Division One', search: 'Northern Football League Division One clubs', region: 'North East' },
  { level: 9, category: 'Semi-Pro', league: 'South West Peninsula League Premier Division', search: 'South West Peninsula League Premier Division clubs', region: 'South West' },
  { level: 9, category: 'Semi-Pro', league: 'Southern Combination League Premier Division', search: 'Southern Combination Football League Premier Division clubs', region: 'South' },
  { level: 9, category: 'Semi-Pro', league: 'Spartan South Midlands League Premier Division', search: 'Spartan South Midlands Football League Premier Division clubs', region: 'South Midlands' },
  { level: 9, category: 'Semi-Pro', league: 'United Counties League Premier Division', search: 'United Counties League Premier Division clubs', region: 'Midlands' },
  { level: 9, category: 'Semi-Pro', league: 'Wessex League Premier Division', search: 'Wessex Football League Premier Division clubs', region: 'South' },
  { level: 9, category: 'Semi-Pro', league: 'Western Football League Premier Division', search: 'Western Football League Premier Division clubs', region: 'South West' },
  { level: 9, category: 'Semi-Pro', league: 'West Midlands Regional League Premier Division', search: 'West Midlands Regional Football League Premier Division clubs', region: 'West Midlands' },

  // Step 5-6 Division One feeders
  { level: 10, category: 'Semi-Pro', league: 'Combined Counties League Division One', search: 'Combined Counties League Division One clubs', region: 'South' },
  { level: 10, category: 'Semi-Pro', league: 'Eastern Counties League Division One North', search: 'Eastern Counties League Division One North clubs', region: 'East' },
  { level: 10, category: 'Semi-Pro', league: 'Eastern Counties League Division One South', search: 'Eastern Counties League Division One South clubs', region: 'East' },
  { level: 10, category: 'Semi-Pro', league: 'Hellenic League Division One', search: 'Hellenic League Division One clubs', region: 'South West' },
  { level: 10, category: 'Semi-Pro', league: 'Midland Football League Division One', search: 'Midland Football League Division One clubs', region: 'Midlands' },
  { level: 10, category: 'Semi-Pro', league: 'North West Counties League Division One South', search: 'North West Counties League Division One South clubs', region: 'North West' },
  { level: 10, category: 'Semi-Pro', league: 'North West Counties League Division One North', search: 'North West Counties League Division One North clubs', region: 'North West' },
  { level: 10, category: 'Semi-Pro', league: 'Northern Counties East League Division One', search: 'Northern Counties East League Division One clubs', region: 'North East' },
  { level: 10, category: 'Semi-Pro', league: 'Northern League Division Two', search: 'Northern Football League Division Two clubs', region: 'North East' },
  { level: 10, category: 'Semi-Pro', league: 'South West Peninsula League Division One East', search: 'South West Peninsula League Division One East clubs', region: 'South West' },
  { level: 10, category: 'Semi-Pro', league: 'South West Peninsula League Division One West', search: 'South West Peninsula League Division One West clubs', region: 'South West' },
  { level: 10, category: 'Semi-Pro', league: 'Southern Combination League Division One', search: 'Southern Combination League Division One clubs', region: 'South' },
  { level: 10, category: 'Semi-Pro', league: 'Spartan South Midlands League Division One', search: 'Spartan South Midlands League Division One clubs', region: 'South Midlands' },
  { level: 10, category: 'Semi-Pro', league: 'United Counties League Division One', search: 'United Counties League Division One clubs', region: 'Midlands' },
  { level: 10, category: 'Semi-Pro', league: 'Wessex League Division One', search: 'Wessex League Division One clubs', region: 'South' },
  { level: 10, category: 'Semi-Pro', league: 'Western Football League Division One', search: 'Western League Division One clubs', region: 'South West' },

  // === SCOTTISH FOOTBALL ===
  { level: 1, category: 'Professional', league: 'Scottish Premiership', search: 'Scottish Premiership clubs list all teams', region: 'Scotland' },
  { level: 2, category: 'Professional', league: 'Scottish Championship', search: 'Scottish Championship clubs list all teams', region: 'Scotland' },
  { level: 3, category: 'Professional', league: 'Scottish League One', search: 'Scottish League One clubs list all teams', region: 'Scotland' },
  { level: 4, category: 'Professional', league: 'Scottish League Two', search: 'Scottish League Two clubs list all teams', region: 'Scotland' },
  { level: 5, category: 'Semi-Pro', league: 'Highland Football League', search: 'Highland Football League clubs list Scotland', region: 'Scotland' },
  { level: 5, category: 'Semi-Pro', league: 'Lowland Football League', search: 'Lowland Football League clubs list Scotland', region: 'Scotland' },
  { level: 6, category: 'Semi-Pro', league: 'East of Scotland League Premier Division', search: 'East of Scotland Football League Premier Division clubs', region: 'Scotland' },
  { level: 6, category: 'Semi-Pro', league: 'West of Scotland League Premier Division', search: 'West of Scotland Football League Premier Division clubs', region: 'Scotland' },
  { level: 6, category: 'Semi-Pro', league: 'South of Scotland League', search: 'South of Scotland Football League clubs', region: 'Scotland' },
  { level: 7, category: 'Grassroots', league: 'East of Scotland League First Division', search: 'East of Scotland League First Division clubs', region: 'Scotland' },
  { level: 7, category: 'Grassroots', league: 'West of Scotland League First Division', search: 'West of Scotland League First Division clubs', region: 'Scotland' },
  { level: 7, category: 'Grassroots', league: 'West of Scotland League Second Division', search: 'West of Scotland League Second Division clubs', region: 'Scotland' },
  { level: 7, category: 'Grassroots', league: 'West of Scotland League Third Division', search: 'West of Scotland League Third Division clubs', region: 'Scotland' },
  { level: 7, category: 'Grassroots', league: 'North Caledonian League', search: 'North Caledonian Football League clubs list', region: 'Scotland' },

  // === WELSH FOOTBALL ===
  { level: 1, category: 'Professional', league: 'Cymru Premier', search: 'Cymru Premier League Wales clubs list all teams', region: 'Wales' },
  { level: 2, category: 'Semi-Pro', league: 'Cymru North', search: 'Cymru North league clubs list Wales', region: 'Wales' },
  { level: 2, category: 'Semi-Pro', league: 'Cymru South', search: 'Cymru South league clubs list Wales', region: 'Wales' },
  { level: 3, category: 'Grassroots', league: 'Welsh National League', search: 'Welsh National League football clubs list', region: 'Wales' },
  { level: 3, category: 'Grassroots', league: 'Welsh Football League Division One', search: 'Welsh Football League Division One clubs', region: 'Wales' },
  { level: 3, category: 'Grassroots', league: 'Welsh Football League Division Two', search: 'Welsh Football League Division Two clubs', region: 'Wales' },

  // === NORTHERN IRISH FOOTBALL ===
  { level: 1, category: 'Professional', league: 'NIFL Premiership', search: 'NIFL Premiership Northern Ireland clubs list', region: 'Northern Ireland' },
  { level: 2, category: 'Semi-Pro', league: 'NIFL Championship', search: 'NIFL Championship Northern Ireland clubs list', region: 'Northern Ireland' },
  { level: 3, category: 'Semi-Pro', league: 'NIFL Premier Intermediate League', search: 'NIFL Premier Intermediate League clubs', region: 'Northern Ireland' },
  { level: 4, category: 'Grassroots', league: 'Northern Ireland Intermediate League', search: 'Northern Ireland Intermediate League football clubs', region: 'Northern Ireland' },

  // === WOMEN'S FOOTBALL ===
  { level: 1, category: 'Women', league: "Women's Super League", search: "FA Women's Super League WSL clubs list all teams", region: 'England' },
  { level: 2, category: 'Women', league: "Women's Championship", search: "FA Women's Championship clubs list all teams", region: 'England' },
  { level: 3, category: 'Women', league: "Women's National League Division One North", search: "FA Women's National League Division One North clubs", region: 'North' },
  { level: 3, category: 'Women', league: "Women's National League Division One South", search: "FA Women's National League Division One South clubs", region: 'South' },
  { level: 4, category: 'Women', league: "Women's National League Division Two North", search: "FA Women's National League Division Two North clubs", region: 'North' },
  { level: 4, category: 'Women', league: "Women's National League Division Two South East", search: "FA Women's National League Division Two South East clubs", region: 'South East' },
  { level: 4, category: 'Women', league: "Women's National League Division Two South West", search: "FA Women's National League Division Two South West clubs", region: 'South West' },
  { level: 4, category: 'Women', league: "Women's National League Division Two Midlands", search: "FA Women's National League Division Two Midlands clubs", region: 'Midlands' },
  { level: 5, category: 'Women', league: "Scottish Women's Premier League", search: "Scottish Women's Premier League SWPL clubs list", region: 'Scotland' },
  { level: 5, category: 'Women', league: "Welsh Women's Premier League", search: "Welsh Women's Premier League clubs list", region: 'Wales' },
  { level: 5, category: 'Women', league: "Northern Ireland Women's Premiership", search: "Northern Ireland Women's Premiership football clubs", region: 'Northern Ireland' },

  // Women's regional (England has ~40 county leagues for women — sample the biggest)
  ...['Greater Manchester', 'West Yorkshire', 'London', 'Hampshire', 'Kent', 'Lancashire', 'Merseyside', 'Devon', 'Essex', 'Norfolk', 'Suffolk', 'Nottinghamshire', 'Derbyshire', 'Leicestershire', 'Lincolnshire', 'Oxfordshire', 'Berkshire', 'Somerset', 'Dorset', 'Cornwall', 'Gloucestershire', 'Herefordshire', 'Worcestershire', 'Shropshire', 'Staffordshire', 'Cheshire', 'Cumbria', 'Durham', 'Northumberland', 'Tyne and Wear'].map(county => ({
    level: 6, category: 'Women', league: `${county} Women's Football League`, search: `${county} women's football league clubs teams list`, region: county
  })),

  // === JUNIOR / YOUTH FOOTBALL ===
  // FA Youth leagues and county youth football
  ...['U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18'].flatMap(age => [
    { level: 1, category: 'Junior', league: `Premier League ${age}`, search: `Premier League ${age} academy teams list`, region: 'England' },
    { level: 2, category: 'Junior', league: `EFL ${age}`, search: `EFL academy ${age} teams clubs list`, region: 'England' },
  ]),

  // County FA junior leagues — these are where the bulk of ~20k junior clubs sit
  ...['Bedfordshire', 'Berkshire', 'Birmingham', 'Buckinghamshire', 'Cambridgeshire', 'Cheshire', 'Cornwall', 'Cumberland', 'Derbyshire', 'Devon', 'Dorset', 'Durham', 'East Riding', 'Essex', 'Gloucestershire', 'Hampshire', 'Herefordshire', 'Hertfordshire', 'Huntingdonshire', 'Kent', 'Lancashire', 'Leicestershire', 'Lincolnshire', 'Liverpool', 'London', 'Manchester', 'Middlesex', 'Norfolk', 'Northamptonshire', 'Northumberland', 'North Riding', 'Nottinghamshire', 'Oxfordshire', 'Shropshire', 'Somerset', 'Staffordshire', 'Suffolk', 'Surrey', 'Sussex', 'Westmorland', 'Wiltshire', 'Worcestershire', 'West Riding'].map(county => ({
    level: 11, category: 'Junior', league: `${county} FA Junior Leagues`, search: `${county} FA youth junior football clubs teams list`, region: county
  })),

  // Junior football league aggregators
  { level: 11, category: 'Junior', league: 'Junior Football League Search', search: 'UK junior youth football clubs leagues list site:fulltime.thefa.com', region: 'England' },
  { level: 11, category: 'Junior', league: 'FA Full-Time Junior Leagues', search: 'FA full-time junior youth mini soccer leagues clubs England', region: 'England' },

  // === SUNDAY LEAGUES / GRASSROOTS ===
  ...['London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol', 'Newcastle', 'Nottingham', 'Leicester', 'Southampton', 'Brighton', 'Portsmouth', 'Plymouth', 'Sunderland', 'Wolverhampton', 'Coventry', 'Derby', 'Stoke', 'Reading', 'Oxford', 'Cambridge', 'Norwich', 'Ipswich', 'Luton', 'Milton Keynes', 'Northampton', 'Peterborough', 'Swindon', 'Gloucester', 'Exeter', 'Bournemouth', 'Bath', 'Cheltenham', 'Worcester', 'Hereford', 'Shrewsbury', 'Chester', 'Blackpool', 'Preston', 'Bolton', 'Wigan', 'Blackburn', 'Burnley', 'York', 'Hull', 'Doncaster', 'Barnsley', 'Rotherham', 'Huddersfield', 'Bradford', 'Halifax', 'Wakefield', 'Middlesbrough', 'Darlington', 'Hartlepool', 'Carlisle', 'Barrow', 'Scarborough', 'Grimsby', 'Scunthorpe', 'Lincoln', 'Mansfield', 'Chesterfield', 'Crewe', 'Macclesfield', 'Stockport', 'Oldham', 'Rochdale', 'Bury', 'Salford', 'Warrington', 'Widnes', 'Runcorn', 'St Helens'].map(city => ({
    level: 12, category: 'Grassroots', league: `${city} Sunday League`, search: `${city} sunday league football clubs teams list`, region: city
  })),

  // === DISABILITY FOOTBALL ===
  { level: 1, category: 'Disability', league: 'FA Disability Football', search: 'FA disability football clubs teams England list', region: 'England' },
  { level: 1, category: 'Disability', league: 'English Blind Football League', search: 'English blind football league clubs teams', region: 'England' },
  { level: 1, category: 'Disability', league: 'FA Deaf Football', search: 'FA deaf football clubs teams England', region: 'England' },
  { level: 1, category: 'Disability', league: 'Cerebral Palsy Football League', search: 'cerebral palsy football league UK clubs teams', region: 'England' },
  { level: 1, category: 'Disability', league: 'Powerchair Football', search: 'powerchair football league UK clubs teams list', region: 'England' },
  { level: 1, category: 'Disability', league: 'Amputee Football', search: 'amputee football UK clubs teams list', region: 'England' },
  { level: 1, category: 'Disability', league: 'Frame Football', search: 'frame football UK clubs teams', region: 'England' },
  { level: 1, category: 'Disability', league: 'Down Syndrome Football', search: 'down syndrome football UK clubs teams', region: 'England' },
  { level: 1, category: 'Disability', league: 'Learning Disability Football', search: 'learning disability football league UK clubs', region: 'England' },
  { level: 1, category: 'Disability', league: 'Mental Health Football League', search: 'mental health football league UK clubs', region: 'England' },
  { level: 2, category: 'Disability', league: 'Scottish Disability Football', search: 'Scottish disability football clubs teams', region: 'Scotland' },
  { level: 2, category: 'Disability', league: 'Welsh Disability Football', search: 'Welsh disability football clubs teams', region: 'Wales' },

  // === SOCCER SCHOOLS & ACADEMIES ===
  ...['London', 'Manchester', 'Birmingham', 'Liverpool', 'Leeds', 'Sheffield', 'Bristol', 'Newcastle', 'Nottingham', 'Leicester', 'Southampton', 'Glasgow', 'Edinburgh', 'Cardiff', 'Belfast', 'Brighton', 'Portsmouth', 'Plymouth', 'Exeter', 'Norwich', 'Cambridge', 'Oxford', 'Reading', 'Swindon', 'Bournemouth', 'Coventry', 'Wolverhampton', 'Derby', 'Stoke', 'Middlesbrough', 'Sunderland', 'York', 'Hull', 'Blackpool', 'Bolton', 'Wigan', 'Preston', 'Huddersfield', 'Bradford', 'Doncaster', 'Ipswich', 'Luton', 'Milton Keynes', 'Northampton', 'Peterborough', 'Cheltenham', 'Worcester', 'Shrewsbury', 'Chester', 'Dundee', 'Aberdeen', 'Inverness', 'Swansea', 'Newport', 'Wrexham'].map(city => ({
    level: 0, category: 'Soccer School', league: `${city} Soccer Schools`, search: `${city} soccer school football academy coaching children`, region: city
  })),

  // === WALKING FOOTBALL ===
  { level: 0, category: 'Walking Football', league: 'Walking Football Association', search: 'walking football clubs teams UK list Walking Football Association', region: 'England' },
  { level: 0, category: 'Walking Football', league: 'Walking Football Scotland', search: 'walking football clubs Scotland list', region: 'Scotland' },
  { level: 0, category: 'Walking Football', league: 'Walking Football Wales', search: 'walking football clubs Wales list', region: 'Wales' },

  // === FUTSAL ===
  { level: 1, category: 'Futsal', league: 'National Futsal Series', search: 'National Futsal Series UK clubs teams list', region: 'England' },
  { level: 2, category: 'Futsal', league: 'FA Futsal Leagues', search: 'FA Futsal League clubs teams England list', region: 'England' },
  { level: 2, category: 'Futsal', league: 'Scottish Futsal League', search: 'Scottish Futsal League clubs teams', region: 'Scotland' },

  // === VETERANS ===
  { level: 0, category: 'Veterans', league: 'Veterans Football', search: 'veterans over 35 football league clubs UK list', region: 'England' },
];

// ─── SERP API ────────────────────────────────────────────────────────────────
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
    throw new Error(`SERP API error ${res.status}: ${text}`);
  }
  return res.json();
}

// ─── Extract club names from SERP results ────────────────────────────────────
function extractClubs(serpData, leagueEntry) {
  const clubs = [];
  const seen = new Set();

  // Extract from organic results
  const results = serpData.organic_results || [];
  for (const r of results) {
    const title = r.title || '';
    const snippet = r.snippet || '';
    const link = r.link || '';

    // Try to find club names in titles and snippets
    const text = `${title} ${snippet}`;

    // Common patterns: "Club Name FC", "Club Name AFC", "Club Name Town", "Club Name City", "Club Name United"
    const patterns = [
      /([A-Z][a-zA-Z\s&'-]+(?:FC|AFC|United|City|Town|Rovers|Wanderers|Athletic|Rangers|Albion|Hotspur|Wednesday|Forest|Orient|Palace|Argyle|Harriers|Stanley|Alexandra|Swifts|Dynamo|Borough|Academicals))/g,
      /([A-Z][a-zA-Z\s&'-]+(?:Ladies|Women|Girls)(?:\s+FC)?)/g,
    ];

    for (const pat of patterns) {
      const matches = text.matchAll(pat);
      for (const m of matches) {
        const name = m[1].trim();
        if (name.length > 3 && name.length < 60 && !seen.has(name.toLowerCase())) {
          seen.add(name.toLowerCase());
          clubs.push({
            club_name: name,
            league_name: leagueEntry.league,
            sport: 'Football',
            category: leagueEntry.category,
            pyramid_level: leagueEntry.level,
            region: leagueEntry.region,
            website: link,
            stage: 'Not Contacted',
            est_value: 0,
            source: 'serp_api'
          });
        }
      }
    }
  }

  // Also extract from knowledge graph / answer box if present
  if (serpData.sports_results?.game_results) {
    for (const game of serpData.sports_results.game_results) {
      for (const team of [game.teams?.[0], game.teams?.[1]]) {
        if (team?.name && !seen.has(team.name.toLowerCase())) {
          seen.add(team.name.toLowerCase());
          clubs.push({
            club_name: team.name,
            league_name: leagueEntry.league,
            sport: 'Football',
            category: leagueEntry.category,
            pyramid_level: leagueEntry.level,
            region: leagueEntry.region,
            stage: 'Not Contacted',
            est_value: 0,
            source: 'serp_api'
          });
        }
      }
    }
  }

  return clubs;
}

// ─── Additional search to find more clubs per league ─────────────────────────
function getFollowUpSearches(leagueEntry) {
  const base = leagueEntry.league;
  return [
    `"${base}" clubs teams members list`,
    `"${base}" fixtures teams 2024 2025`,
    `site:wikipedia.org "${base}" football clubs`,
    `site:thefa.com "${base}"`,
  ];
}

// ─── Supabase upsert ─────────────────────────────────────────────────────────
async function upsertClubs(clubs) {
  if (!clubs.length) return { inserted: 0, skipped: 0 };

  // Batch in groups of 500
  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < clubs.length; i += 500) {
    const batch = clubs.slice(i, i + 500);
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=representation'
      },
      body: JSON.stringify(batch)
    });

    if (res.ok) {
      const data = await res.json();
      inserted += data.length;
    } else {
      const err = await res.text();
      // If conflict on unique index, try inserting one by one
      if (res.status === 409 || err.includes('duplicate')) {
        for (const club of batch) {
          try {
            const r2 = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
              method: 'POST',
              headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'resolution=merge-duplicates,return=minimal'
              },
              body: JSON.stringify(club)
            });
            if (r2.ok) inserted++;
            else skipped++;
          } catch { skipped++; }
        }
      } else {
        console.error(`  Supabase error: ${err}`);
        skipped += batch.length;
      }
    }
  }

  return { inserted, skipped };
}

// ─── State management (resumable) ────────────────────────────────────────────
function loadState() {
  if (fs.existsSync(STATE_FILE)) {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  }
  return { completed: [], totalInserted: 0, lastRun: null };
}

function saveState(state) {
  state.lastRun = new Date().toISOString();
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ─── Rate limiter ─────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const isResume = args.includes('--resume');
  const categoryFilter = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;

  console.log('\n⚡ UK Football Pyramid Scraper');
  console.log('═══════════════════════════════════════════════════');

  const state = isResume ? loadState() : { completed: [], totalInserted: 0, lastRun: null };

  if (isResume && state.completed.length) {
    console.log(`Resuming — ${state.completed.length} leagues already done, ${state.totalInserted} clubs inserted`);
  }

  let entries = PYRAMID;
  if (categoryFilter) {
    entries = entries.filter(e => e.category.toLowerCase() === categoryFilter.toLowerCase());
    console.log(`Filtering to category: ${categoryFilter} (${entries.length} entries)`);
  }

  const pending = entries.filter(e => !state.completed.includes(e.league));
  console.log(`${pending.length} leagues to scrape\n`);

  let totalNew = 0;

  for (let i = 0; i < pending.length; i++) {
    const entry = pending[i];
    const progress = `[${i + 1}/${pending.length}]`;

    console.log(`${progress} ${entry.category} | ${entry.league}`);
    console.log(`  Region: ${entry.region} | Level: ${entry.level}`);

    try {
      // Primary search
      console.log(`  Searching: "${entry.search}"`);
      const serpData = await serpSearch(entry.search);
      let clubs = extractClubs(serpData, entry);
      console.log(`  Found ${clubs.length} clubs from primary search`);

      await sleep(RATE_LIMIT_MS);

      // Follow-up searches for more coverage
      const followUps = getFollowUpSearches(entry);
      for (const q of followUps) {
        try {
          const moreData = await serpSearch(q, 50);
          const moreClubs = extractClubs(moreData, entry);
          // Only add new ones
          const existingNames = new Set(clubs.map(c => c.club_name.toLowerCase()));
          const newOnes = moreClubs.filter(c => !existingNames.has(c.club_name.toLowerCase()));
          clubs = clubs.concat(newOnes);
          if (newOnes.length) console.log(`  +${newOnes.length} from follow-up`);
          await sleep(RATE_LIMIT_MS);
        } catch (e) {
          console.log(`  Follow-up search failed: ${e.message}`);
        }
      }

      // Upsert to Supabase
      if (clubs.length > 0) {
        const { inserted, skipped } = await upsertClubs(clubs);
        totalNew += inserted;
        state.totalInserted += inserted;
        console.log(`  ✓ Inserted: ${inserted} | Skipped: ${skipped} | Running total: ${state.totalInserted}`);
      } else {
        console.log(`  ⚠ No clubs extracted — may need manual review`);
      }

      state.completed.push(entry.league);
      saveState(state);

    } catch (e) {
      console.error(`  ✗ Error: ${e.message}`);
      // Don't mark as completed so it retries on resume
    }

    console.log('');
  }

  console.log('═══════════════════════════════════════════════════');
  console.log(`Done! ${totalNew} new clubs added this run`);
  console.log(`Total in database: ${state.totalInserted}`);
  console.log(`State saved to ${STATE_FILE} — run with --resume to continue\n`);
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
