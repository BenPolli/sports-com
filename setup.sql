-- Sports CRM — Supabase table setup
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS clubs (
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
  category TEXT,           -- e.g. 'Professional', 'Semi-Pro', 'Grassroots', 'Junior', 'Women', 'Disability', 'Soccer School'
  pyramid_level INTEGER,   -- 1=Premier League, 2=Championship, ... down to grassroots
  region TEXT,             -- e.g. 'North West', 'London', 'Scotland'
  source TEXT,             -- where the data came from
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prevent duplicate clubs in the same league
CREATE UNIQUE INDEX IF NOT EXISTS idx_clubs_unique ON clubs (club_name, league_name);

-- Fast lookups
CREATE INDEX IF NOT EXISTS idx_clubs_league ON clubs (league_name);
CREATE INDEX IF NOT EXISTS idx_clubs_stage ON clubs (stage);
CREATE INDEX IF NOT EXISTS idx_clubs_category ON clubs (category);
CREATE INDEX IF NOT EXISTS idx_clubs_sport ON clubs (sport);

-- Enable Row Level Security but allow anon access (since this is a personal CRM)
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access" ON clubs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clubs_updated_at
  BEFORE UPDATE ON clubs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
