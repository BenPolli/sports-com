-- Sports CRM — Full Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ═══════════════════════════════════════════════════════════════════
-- 1. LEAGUES TABLE — master list of every league/competition
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS leagues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  league_name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,          -- Professional, Semi-Pro, Grassroots, Junior, Women, Disability, Soccer School, Walking Football, Futsal, Veterans
  pyramid_level INTEGER DEFAULT 0,
  region TEXT,
  country TEXT DEFAULT 'England',  -- England, Scotland, Wales, Northern Ireland
  fa_full_time_id TEXT,            -- ID from FA Full-Time system
  website TEXT,
  club_count INTEGER DEFAULT 0,
  scraped BOOLEAN DEFAULT FALSE,
  scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leagues_category ON leagues (category);
CREATE INDEX IF NOT EXISTS idx_leagues_country ON leagues (country);

-- ═══════════════════════════════════════════════════════════════════
-- 2. CLUBS TABLE — every club/team contact
-- ═══════════════════════════════════════════════════════════════════
DROP TABLE IF EXISTS clubs;
CREATE TABLE clubs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  club_name TEXT NOT NULL,
  league_name TEXT,
  sport TEXT DEFAULT 'Football',
  contact_name TEXT,
  email TEXT,
  number TEXT,
  role TEXT,
  stage TEXT DEFAULT 'Not Contacted',
  est_value NUMERIC DEFAULT 0,
  teams TEXT,
  linkedin TEXT,
  notes TEXT,
  website TEXT,
  address TEXT,
  postcode TEXT,
  county TEXT,
  category TEXT,
  pyramid_level INTEGER,
  region TEXT,
  country TEXT DEFAULT 'England',
  fa_club_id TEXT,               -- FA Full-Time club ID
  source TEXT,                   -- fa_fulltime, wikipedia, serp, manual
  source_url TEXT,
  has_contact BOOLEAN DEFAULT FALSE,
  contact_enriched_at TIMESTAMPTZ,
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(club_name, league_name)
);

CREATE INDEX IF NOT EXISTS idx_clubs_league ON clubs (league_name);
CREATE INDEX IF NOT EXISTS idx_clubs_stage ON clubs (stage);
CREATE INDEX IF NOT EXISTS idx_clubs_category ON clubs (category);
CREATE INDEX IF NOT EXISTS idx_clubs_country ON clubs (country);
CREATE INDEX IF NOT EXISTS idx_clubs_has_contact ON clubs (has_contact);
CREATE INDEX IF NOT EXISTS idx_clubs_source ON clubs (source);

-- ═══════════════════════════════════════════════════════════════════
-- 3. SCRAPE_RUNS TABLE — track each scrape session
-- ═══════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS scrape_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phase TEXT NOT NULL,           -- fa_fulltime, wikipedia, serp, enrichment
  status TEXT DEFAULT 'running', -- running, completed, failed
  clubs_found INTEGER DEFAULT 0,
  clubs_inserted INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  log TEXT
);

-- ═══════════════════════════════════════════════════════════════════
-- 4. RLS + TRIGGERS
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE scrape_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access" ON leagues FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON clubs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access" ON scrape_runs FOR ALL USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS clubs_updated_at ON clubs;
CREATE TRIGGER clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════
-- 5. USEFUL VIEWS
-- ═══════════════════════════════════════════════════════════════════
CREATE OR REPLACE VIEW club_stats AS
SELECT
  category,
  country,
  COUNT(*) as total_clubs,
  COUNT(*) FILTER (WHERE has_contact) as with_contact,
  COUNT(*) FILTER (WHERE email IS NOT NULL AND email != '') as with_email,
  COUNT(*) FILTER (WHERE stage != 'Not Contacted') as contacted
FROM clubs
GROUP BY category, country
ORDER BY total_clubs DESC;

CREATE OR REPLACE VIEW scrape_progress AS
SELECT
  source,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE has_contact) as enriched,
  ROUND(COUNT(*) FILTER (WHERE has_contact)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as pct_enriched
FROM clubs
GROUP BY source
ORDER BY total DESC;
