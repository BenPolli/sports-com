/**
 * Shared Supabase helper for all scrapers
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const TABLE = process.env.SUPABASE_TABLE || 'clubs';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_KEY in .env');
  process.exit(1);
}

const headers = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

async function upsertClubs(clubs) {
  if (!clubs.length) return { inserted: 0, errors: 0 };

  let inserted = 0;
  let errors = 0;

  // Batch in 200s with merge-duplicates
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
        // Fall back to one-by-one
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
      console.error(`  Batch error: ${e.message}`);
      errors += batch.length;
    }
  }

  return { inserted, errors };
}

async function upsertLeagues(leagues) {
  if (!leagues.length) return 0;

  let inserted = 0;
  for (let i = 0; i < leagues.length; i += 200) {
    const batch = leagues.slice(i, i + 200);
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/leagues`, {
        method: 'POST',
        headers: { ...headers, 'Prefer': 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify(batch)
      });
      if (res.ok) {
        const data = await res.json();
        inserted += data.length;
      }
    } catch (e) {
      console.error(`  League batch error: ${e.message}`);
    }
  }
  return inserted;
}

async function logRun(phase, status, stats = {}) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/scrape_runs`, {
      method: 'POST',
      headers: { ...headers, 'Prefer': 'return=minimal' },
      body: JSON.stringify({
        phase,
        status,
        clubs_found: stats.found || 0,
        clubs_inserted: stats.inserted || 0,
        errors: stats.errors || 0,
        completed_at: status !== 'running' ? new Date().toISOString() : null,
        log: stats.log || ''
      })
    });
  } catch { /* non-critical */ }
}

async function getClubCount() {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=id&limit=1`, {
      headers: { ...headers, 'Prefer': 'count=exact' }
    });
    const range = res.headers.get('content-range');
    return parseInt(range?.split('/')[1] || '0');
  } catch { return 0; }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

module.exports = { upsertClubs, upsertLeagues, logRun, getClubCount, sleep, SUPABASE_URL, SUPABASE_KEY, headers };
