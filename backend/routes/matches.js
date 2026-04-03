const { Router } = require('express');
const { getMatches, cacheMatches } = require('../services/cache');
const { fetchMatches } = require('../services/cricapi');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const filter = req.query.filter || 'all';
    const validFilters = ['all', 'live', 'upcoming', 'recent'];
    if (!validFilters.includes(filter)) {
      return res.status(400).json({ success: false, error: `Invalid filter. Use: ${validFilters.join(', ')}` });
    }

    let result = await getMatches(filter);

    // If cache empty, fetch from CricAPI immediately
    if (!result.matches.length && filter === 'all') {
      console.log('[matches] Cache empty, fetching from CricAPI...');
      try {
        const fresh = await fetchMatches();
        await cacheMatches(fresh);
        result = await getMatches(filter);
      } catch (fetchErr) {
        console.error('[matches] CricAPI fetch failed:', fetchErr.message);
      }
    }

    res.json({ success: true, data: result.matches, liveCount: result.liveCount });
  } catch (err) {
    console.error('[matches] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch matches' });
  }
});

module.exports = router;
