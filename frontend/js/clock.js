const DAYS=['Ravivar','Somvar','Mangalvar','Budhvar','Guruvar','Shukravar','Shanivar'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
const istFmt=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
const istDateFmt=new Intl.DateTimeFormat('en-IN',{timeZone:'Asia/Kolkata',weekday:'long',day:'numeric',month:'long',year:'numeric'});
function tick(){
  const n=new Date();
  const parts=istFmt.formatToParts(n);
  const h=parts.find(p=>p.type==='hour')?.value||'00';
  const m=parts.find(p=>p.type==='minute')?.value||'00';
  const s=parts.find(p=>p.type==='second')?.value||'00';
  const el=document.getElementById('clock');
  if(el) el.textContent=`${h}:${m}:${s}`;
  const del=document.getElementById('cdate');
  if(del){
    const dp=istDateFmt.formatToParts(n);
    const wd=dp.find(p=>p.type==='weekday')?.value||'';
    const day=dp.find(p=>p.type==='day')?.value||'';
    const mon=dp.find(p=>p.type==='month')?.value||'';
    const yr=dp.find(p=>p.type==='year')?.value||'';
    del.textContent=`${wd}, ${day} ${mon} ${yr}`;
  }
}
setInterval(tick,1000);tick();
