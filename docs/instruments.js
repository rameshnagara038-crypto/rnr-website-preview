const field = document.querySelector('.instrument-section');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let scheduled = false;
function updateInstruments() {
  scheduled = false;
  const bounds = field.getBoundingClientRect();
  const progress = motion.matches ? 1 : Math.min(1, Math.max(0, (innerHeight - bounds.top) / (innerHeight + bounds.height)));
  field.style.setProperty('--signal-scale', String(.65 + progress * .7));
  field.style.setProperty('--scope-angle', (progress * 22 - 16) + 'deg');
  field.style.setProperty('--dash', String(-progress * 100));
  field.style.setProperty('--fix-scale', String(.45 + progress));
}
function queueUpdate() {
  if (!scheduled) { scheduled = true; requestAnimationFrame(updateInstruments); }
}
window.addEventListener('scroll', queueUpdate, {passive:true});
window.addEventListener('resize', queueUpdate);
motion.addEventListener('change', queueUpdate);
updateInstruments();
