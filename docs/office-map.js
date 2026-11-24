const details = document.querySelector('.office-details');
const officeMap = document.querySelector('#office-map');
details.addEventListener('click', () => {
  const open = details.getAttribute('aria-expanded') !== 'true';
  details.setAttribute('aria-expanded', String(open));
  officeMap.src = open ? details.dataset.office : details.dataset.area;
  details.textContent = open ? 'Close address details' : 'Prestige Rai Towers · Opp. NIMS';
});
