/* 商品カードの写真スライド：自動で切り替え、タップで停止／再開。画面に見えているものだけ動かす */
(function () {
  var sliders = [].slice.call(document.querySelectorAll('.pslider'));
  if (!sliders.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  sliders.forEach(function (sl) {
    sl.__paused = !!reduce;
    sl.__visible = false;
    sl.addEventListener('click', function () {
      if (reduce) { advance(sl); return; }
      sl.__paused = !sl.__paused;
    });
  });
  function advance(sl) {
    var slides = sl.querySelectorAll('.pslide');
    var dots = sl.querySelectorAll('.pdots span');
    var cur = 0;
    slides.forEach(function (s, i) { if (s.classList.contains('on')) cur = i; });
    var nx = (cur + 1) % slides.length;
    slides[cur].classList.remove('on');
    slides[nx].classList.add('on');
    if (dots.length) { dots[cur].classList.remove('on'); dots[nx].classList.add('on'); }
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { e.target.__visible = e.isIntersecting; });
    }, { threshold: 0.25 });
    sliders.forEach(function (sl) { io.observe(sl); });
  } else {
    sliders.forEach(function (sl) { sl.__visible = true; });
  }
  if (!reduce) {
    setInterval(function () {
      sliders.forEach(function (sl) { if (sl.__visible && !sl.__paused) advance(sl); });
    }, 4500);
  }
})();
