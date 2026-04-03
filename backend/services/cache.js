const pool = require('../db/pool');

// --- News ---

async function cacheNews(newsArray) {
  if (!newsArray?.length) return 0;
  let cached = 0;
  for (const item of newsArray) {
    const externalId = item.id || item.title;
    if (!externalId) continue;
    await pool.query(
      `INSERT INTO news_cache (external_id, title, description, image_url, source_url, source_name, category, pub_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (external_id) DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         image_url = EXCLUDED.image_url,
         source_url = EXCLUDED.source_url,
         source_name = EXCLUDED.source_name,
         category = EXCLUDED.category,
         pub_date = EXCLUDED.pub_date,
         fetched_at = NOW()`,
      [
        externalId,
        item.title,
        item.description || null,
        item.image_url || item.image || item.imgUrl || null,
        item.source_url || item.url || null,
        item.source_name || item.source || null,
        item.category || 'general',
        item.pub_date || item.pubDate || item.datePublished || null,
      ]
    );
    cached++;
  }
  return cached;
}

async function getNews(category = 'all', limit = 8) {
  let query = 'SELECT * FROM news_cache';
  const params = [];
  if (category && category !== 'all') {
    query += ' WHERE category = $1';
    params.push(category);
  }
  query += ' ORDER BY pub_date DESC NULLS LAST, fetched_at DESC';
  params.push(limit);
  query += ` LIMIT $${params.length}`;
  const { rows } = await pool.query(query, params);
  return rows;
}

// --- Matches ---

async function cacheMatches(matchesArray) {
  if (!matchesArray?.length) return 0;
  let cached = 0;
  for (const item of matchesArray) {
    const externalId = item.id;
    if (!externalId) continue;
    await pool.query(
      `INSERT INTO matches_cache (external_id, data, match_started, match_ended)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (external_id) DO UPDATE SET
         data = EXCLUDED.data,
         match_started = EXCLUDED.match_started,
         match_ended = EXCLUDED.match_ended,
         fetched_at = NOW()`,
      [
        externalId,
        JSON.stringify(item),
        item.matchStarted ?? false,
        item.matchEnded ?? false,
      ]
    );
    cached++;
  }
  return cached;
}

async function getMatches(filter = 'all') {
  let query = 'SELECT * FROM matches_cache';
  const conditions = [];

  if (filter === 'live') {
    conditions.push('match_started = true AND match_ended = false');
  } else if (filter === 'upcoming') {
    conditions.push('match_started = false AND match_ended = false');
  } else if (filter === 'recent') {
    conditions.push('match_ended = true');
  }

  if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
  query += ' ORDER BY fetched_at DESC';

  const { rows } = await pool.query(query);

  // Count live matches
  const { rows: liveRows } = await pool.query(
    'SELECT COUNT(*) as count FROM matches_cache WHERE match_started = true AND match_ended = false'
  );

  return {
    matches: rows.map((r) => ({ ...r.data, _cachedAt: r.fetched_at })),
    liveCount: parseInt(liveRows[0].count, 10),
  };
}

// --- Standings (hardcoded IPL 2026) ---

function getStandings() {
  return [
    { pos: 1, team: 'Mumbai Indians', played: 6, won: 5, lost: 1, nrr: '+1.242', pts: 10 },
    { pos: 2, team: 'Chennai Super Kings', played: 6, won: 4, lost: 2, nrr: '+0.873', pts: 8 },
    { pos: 3, team: 'Royal Challengers Bengaluru', played: 6, won: 4, lost: 2, nrr: '+0.541', pts: 8 },
    { pos: 4, team: 'Gujarat Titans', played: 6, won: 3, lost: 3, nrr: '+0.312', pts: 6 },
    { pos: 5, team: 'Rajasthan Royals', played: 6, won: 3, lost: 3, nrr: '+0.104', pts: 6 },
    { pos: 6, team: 'Kolkata Knight Riders', played: 6, won: 3, lost: 3, nrr: '-0.089', pts: 6 },
    { pos: 7, team: 'Delhi Capitals', played: 6, won: 2, lost: 4, nrr: '-0.456', pts: 4 },
    { pos: 8, team: 'Lucknow Super Giants', played: 6, won: 2, lost: 4, nrr: '-0.723', pts: 4 },
    { pos: 9, team: 'Sunrisers Hyderabad', played: 6, won: 2, lost: 4, nrr: '-0.891', pts: 4 },
    { pos: 10, team: 'Punjab Kings', played: 6, won: 1, lost: 5, nrr: '-1.134', pts: 2 },
  ];
}

module.exports = { cacheNews, getNews, cacheMatches, getMatches, getStandings };
