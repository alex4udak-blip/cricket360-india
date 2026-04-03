const DAYS=['Ravivar','Somvar','Mangalvar','Budhvar','Guruvar','Shukravar','Shanivar'];
const MONTHS=['January','February','March','April','May','June','July','August','September','October','November','December'];
function tick(){
  const n=new Date(),ist=new Date(n.getTime()+n.getTimezoneOffset()*60000+5.5*3600000);
  const el=document.getElementById('clock');
  if(el) el.textContent=[ist.getHours(),ist.getMinutes(),ist.getSeconds()].map(x=>String(x).padStart(2,'0')).join(':');
  const del=document.getElementById('cdate');
  if(del) del.textContent=`${DAYS[ist.getDay()]}, ${ist.getDate()} ${MONTHS[ist.getMonth()]} ${ist.getFullYear()}`;
}
setInterval(tick,1000);tick();
