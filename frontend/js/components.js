function getCurrentPage(){
  const path=window.location.pathname.split('/').pop()||'index.html';
  return path;
}

function loadHeader(){
  const el=document.getElementById('header');
  if(!el)return;
  const page=getCurrentPage();
  const navLinks=[
    {href:'index.html',label:'Home'},
    {href:'ipl.html',label:'IPL 2026'},
    {href:'team-india.html',label:'Team India'},
    {href:'t20wc.html',label:'T20 WC'},
    {href:'schedule.html',label:'International'},
    {href:'rankings.html',label:'Rankings'},
    {href:'stats.html',label:'Stats'},
    {href:'fantasy.html',label:'Fantasy'},
  ];
  el.innerHTML=`<header class="hdr">
  <div class="hdr-top">
    <div>
      <a href="index.html" class="logo" style="text-decoration:none"><span class="a">क्रिकेट</span><span class="b">360</span><span class="c">•IN</span></a>
      <div class="logo-sub">India ka No.1 Cricket Portal</div>
    </div>
    <div class="clock-box">
      <div class="clock" id="clock">--:--:--</div>
      <div class="clock-date" id="cdate"></div>
      <div class="clock-zone">IST • India Standard Time</div>
    </div>
  </div>
  <nav>${navLinks.map(l=>`<a href="${l.href}" class="${page===l.href||(page===''&&l.href==='index.html')?'active':''}">${l.label}</a>`).join('')}</nav>
</header>`;
}

function loadTicker(){
  const el=document.getElementById('ticker');
  if(!el)return;
  el.innerHTML=`<div class="ticker">
  <div class="ticker-badge">🔴 LIVE</div>
  <div class="ticker-scroll">
    🏏 IPL 2026 Season 19 — 74 matches, 10 teams &nbsp;|&nbsp;
    🏆 INDIA — T20 WORLD CHAMPIONS 2026! Sri Lanka ko 47 runs se haraaya &nbsp;|&nbsp;
    ⭐ Suryakumar Yadav — T20 WC Player of Tournament &nbsp;|&nbsp;
    🔥 RCB — IPL 2025 Champions, 2026 season ka jaandar aaghaaz &nbsp;|&nbsp;
    📅 Afghanistan tour of India — June 2026 &nbsp;|&nbsp;
    🌟 Border-Gavaskar Trophy — India vs Australia — Jan 2027
  </div>
</div>`;
}

function loadStatusBar(){
  const el=document.getElementById('statusbar');
  if(!el)return;
  el.innerHTML=`<div class="statusbar">
  <span><span class="live-dot"></span>Matches auto-refresh: har <strong>60 sec</strong> &nbsp;|&nbsp; News refresh: har <strong>5 min</strong></span>
  <button class="rbtn" onclick="refreshAll()">↻ Abhi Refresh Karo</button>
</div>`;
}

function loadFooter(){
  const el=document.getElementById('footer');
  if(!el)return;
  el.innerHTML=`<footer>
  <div class="fl"><span class="a">क्रिकेट</span><span class="b">360</span><span class="c">•IN</span></div>
  <p>India ka No.1 Cricket News Portal &nbsp;•&nbsp; IPL 2026 &nbsp;•&nbsp; T20 World Cup &nbsp;•&nbsp; Sabse Pehle, Sabse Sahi</p>
</footer>`;
}

function loadArticleOverlay(){
  const el=document.getElementById('articleOverlay');
  if(!el)return;
  el.innerHTML=`<div class="art-ov" id="artOv" onclick="if(event.target===this)closeArt()">
  <div class="art-box">
    <button class="art-close" onclick="closeArt()">✕</button>
    <img id="artImg" src="" alt="" onerror="this.style.display='none'">
    <div class="art-body">
      <div class="art-cat" id="artCat"></div>
      <div class="art-ttl" id="artTtl"></div>
      <div class="art-meta" id="artMeta"></div>
      <div class="art-desc" id="artDesc"></div>
      <a id="artBtn" href="#" target="_blank" rel="noopener" class="art-btn">Poori Article Padho &nbsp;→</a>
    </div>
  </div>
</div>`;
}

document.addEventListener('DOMContentLoaded',()=>{
  loadHeader();
  loadTicker();
  loadStatusBar();
  loadFooter();
  loadArticleOverlay();
});
