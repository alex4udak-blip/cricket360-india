const { Router } = require('express');
const { getNews, cacheNews } = require('../services/cache');
const { fetchNews } = require('../services/cricapi');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const category = req.query.category || 'all';
    const limit = Math.min(parseInt(req.query.limit, 10) || 8, 50);

    let data = await getNews(category, limit);

    // If cache empty, fetch from CricAPI immediately
    if (!data.length) {
      console.log('[news] Cache empty, fetching from CricAPI...');
      try {
        const fresh = await fetchNews();
        await cacheNews(fresh);
        data = await getNews(category, limit);
      } catch (fetchErr) {
        console.error('[news] CricAPI fetch failed:', fetchErr.message);
      }
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('[news] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch news' });
  }
});

module.exports = router;
