CREATE TABLE IF NOT EXISTS news_cache (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  source_url TEXT,
  source_name TEXT,
  category TEXT DEFAULT 'general',
  pub_date TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS matches_cache (
  id SERIAL PRIMARY KEY,
  external_id TEXT UNIQUE,
  data JSONB NOT NULL,
  match_started BOOLEAN DEFAULT FALSE,
  match_ended BOOLEAN DEFAULT FALSE,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_fetched ON news_cache(fetched_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_fetched ON matches_cache(fetched_at DESC);
