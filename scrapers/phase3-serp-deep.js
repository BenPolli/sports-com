#!/usr/bin/env node
/**
 * Phase 3: Deep SERP Scraper
 *
 * Covers everything that Wikipedia and FA Full-Time miss:
 * - Soccer schools & private academies
 * - Disability football (all types)
 * - Walking football clubs
 * - Futsal clubs
 * - Veterans football
 * - Small grassroots clubs without FA registration
 * - Club websites for contact enrichment
 *
 * Usage:
 *   node scrapers/phase3-serp-deep.js
 *   node scrapers/phase3-serp-deep.js --resume
 *   node scrapers/phase3-serp-deep.js --category "Soccer School"
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { upsertClubs, upsertLeagues, logRun, getClubCount, sleep } = require('./supabase');

const SERP_API_KEY = process.env.SERP_API_KEY;
const STATE_FILE = path.join(__dirname, '..', 'state-phase3.json');
const RATE_MS = 1500;

if (!SERP_API_KEY) { console.error('Missing SERP_API_KEY'); process.exit(1); }

// ─── UK cities and towns for geographic coverage ──────────────────────────────
const MAJOR_CITIES = [
  'London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool', 'Sheffield', 'Bristol',
  'Newcastle', 'Nottingham', 'Leicester', 'Southampton', 'Brighton', 'Portsmouth',
  'Plymouth', 'Sunderland', 'Wolverhampton', 'Coventry', 'Derby', 'Stoke-on-Trent',
  'Reading', 'Oxford', 'Cambridge', 'Norwich', 'Ipswich', 'Luton', 'Milton Keynes',
  'Northampton', 'Peterborough', 'Swindon', 'Gloucester', 'Exeter', 'Bournemouth',
  'Bath', 'Cheltenham', 'Worcester', 'Hereford', 'Shrewsbury', 'Chester',
  'Blackpool', 'Preston', 'Bolton', 'Wigan', 'Blackburn', 'Burnley',
  'York', 'Hull', 'Doncaster', 'Barnsley', 'Rotherham', 'Huddersfield',
  'Bradford', 'Halifax', 'Wakefield', 'Middlesbrough', 'Darlington', 'Hartlepool',
  'Carlisle', 'Scarborough', 'Grimsby', 'Lincoln', 'Mansfield', 'Chesterfield',
  'Crewe', 'Stockport', 'Oldham', 'Rochdale', 'Salford', 'Warrington',
  'Colchester', 'Chelmsford', 'Southend', 'Basildon', 'Harlow', 'Stevenage',
  'Watford', 'St Albans', 'Hemel Hempstead', 'Aylesbury', 'High Wycombe',
  'Slough', 'Maidenhead', 'Bracknell', 'Basingstoke', 'Winchester', 'Salisbury',
  'Taunton', 'Yeovil', 'Torquay', 'Truro', 'Barnstaple', 'Weston-super-Mare',
  'Crawley', 'Hastings', 'Eastbourne', 'Worthing', 'Chichester', 'Guildford',
  'Woking', 'Epsom', 'Kingston upon Thames', 'Croydon', 'Bromley', 'Dartford',
  'Maidstone', 'Canterbury', 'Dover', 'Folkestone', 'Tunbridge Wells', 'Ashford',
  'Thanet', 'Medway', 'Gravesend', 'Swale',
  // Scotland
  'Glasgow', 'Edinburgh', 'Dundee', 'Aberdeen', 'Inverness', 'Stirling',
  'Perth', 'Kilmarnock', 'Ayr', 'Dumfries', 'Falkirk', 'Dunfermline',
  // Wales
  'Cardiff', 'Swansea', 'Newport', 'Wrexham', 'Bangor', 'Llanelli', 'Barry',
  // Northern Ireland
  'Belfast', 'Derry', 'Lisburn', 'Newry', 'Bangor', 'Craigavon', 'Ballymena'
];

const SMALL_TOWNS = [
  'Aldershot', 'Andover', 'Banbury', 'Bicester', 'Bideford', 'Bishop Auckland',
  'Blyth', 'Bognor Regis', 'Bridgwater', 'Bridlington', 'Bromsgrove',
  'Buxton', 'Canvey Island', 'Carshalton', 'Chesham', 'Chippenham',
  'Chorley', 'Clacton', 'Coalville', 'Congleton', 'Corby', 'Daventry',
  'Deal', 'Didcot', 'Droitwich', 'Droylsden', 'Dulwich', 'Dunstable',
  'Dursley', 'Evesham', 'Farnborough', 'Farnham', 'Felixstowe', 'Fleet',
  'Fleetwood', 'Frome', 'Gainsborough', 'Glastonbury', 'Godalming',
  'Goole', 'Gosport', 'Grantham', 'Grays', 'Great Yarmouth', 'Guiseley',
  'Halesowen', 'Harrogate', 'Havant', 'Haverhill', 'Hedge End', 'Henley',
  'Herne Bay', 'Hinckley', 'Hitchin', 'Hucknall', 'Hythe', 'Ilkeston',
  'Kenilworth', 'Kettering', 'Kidderminster', 'Kidsgrove', 'Kings Lynn',
  'Kingstonian', 'Leatherhead', 'Leek', 'Letchworth', 'Lewes', 'Lichfield',
  'Long Eaton', 'Loughborough', 'Lowestoft', 'Market Drayton', 'Market Harborough',
  'Marlow', 'Matlock', 'Melton Mowbray', 'Merthyr Tydfil', 'Morpeth',
  'Nantwich', 'Newark', 'Newmarket', 'Newton Abbot', 'Nuneaton', 'Oakham',
  'Oswestry', 'Penrith', 'Pontefract', 'Redditch', 'Retford', 'Ringwood',
  'Romsey', 'Ross-on-Wye', 'Royston', 'Rugby', 'Runcorn', 'Rushden',
  'Sandbach', 'Seaford', 'Selby', 'Sevenoaks', 'Shaftesbury', 'Sidmouth',
  'Skegness', 'Skipton', 'Sleaford', 'Spalding', 'Spennymoor', 'Stafford',
  'Stamford', 'Stourbridge', 'Stowmarket', 'Stratford-upon-Avon', 'Stroud',
  'Sudbury', 'Tamworth', 'Tewkesbury', 'Thame', 'Thetford', 'Thirsk',
  'Tiverton', 'Tonbridge', 'Towcester', 'Trowbridge', 'Uckfield',
  'Uttoxeter', 'Wallingford', 'Wantage', 'Ware', 'Warminster', 'Wellingborough',
  'Wells', 'Welwyn Garden City', 'Whitby', 'Whitehaven', 'Whitstable',
  'Wimborne', 'Wincanton', 'Witham', 'Witney', 'Woodbridge', 'Workington'
];

// ─── Search query definitions ─────────────────────────────────────────────────
function buildQueries() {
  const queries = [];

  // SOCCER SCHOOLS — search every major city
  for (const city of MAJOR_CITIES) {
    queries.push({
      search: `"${city}" soccer school football academy coaching children youth`,
      category: 'Soccer School',
      league: `${city} Soccer Schools`,
      region: city,
      country: city.match(/Glasgow|Edinburgh|Dundee|Aberdeen|Inverness|Stirling|Perth|Kilmarnock|Ayr|Dumfries|Falkirk|Dunfermline/) ? 'Scotland' :
               city.match(/Cardiff|Swansea|Newport|Wrexham|Bangor|Llanelli|Barry/) ? 'Wales' :
               city.match(/Belfast|Derry|Lisburn|Newry|Craigavon|Ballymena/) ? 'Northern Ireland' : 'England'
    });
  }

  // DISABILITY FOOTBALL — comprehensive
  const disabilityTypes = [
    { type: 'Powerchair Football', search: 'powerchair football club team UK' },
    { type: 'Blind Football', search: 'blind football club team UK' },
    { type: 'Deaf Football', search: 'deaf football club team UK' },
    { type: 'Cerebral Palsy Football', search: 'cerebral palsy CP football club team UK' },
    { type: 'Amputee Football', search: 'amputee football club team UK' },
    { type: 'Frame Football', search: 'frame football club team UK' },
    { type: 'Down Syndrome Football', search: "down's syndrome football club team UK" },
    { type: 'Learning Disability Football', search: 'learning disability football club team UK' },
    { type: 'Mental Health Football', search: 'mental health football club team UK' },
    { type: 'Wheelchair Football', search: 'wheelchair football club team UK' },
    { type: 'Pan-Disability Football', search: 'pan disability inclusive football club UK' },
  ];

  for (const d of disabilityTypes) {
    queries.push({ search: d.search, category: 'Disability', league: d.type, region: 'UK', country: 'England' });
    queries.push({ search: `${d.search} list all clubs`, category: 'Disability', league: d.type, region: 'UK', country: 'England' });
  }

  // WALKING FOOTBALL — every major city
  for (const city of MAJOR_CITIES.slice(0, 50)) {
    queries.push({
      search: `"${city}" walking football club over 50 over 60`,
      category: 'Walking Football',
      league: 'Walking Football',
      region: city,
      country: 'England'
    });
  }

  // FUTSAL
  for (const city of MAJOR_CITIES.slice(0, 30)) {
    queries.push({
      search: `"${city}" futsal club team league`,
      category: 'Futsal',
      league: 'Futsal',
      region: city,
      country: 'England'
    });
  }

  // VETERANS
  for (const city of MAJOR_CITIES.slice(0, 30)) {
    queries.push({
      search: `"${city}" veterans over 35 football club team`,
      category: 'Veterans',
      league: 'Veterans Football',
      region: city,
      country: 'England'
    });
  }

  // JUNIOR / YOUTH — deep search for smaller clubs in small towns
  for (const town of SMALL_TOWNS) {
    queries.push({
      search: `"${town}" junior youth football club teams`,
      category: 'Junior',
      league: `${town} Junior Football`,
      region: town,
      country: 'England'
    });
  }

  // SUNDAY LEAGUES — small towns
  for (const town of SMALL_TOWNS) {
    queries.push({
      search: `"${town}" sunday league football clubs teams`,
      category: 'Grassroots',
      league: `${town} Sunday League`,
      region: town,
      country: 'England'
    });
  }

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

// ─── Extract clubs from SERP results ──────────────────────────────────────────
function extractClubs(serpData, query) {
  const clubs = [];
  const seen = new Set();
  const results = serpData.organic_results || [];

  for (const r of results) {
    const title = r.title || '';
    const snippet = r.snippet || '';
    const link = r.link || '';
    const text = `${title} ${snippet}`;

    // Club name patterns
    const patterns = [
      /\b([A-Z][a-zA-Z\s&'.-]{2,45}(?:FC|A\.?F\.?C\.?|United|City|Town|Rovers|Wanderers|Athletic|Rangers|Albion|Borough|Academicals|Thistle|Celtic))\b/g,
      /\b([A-Z][a-zA-Z\s&'.-]{2,45}(?:Juniors|Youth|Colts|Boys|Girls|Minors|Academy|Soccer School|Football Academy))\b/g,
      /\b([A-Z][a-zA-Z\s&'.-]{2,45}(?:Ladies|Women|Girls)(?:\s+FC)?)\b/g,
      /\b([A-Z][a-zA-Z\s&'.-]{2,45}(?:Walking Football|Futsal|Veterans)(?:\s+Club)?)\b/g,
      /\b([A-Z][a-zA-Z\s&'.-]{2,45}(?:Powerchair|Blind|Deaf|Amputee|Frame)(?:\s+Football)?(?:\s+Club)?)\b/g,
      /\b([A-Z][a-zA-Z\s&'.-]{2,45}(?:Football Club|Soccer Club|Sports Club))\b/g,
    ];

    for (const pat of patterns) {
      for (const m of text.matchAll(pat)) {
        const name = m[1].trim();
        const key = name.toLowerCase();

        if (name.length < 4 || name.length > 55) continue;
        if (/^(The |This |That |Their |These |From |With |About |How |What |When |Where )/i.test(name)) continue;
        if (/\b(Premier League|Championship|National League|Football Association|Full Time|Wikipedia|BBC|Sky Sports)\b/i.test(name)) continue;

        if (!seen.has(key)) {
          seen.add(key);
          clubs.push({
            club_name: name,
            league_name: query.league,
            sport: 'Football',
            category: query.category,
            region: query.region,
            country: query.country,
            website: link,
            source: 'serp_api',
            source_url: link,
            stage: 'Not Contacted',
            est_value: 0
          });
        }
      }
    }

    // For soccer schools, also extract business names from titles
    if (query.category === 'Soccer School') {
      // Match "Name Soccer School" or "Name Football Academy" from titles
      const schoolPatterns = [
        /^(.+?(?:Soccer|Football)\s*(?:School|Academy|Coaching|Training))/i,
        /^(.+?(?:Academy|School|Coaching))\s*[-–|]/i,
      ];
      for (const pat of schoolPatterns) {
        const m = title.match(pat);
        if (m) {
          const name = m[1].trim();
          const key = name.toLowerCase();
          if (name.length > 3 && name.length < 55 && !seen.has(key)) {
            seen.add(key);
            clubs.push({
              club_name: name,
              league_name: query.league,
              sport: 'Football',
              category: 'Soccer School',
              region: query.region,
              country: query.country,
              website: link,
              source: 'serp_api',
              source_url: link,
              stage: 'Not Contacted',
              est_value: 0
            });
          }
        }
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
  const args = process.argv.slice(2);
  const isResume = args.includes('--resume');
  const categoryFilter = args.includes('--category') ? args[args.indexOf('--category') + 1] : null;

  console.log('\n=== PHASE 3: Deep SERP Scraper ===');
  console.log('==================================\n');

  const state = isResume ? loadState() : { completed: [], clubsFound: 0 };
  const startCount = await getClubCount();
  console.log(`Database currently has ${startCount} clubs\n`);

  await logRun('serp_deep', 'running');

  let queries = buildQueries();
  if (categoryFilter) {
    queries = queries.filter(q => q.category.toLowerCase() === categoryFilter.toLowerCase());
    console.log(`Filtering to category: ${categoryFilter} (${queries.length} queries)\n`);
  }

  const pending = queries.filter((_, i) => !state.completed.includes(i));
  console.log(`${pending.length} queries remaining\n`);

  let totalNew = 0;

  for (let i = 0; i < pending.length; i++) {
    const queryIdx = queries.indexOf(pending[i]);
    const q = pending[i];
    const progress = `[${i + 1}/${pending.length}]`;

    console.log(`${progress} ${q.category} | ${q.region}`);

    try {
      const serpData = await serpSearch(q.search);
      const clubs = extractClubs(serpData, q);

      if (clubs.length) {
        const { inserted, errors } = await upsertClubs(clubs);
        totalNew += inserted;
        state.clubsFound += inserted;
        console.log(`  Found: ${clubs.length} -> Inserted: ${inserted}`);
      } else {
        console.log(`  No clubs found`);
      }

      state.completed.push(queryIdx);
      saveState(state);
      await sleep(RATE_MS);

    } catch (e) {
      console.error(`  ERROR: ${e.message}`);
      if (e.message.includes('429') || e.message.includes('rate')) {
        console.log('  Rate limited — waiting 30s...');
        await sleep(30000);
      } else {
        await sleep(3000);
      }
    }
  }

  const endCount = await getClubCount();
  await logRun('serp_deep', 'completed', { found: state.clubsFound, inserted: totalNew });

  console.log('\n==================================');
  console.log(`Phase 3 complete! ${totalNew} new clubs. Total: ${endCount}\n`);
}

main().catch(e => { console.error('Fatal:', e); process.exit(1); });
