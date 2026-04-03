const { Router } = require('express');
const { getStandings } = require('../services/cache');

const router = Router();

router.get('/', async (req, res) => {
  try {
    const data = getStandings();
    res.json({ success: true, data });
  } catch (err) {
    console.error('[standings] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to fetch standings' });
  }
});

module.exports = router;
