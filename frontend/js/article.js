let _newsData=[];
function setNewsData(data){_newsData=data;}
function openArt(i){
  const n=_newsData[i];if(!n)return;
  if(n.source_url&&n.source_url.startsWith('http')){window.open(n.source_url,'_blank','noopener');return;}
  document.getElementById('artImg').src=n.image_url||'';
  document.getElementById('artCat').textContent=n.source_name||'Cricket News';
  document.getElementById('artTtl').textContent=n.title||'';
  document.getElementById('artMeta').textContent=n.pub_date?new Date(n.pub_date).toLocaleString('en-IN'):'';
  document.getElementById('artDesc').textContent=n.description||'Poori khabar padhne ke liye neeche link pe click karo.';
  const btn=document.getElementById('artBtn');
  btn.href=n.source_url||'#';btn.style.display=n.source_url?'inline-flex':'none';
  document.getElementById('artOv').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeArt(){document.getElementById('artOv').classList.remove('open');document.body.style.overflow='';}
