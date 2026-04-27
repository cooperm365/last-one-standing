-- ============================================
-- Last One Standing - Supabase Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Events table: each scannable activity
CREATE TABLE events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'darts','pool','trivia','bingo','live_music','blackjack','other'
  points_value INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Players table: identified by phone number
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Check-ins table: one row per scan
CREATE TABLE checkins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  points_earned INTEGER NOT NULL,
  scanned_at TIMESTAMPTZ DEFAULT now(),
  -- One scan per player per event (ever)
  UNIQUE(player_id, event_id)
);

-- Bonus points: awarded manually by admin for wins/performance
CREATE TABLE bonus_points (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  reason TEXT,
  awarded_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Leaderboard view: total points per player
-- ============================================
CREATE OR REPLACE VIEW leaderboard AS
SELECT
  p.id,
  p.name,
  p.phone,
  COALESCE(SUM(c.points_earned), 0) + COALESCE(SUM(b.points), 0) AS total_points,
  COUNT(DISTINCT c.id) AS total_checkins,
  MAX(c.scanned_at) AS last_seen
FROM players p
LEFT JOIN checkins c ON c.player_id = p.id
LEFT JOIN bonus_points b ON b.player_id = p.id
GROUP BY p.id, p.name, p.phone
ORDER BY total_points DESC;

-- ============================================
-- Row Level Security (RLS)
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_points ENABLE ROW LEVEL SECURITY;

-- Public read on events (needed to show event name on check-in page)
CREATE POLICY "events_public_read" ON events FOR SELECT USING (true);

-- Players: anyone can insert (new sign-up), read own row by phone match
CREATE POLICY "players_public_insert" ON players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_public_read" ON players FOR SELECT USING (true);
CREATE POLICY "players_public_update" ON players FOR UPDATE USING (true);

-- Checkins: anyone can insert + read (enforced by unique constraint)
CREATE POLICY "checkins_public_insert" ON checkins FOR INSERT WITH CHECK (true);
CREATE POLICY "checkins_public_read" ON checkins FOR SELECT USING (true);

-- Bonus points: public read only (admin writes via service key)
CREATE POLICY "bonus_public_read" ON bonus_points FOR SELECT USING (true);
CREATE POLICY "bonus_admin_insert" ON bonus_points FOR INSERT WITH CHECK (true);

-- Leaderboard view: public read
CREATE POLICY "leaderboard_public_read" ON leaderboard FOR SELECT USING (true);

-- ============================================
-- Seed some example events (edit as needed)
-- ============================================
INSERT INTO events (name, type, points_value) VALUES
  ('Tuesday Trivia Night', 'trivia', 15),
  ('Darts Open', 'darts', 10),
  ('Pool Tournament', 'pool', 10),
  ('Bingo Night', 'bingo', 15),
  ('Live Music - The Regulars', 'live_music', 10),
  ('Blackjack Table', 'blackjack', 10);
