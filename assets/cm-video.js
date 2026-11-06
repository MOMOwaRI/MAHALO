/* CM動画：画面に入ったら読み込んで再生、外れたら停止。タップで再生／停止 */
(function () {
  var vids = [].slice.call(document.querySelectorAll('video.cmvideo'));
  if (!vids.length) return;
  function ensure(v) { if (!v.getAttribute('src') && v.dataset.src) v.src = v.dataset.src; }
  vids.forEach(function (v) {
    v.addEventListener('click', function () {
      if (v.paused) { ensure(v); var p = v.play(); if (p) p.catch(function () {}); }
      else v.pause();
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) { ensure(v); var p = v.play(); if (p) p.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.35 });
    vids.forEach(function (v) { io.observe(v); });
  }
})();
