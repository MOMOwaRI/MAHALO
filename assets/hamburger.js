/* ハンバーガーメニュー（OHANA-share と同じ形）：開閉・外側タップで閉じる・Escで閉じる */
(function () {
  var btn = document.getElementById('hmenu-btn');
  var panel = document.getElementById('hmenu-panel');
  if (!btn || !panel) return;
  function setPanel(open) {
    if (open) {
      panel.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.add('open'); }); });
    } else {
      panel.classList.remove('open');
      panel.hidden = true;
    }
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  function toggle() { setPanel(panel.hidden); }
  btn.addEventListener('click', function (ev) { ev.stopPropagation(); toggle(); });
  btn.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); toggle(); } });
  document.addEventListener('click', function (ev) {
    if (!panel.hidden && !panel.contains(ev.target) && ev.target !== btn) setPanel(false);
  });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && !panel.hidden) setPanel(false); });
  panel.addEventListener('click', function (ev) { if (ev.target.tagName === 'A') setPanel(false); });
})();
