const BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = process.env.CRICAPI_KEY;
const TIMEOUT = 10_000;

async function cricFetch(endpoint) {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${API_KEY}&offset=0`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`CricAPI ${res.status}: ${res.statusText}`);
    const json = await res.json();
    if (json.status !== 'success') throw new Error(`CricAPI error: ${json.info || 'unknown'}`);
    return json.data || [];
  } finally {
    clearTimeout(timer);
  }
}

async function fetchNews() {
  return cricFetch('/cricNews');
}

async function fetchMatches() {
  return cricFetch('/currentMatches');
}

module.exports = { fetchNews, fetchMatches };
