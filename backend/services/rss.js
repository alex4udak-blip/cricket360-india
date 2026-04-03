const FEEDS = [
  { url: 'https://www.espncricinfo.com/rss/content/story/feeds/0.xml', source: 'ESPNcricinfo' },
  { url: 'https://www.cricbuzz.com/cb-rss/cb-top-stories', source: 'Cricbuzz' },
  { url: 'https://sportstar.thehindu.com/cricket/feeder/default.rss', source: 'Sportstar' },
  { url: 'https://indianexpress.com/section/sports/cricket/feed/', source: 'Indian Express' },
];

const TIMEOUT = 10_000;

const CRICKET_IMAGES = [
  'https://images.unsplash.com/photo-1540747913346-19212a4b423e?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=600&q=80&auto=format&fit=crop',
];

function parseItems(xml, source) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = re.exec(xml)) !== null) {
    const block = match[1];

    // Extract tag content — handles CDATA and plain text
    const get = tag => {
      const m = block.match(new RegExp(`<${tag}[^>]*>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*<\\/${tag}>`, 'i'));
      return m ? m[1].trim() : '';
    };

    const title = get('title');
    if (!title) continue;

    // Link: try <link> tag, then <guid>, then href in <link> attributes
    let link = get('link') || get('guid');
    if (!link) {
      const linkMatch = block.match(/<link[^>]*href="([^"]+)"/);
      if (linkMatch) link = linkMatch[1];
    }
    // Some RSS feeds have <link>URL</link> without CDATA
    if (!link) {
      const plainLink = block.match(/<link>\s*(https?:\/\/[^\s<]+)\s*<\/link>/);
      if (plainLink) link = plainLink[1];
    }

    const desc = get('description').replace(/<[^>]+>/g, '').replace(/&[a-z]+;/gi, ' ').slice(0, 500);
    const pubDate = get('pubDate') || get('dc:date') || get('published');

    // Image: try multiple patterns
    let img = '';
    const imgPatterns = [
      /url="([^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i,
      /<media:content[^>]+url="([^"]+)"/i,
      /<media:thumbnail[^>]+url="([^"]+)"/i,
      /<enclosure[^>]+url="([^"]+)"/i,
      /<img[^>]+src="([^"]+)"/i,
      /src="(https?:\/\/[^"]+\.(jpg|jpeg|png|webp)[^"]*)"/i,
    ];
    for (const p of imgPatterns) {
      const m = block.match(p);
      if (m) { img = m[1]; break; }
    }
    // Fallback: random cricket image
    if (!img) {
      img = CRICKET_IMAGES[items.length % CRICKET_IMAGES.length];
    }

    items.push({
      id: link || `${source}-${title.slice(0, 40)}`,
      title,
      description: desc,
      image_url: img,
      source_url: link || '',
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
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Cricket360Bot/1.0)' },
      });
      clearTimeout(timer);
      if (!res.ok) { console.log(`[rss] ${feed.source} HTTP ${res.status}`); continue; }
      const xml = await res.text();
      const items = parseItems(xml, feed.source);
      console.log(`[rss] ${feed.source}: ${items.length} items, ${items.filter(i=>i.source_url).length} with links`);
      allItems.push(...items);
    } catch (e) {
      console.log(`[rss] ${feed.source} failed: ${e.message}`);
    }
  }
  allItems.sort((a, b) => new Date(b.pub_date) - new Date(a.pub_date));
  return allItems.slice(0, 30);
}

module.exports = { fetchRSSNews };
