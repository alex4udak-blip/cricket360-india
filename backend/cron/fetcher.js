const cron = require('node-cron');
const { fetchNews, fetchMatches } = require('../services/cricapi');
const { cacheNews, cacheMatches } = require('../services/cache');

function startCronJobs() {
  // News: every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const news = await fetchNews();
      const count = await cacheNews(news);
      console.log(`[cron] News fetched: ${count} items cached`);
    } catch (err) {
      console.error('[cron] News fetch failed:', err.message);
    }
  });

  // Matches: every 60 seconds
  cron.schedule('*/1 * * * *', async () => {
    try {
      const matches = await fetchMatches();
      const count = await cacheMatches(matches);
      console.log(`[cron] Matches fetched: ${count} items cached`);
    } catch (err) {
      console.error('[cron] Matches fetch failed:', err.message);
    }
  });

  console.log('[cron] Jobs started — news every 5min, matches every 1min');
}

module.exports = { startCronJobs };
