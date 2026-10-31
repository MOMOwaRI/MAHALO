/* MAHALO紹介動画：グリッド／リールのタップでモーダル再生（拡大表示） */
(function () {
  var overlay, media, titleEl, descEl, bodyEl;
  function open(id) {
    var card = document.querySelector('.vcard[data-v="' + id + '"]');
    if (!card) return;
    var img = card.querySelector('.vthumb img');
    media.innerHTML = img ? '<img src="' + img.getAttribute('src') + '" alt="' + (img.getAttribute('alt') || '') + '" />' : '';
    titleEl.textContent = (card.querySelector('h3') || {}).textContent || '';
    var ps = card.querySelectorAll('.vmeta p');
    descEl.textContent = ps.length ? ps[ps.length - 1].textContent : '';
    var more = card.querySelector('.vmore');
    bodyEl.innerHTML = more ? more.innerHTML : '';
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    overlay.hidden = true;
    media.innerHTML = '';
    document.body.style.overflow = '';
  }
  function init() {
    overlay = document.getElementById('vm-overlay');
    if (!overlay) return;
    media = document.getElementById('vm-media');
    titleEl = document.getElementById('vm-title');
    descEl = document.getElementById('vm-desc');
    bodyEl = document.getElementById('vm-body');
    document.querySelectorAll('.vcard').forEach(function (c) {
      c.addEventListener('click', function () { open(c.getAttribute('data-v')); });
      c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(c.getAttribute('data-v')); } });
    });
    document.querySelectorAll('.reel').forEach(function (r) {
      r.addEventListener('click', function () { open(r.getAttribute('data-open')); });
    });
    document.getElementById('vm-close').addEventListener('click', close);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !overlay.hidden) close(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
