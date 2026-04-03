const FEEDS = [
  { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', source: 'ESPNcricinfo' },
  { url: 'https://www.cricbuzz.com/cb-rss/cb-top-stories', source: 'Cricbuzz' },
  { url: 'https://sportstar.thehindu.com/cricket/feeder/default.rss', source: 'Sportstar' },
  { url: 'https://indianexpress.com/section/sports/cricket/feed/', source: 'Indian Express' },
];

const TIMEOUT = 10_000;

function parseItems(xml, source) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    const block = match[1];
    const get = tag => {
      const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?(.*?)(?:\\]\\]>)?<\\/${tag}>`, 's'));
      return m ? m[1].trim() : '';
    };
    const title = get('title');
    if (!title) continue;
    const link = get('link') || get('guid');
    const desc = get('description').replace(/<[^>]+>/g, '').slice(0, 500);
    const pubDate = get('pubDate');
    const img = (block.match(/url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/) || [])[1]
      || (block.match(/<media:content[^>]+url="([^"]+)"/) || [])[1]
      || (block.match(/<enclosure[^>]+url="([^"]+)"/) || [])[1]
      || '';

    items.push({
      id: link || `${source}-${title.slice(0, 40)}`,
      title,
      description: desc,
      image_url: img,
      source_url: link,
      source_name: source,
      pub_date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
    });
  }
  return items;
}

async function fetchRSSNews() {
  const allItems = [];
  for (const feed of FEEDS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT);
      const res = await fetch(feed.url, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Cricket360Bot/1.0' },
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseItems(xml, feed.source);
      allItems.push(...items);
    } catch (e) {
      console.log(`[rss] ${feed.source} failed: ${e.message}`);
    }
  }
  // Sort by date desc, deduplicate by title similarity
  allItems.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));
  return allItems.slice(0, 30);
}

module.exports = { fetchRSSNews };
