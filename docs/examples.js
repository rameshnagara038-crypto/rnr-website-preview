const sampleDialog = document.querySelector('#sample-dialog');
document.querySelectorAll('.example-thumb').forEach(link => {
  link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || !sampleDialog.showModal) return;
    event.preventDefault();
    const title = link.dataset.example;
    const photo = document.querySelector('#sample-photo');
    photo.src = link.href;
    photo.alt = 'Illustrative sample of ' + title;
    document.querySelector('#sample-title').textContent = title;
    sampleDialog.querySelector('p').textContent = title === 'Bollaram partition plan' ? 'Bollaram project drawing · 20 November 2026' : 'Illustrative survey output';
    sampleDialog.showModal();
  });
});
sampleDialog.addEventListener('click', event => {
  if (event.target !== sampleDialog) return;
  const box = sampleDialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) sampleDialog.close();
});
