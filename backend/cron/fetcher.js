const cron = require('node-cron');
const { fetchMatches } = require('../services/cricapi');
const { fetchRSSNews } = require('../services/rss');
const { cacheNews, cacheMatches } = require('../services/cache');

function startCronJobs() {
  // News via RSS: every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      const news = await fetchRSSNews();
      const count = await cacheNews(news);
      console.log(`[cron] RSS news fetched: ${count} items cached`);
    } catch (err) {
      console.error('[cron] RSS news fetch failed:', err.message);
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
