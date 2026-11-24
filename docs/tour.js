const tour = document.querySelector('.survey-tour');
const stage = tour.querySelector('.tour-stage');
const world = tour.querySelector('.tour-world');
const buttons = [...tour.querySelectorAll('button')];
const title = document.querySelector('#tour-title');
const copy = document.querySelector('#tour-copy');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const scenes = [
  ['Surveying starts here.', 'From our Hyderabad office to the field. Scroll to follow the survey team.', .17],
  ['Locate the boundary.', 'A DGPS rover records field points along the parcel boundary.', .55],
  ['Set out the columns.', 'The Total Station transfers column centres from the drawing to the slab.', .80],
  ['Map from above.', 'A mapping drone surveys the quarry for terrain models and volume measurements.', .91]
];
let selected = -1, manual = 0, frame = 0;
function distance(){return Math.max(1,tour.offsetHeight-stage.offsetHeight)}
function paint(){
 frame=0;
 const p=motionPreference.matches?manual:Math.min(1,Math.max(0,-tour.getBoundingClientRect().top/distance()));
 const pos=p*3, left=Math.floor(pos), next=Math.min(3,left+1), frac=pos-left;
 const smooth=frac*frac*(3-2*frac);
 const center=scenes[left][2]+(scenes[next][2]-scenes[left][2])*smooth;
 const width=world.offsetWidth, view=stage.clientWidth;
 const offset=Math.max(0,Math.min(width-view,center*width-view*.55));
 world.style.transform='translate3d('+(-offset)+'px,0,0)';
 const index=Math.round(pos);
 if(index!==selected){title.textContent=scenes[index][0];copy.textContent=motionPreference.matches&&index===0?'From our Hyderabad office to the field. Choose a scene to explore.':scenes[index][1];buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));selected=index}
 document.querySelector('#dgps-fix').style.opacity=String(Math.max(0,1-Math.abs(pos-1))*.95);
 document.querySelector('#station-ray').style.opacity=String(Math.max(0,1-Math.abs(pos-2)));
 const drone=document.querySelector('#aircraft');
 drone.style.opacity=String(Math.min(1,Math.max(0,(pos-1.85)*1.8)));
 drone.setAttribute('transform','translate('+(535+135*(pos-2))+','+(61-23*(pos-2))+')');
}
function refresh(){if(!frame)frame=requestAnimationFrame(paint)}
buttons.forEach((button,i)=>button.addEventListener('click',()=>{
 manual=i/3;
 if(motionPreference.matches){paint();return}
 window.scrollTo({top:scrollY+tour.getBoundingClientRect().top+manual*distance(),behavior:'instant'});
 refresh();
}));
motionPreference.addEventListener('change',()=>{selected=-1;refresh()});
window.addEventListener('scroll',refresh,{passive:true});new ResizeObserver(refresh).observe(stage);paint();
