require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const pool = require('./db/pool');
const { startCronJobs } = require('./cron/fetcher');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/news', require('./routes/news'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/standings', require('./routes/standings'));

// Startup
async function start() {
  // Run DB schema migration
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('[db] Schema migration complete');
  } catch (err) {
    console.error('[db] Migration failed:', err.message);
    process.exit(1);
  }

  // Start cron jobs
  startCronJobs();

  // Listen
  app.listen(PORT, () => {
    console.log(`[server] Cricket360 backend running on port ${PORT}`);
  });
}

start();
