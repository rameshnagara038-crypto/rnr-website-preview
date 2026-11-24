(() => {
  const frame = document.querySelector('#subscriber-frame');
  const interval = 5 * 60 * 1000;
  let lastRefresh = Date.now();
  let inView = false;
  function refresh() {
    if (!inView || document.hidden || Date.now() - lastRefresh < interval || document.activeElement === frame) return;
    frame.src = 'subscribers.html';
    lastRefresh = Date.now();
  }
  new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; refresh(); }).observe(frame);
  document.addEventListener('visibilitychange', refresh);
  setInterval(refresh, interval);
})();
