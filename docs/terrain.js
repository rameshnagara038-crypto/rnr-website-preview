const canvas = document.querySelector('#terrain');
const ctx = canvas.getContext('2d');
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
let mode = 'Elevation', pending = false;
function height(x,y) {
  const crest = 0.14 + 0.32*Math.sin(x*2.8) - x*0.22;
  const folds = Math.sin(9*x+4*y)*0.18 + Math.cos(14*x-9*y)*0.11 + Math.sin(29*x+12*y)*0.04;
  return Math.exp(-2.9*x*x-4.8*(y-crest)**2)*(0.76+folds) +
    0.46*Math.exp(-11*(x-.62)**2-6*(y+.45)**2) +
    0.18*Math.exp(-7*(x+.72)**2-8*(y+.52)**2);
}
function render() {
 pending=false;
 const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.min(devicePixelRatio||1,2);
 if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d)}
 ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);
 const scale=Math.min(w*.39,h*.69),lift=reduce.matches?0:Math.min(scrollY,550)*.036;
 const project=(x,y,z)=>[w*.51+(x*.95-y*.7)*scale,h*.64+(x*.35+y*.49-z*1.18)*scale-lift];
 const n=w<520?106:150;
 for(let j=0;j<n;j++){
   const y=j/(n-1)*2-1;
   for(let i=0;i<n;i++){
    const x=i/(n-1)*2-1,z=height(x,y),[a,b]=project(x,y,z);
    const slope=(height(x+.012,y)-z)*18;
    const light=Math.min(1,Math.max(.05,.31+z*.72-slope*.55));
    const level=z*27, line=mode==='Contours' && Math.abs(level-Math.round(level))<.18;
    const alpha=mode==='Contours'?(line?.98:.14):.55+light*.45;
    ctx.fillStyle='rgba('+Math.round(37+light*155)+','+Math.round(70+light*173)+','+Math.round(33+light*88)+','+alpha+')';
    const size=(line?1.7:1.05+light*.48)*Math.min(1.1,Math.max(.77,w/720));
    ctx.fillRect(a,b,size,size);
   }
 }
}
function schedule(){if(!pending){pending=true;requestAnimationFrame(render)}}
document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{
 mode=btn.dataset.mode;document.querySelectorAll('[data-mode]').forEach(el=>el.setAttribute('aria-pressed',String(el===btn)));schedule();
}));
new ResizeObserver(schedule).observe(canvas);window.addEventListener('scroll',()=>{if(scrollY<650&&!reduce.matches)schedule()},{passive:true});render();
