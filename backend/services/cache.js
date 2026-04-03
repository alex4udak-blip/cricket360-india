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
    { short: 'MI',   color: '#005DA0', m: 6, w: 5, l: 1, nrr: '+1.242', pts: 10 },
    { short: 'CSK',  color: '#F9CD05', m: 6, w: 4, l: 2, nrr: '+0.873', pts: 8 },
    { short: 'RCB',  color: '#EC1C24', m: 6, w: 4, l: 2, nrr: '+0.541', pts: 8 },
    { short: 'GT',   color: '#D4AF37', m: 6, w: 3, l: 3, nrr: '+0.312', pts: 6 },
    { short: 'RR',   color: '#1C4B9C', m: 6, w: 3, l: 3, nrr: '+0.104', pts: 6 },
    { short: 'KKR',  color: '#7960A8', m: 6, w: 3, l: 3, nrr: '-0.089', pts: 6 },
    { short: 'DC',   color: '#0057A8', m: 6, w: 2, l: 4, nrr: '-0.456', pts: 4 },
    { short: 'LSG',  color: '#E11D48', m: 6, w: 2, l: 4, nrr: '-0.723', pts: 4 },
    { short: 'SRH',  color: '#FF4E00', m: 6, w: 2, l: 4, nrr: '-0.891', pts: 4 },
    { short: 'PBKS', color: '#00BCD4', m: 6, w: 1, l: 5, nrr: '-1.134', pts: 2 },
  ];
}

module.exports = { cacheNews, getNews, cacheMatches, getMatches, getStandings };
