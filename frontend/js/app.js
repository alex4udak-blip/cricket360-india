const API_BASE = window.__API_BASE || 'https://cricket360-india-g9380f.saturn.ac';

function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}

const IMGS=[
  'https://images.unsplash.com/photo-1540747913346-19212a4b423e?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=600&q=80&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=600&q=80&auto=format&fit=crop',
];
const fb=i=>IMGS[i%IMGS.length];

async function fetchNews(category='all', limit=8){
  const g=document.getElementById('newsGrid');
  if(!g)return;
  g.innerHTML='<div style="grid-column:1/-1"><div class="ld"><div class="spin"></div>Live news aa rahi hai...</div></div>';
  try{
    const r=await fetch(`${API_BASE}/api/news?category=${category}&limit=${limit}`);
    const d=await r.json();
    if(!d.success)throw new Error(d.error||'API error');
    const items=d.data||[];
    if(typeof setNewsData==='function')setNewsData(items);
    if(!items.length)throw new Error('Koi news nahi mili');
    g.innerHTML=items.map((n,i)=>{
      const img=n.image_url||fb(i);
      const dt=n.pub_date?new Date(n.pub_date).toLocaleDateString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
      const src=n.source_name||'Cricket';
      const hasUrl=n.source_url&&n.source_url.startsWith('http');
      return `<div class="ncard" data-idx="${i}" data-url="${hasUrl?esc(n.source_url):''}">
        <img src="${esc(img)}" alt="" onerror="this.src='${fb(i)}'">
        <div class="ncard-body">
          <div class="ncat">Cricket News</div>
          <div class="nttl">${esc(n.title||'News')}</div>
          <div class="nmeta"><span class="nsrc">${esc(src)}</span><span>${esc(dt)}</span></div>
        </div>
      </div>`;
    }).join('');
    g.addEventListener('click',function handler(e){
      const card=e.target.closest('.ncard');if(!card)return;
      const url=card.dataset.url;const idx=+card.dataset.idx;
      if(url)window.open(url,'_blank','noopener');else if(typeof openArt==='function')openArt(idx);
    },{once:true});
  }catch(e){
    g.innerHTML=`<div style="grid-column:1/-1"><div class="err"><strong>News load nahi hui</strong>${esc(e.message)}<br><button class="err-retry" onclick="fetchNews('${esc(category)}')">↻ Phir Try Karo</button></div></div>`;
  }
}

async function fetchMatches(filter='all'){
  const w=document.getElementById('matchWrap');
  if(!w)return;
  w.innerHTML='<div class="ld"><div class="spin"></div>Live matches fetch ho rahe hain...</div>';
  try{
    const r=await fetch(`${API_BASE}/api/matches?filter=${filter}`);
    const d=await r.json();
    if(!d.success)throw new Error(d.error||'API error');
    const matches=d.data||[];
    const liveN=d.liveCount||0;
    const sh=document.getElementById('matchSH');
    if(sh){
      sh.innerHTML=liveN>0
        ?`<span style="display:flex;align-items:center;gap:7px"><span class="dlive"></span>${liveN} Match LIVE!</span><small onclick="fetchMatches()">↻ Refresh</small>`
        :`📡 Matches &amp; Scores <small onclick="fetchMatches()">↻ Refresh</small>`;
    }
    if(!matches.length){w.innerHTML='<div class="err"><strong>Abhi koi match nahi</strong>Kal phir dekho!</div>';return;}
    w.innerHTML=matches.map(m=>{
      const d_=m.data||m;
      const t1=(d_.teams||[])[0]||'Team A';
      const t2=(d_.teams||[])[1]||'Team B';
      const sc=d_.score||[];
      const s1=sc.find(s=>s.inning&&s.inning.toLowerCase().includes(t1.substring(0,5).toLowerCase()));
      const s2=sc.find(s=>s.inning&&s.inning.toLowerCase().includes(t2.substring(0,5).toLowerCase()));
      const isLive=d_.matchStarted&&!d_.matchEnded,isDone=d_.matchEnded;
      const cls=isLive?'live':isDone?'done':'upcoming';
      const lbl=isLive?'<span class="dlive"></span>LIVE':isDone?'KHATAM':'🕐 UPCOMING';
      const dt=d_.dateTimeGMT?new Date(d_.dateTimeGMT).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kolkata'})+' IST':'';
      const short=s=>(s&&s.r!=null&&s.w!=null&&s.o!=null)?`${s.r}/${s.w} (${s.o})`:'—';
      return `<div class="mc">
        <div class="mc-status ${cls}">${lbl}&nbsp;&nbsp;<span style="font-weight:400;font-size:9px;color:#2d3f5e;letter-spacing:0">${esc((d_.name||'').replace(/ - Match \\d+/,''))}</span></div>
        <div class="teams-row">
          <div class="tb"><div class="t-name">${esc(t1.length>18?t1.slice(0,18)+'…':t1)}</div><div class="t-score">${s1?short(s1):'—'}</div></div>
          <div class="vs-p">VS</div>
          <div class="tb r"><div class="t-name">${esc(t2.length>18?t2.slice(0,18)+'…':t2)}</div><div class="t-score">${s2?short(s2):'—'}</div></div>
        </div>
        <div class="mc-bottom">
          <span class="mc-venue">📍 ${esc((d_.venue||'TBD').replace(/,.*/,''))} • ${esc(dt)}</span>
          ${d_.status?`<span class="mc-result">${esc(d_.status.length>55?d_.status.slice(0,55)+'…':d_.status)}</span>`:''}
        </div>
      </div>`;
    }).join('');
  }catch(e){
    w.innerHTML=`<div class="err"><strong>Matches load nahi hue</strong>${esc(e.message)}<br><button class="err-retry" onclick="fetchMatches()">↻ Try Again</button></div>`;
  }
}

async function fetchStandings(){
  const tbody=document.querySelector('table.ip tbody');
  if(!tbody)return;
  try{
    const r=await fetch(`${API_BASE}/api/standings`);
    const d=await r.json();
    if(!d.success)return;
    const teams=d.data||[];
    tbody.innerHTML=teams.map((t,i)=>{
      const nrrClass=parseFloat(t.nrr)>0?'pos':parseFloat(t.nrr)<0?'neg':'';
      return `<tr>
        <td class="${i<2?'rk':''}">${i+1}</td>
        <td><span class="tp"><span class="td" style="background:${esc(t.color)}"></span>${esc(t.short)}</span></td>
        <td>${t.m}</td><td>${t.w}</td><td>${t.l}</td>
        <td class="${nrrClass}">${t.nrr}</td>
        <td class="pts">${t.pts}</td>
      </tr>`;
    }).join('');
  }catch(e){/* standings table stays as default */}
}

function refreshAll(){fetchNews();fetchMatches();fetchStandings();}
document.addEventListener('DOMContentLoaded',()=>{
  refreshAll();
  setInterval(()=>fetchMatches(),60000);
  setInterval(()=>fetchNews(),300000);
});
