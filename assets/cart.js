/* MAHALOセレクト商品のカゴと注文（LINE誘導＋フォーム）。価格は店頭確認のため、合計金額は出さず「商品と個数」を送る形。 */
(function () {
  var LINE_ID = '%40mahalo.hair';
  var PRODUCTS = [
    { id: 'nanosuppli-ga', name: 'ナノサプリ クレンジングシャンプー GA（グリーンアップル）1000ml' },
    { id: 'arimino-moist', name: 'アリミノ カラーストーリー モイスト シャンプー 250mL' },
    { id: 'lashaddict', name: 'ラッシュアディクト（まつげ美容液）' },
    { id: 'refa', name: 'ReFa（リファ）商品 ※機種は備考にご記入ください' },
    { id: 'aujua', name: 'オージュア ホームケア ※ラインは備考にご記入ください' }
  ];
  var cart = {};
  try { cart = JSON.parse(localStorage.getItem('mahalo_cart') || '{}'); } catch (e) { cart = {}; }
  function save() { try { localStorage.setItem('mahalo_cart', JSON.stringify(cart)); } catch (e) {} }
  function count() { return Object.keys(cart).reduce(function (s, k) { return s + cart[k]; }, 0); }
  function nameOf(id) { var p = PRODUCTS.filter(function (x) { return x.id === id; })[0]; return p ? p.name : id; }
  function itemsText() {
    return Object.keys(cart).map(function (k) { return '・' + nameOf(k) + ' ×' + cart[k]; }).join('\n');
  }
  // 商品カードに「カゴに入れる」ボタンを付ける
  PRODUCTS.forEach(function (p) {
    var card = document.getElementById(p.id);
    if (!card) return;
    var body = card.querySelector('.cbody') || card;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn fill';
    btn.style.marginTop = '10px';
    btn.textContent = 'カゴに入れる';
    btn.addEventListener('click', function () {
      cart[p.id] = (cart[p.id] || 0) + 1;
      save(); render();
      btn.textContent = 'カゴに入れました ✓';
      setTimeout(function () { btn.textContent = 'カゴに入れる'; }, 1200);
    });
    body.appendChild(btn);
  });
  // カゴバー
  var bar = document.createElement('div');
  bar.id = 'cart-bar';
  bar.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:14px;z-index:110;display:none;background:#0068B7;color:#fff;border-radius:999px;padding:10px 18px;box-shadow:0 10px 30px rgba(30,40,60,.3);font-size:.9rem;align-items:center;gap:12px;max-width:92vw';
  bar.innerHTML = '<span id="cart-count"></span><button type="button" id="cart-open" style="background:#fff;color:#0068B7;border:none;border-radius:999px;padding:7px 14px;font-weight:bold;font-family:inherit;cursor:pointer">注文する</button>';
  document.body.appendChild(bar);
  // パネル
  var panel = document.createElement('div');
  panel.id = 'cart-panel';
  panel.style.cssText = 'position:fixed;inset:0;z-index:130;background:rgba(30,30,30,.45);display:none;align-items:flex-end;justify-content:center';
  panel.innerHTML =
    '<div style="background:#fff;width:min(720px,100%);max-height:88vh;overflow:auto;border-radius:16px 16px 0 0;padding:20px 18px 26px">' +
    '<h3 style="margin:0 0 8px">カゴの中身</h3>' +
    '<div id="cart-items" style="font-size:.92rem;line-height:1.9"></div>' +
    '<p class="note">価格は店頭の現行価格です。お店から確認の連絡をします。</p>' +
    '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">' +
    '<button type="button" id="cart-line" class="btn fill">LINEで注文する</button>' +
    '<button type="button" id="cart-form-open" class="btn">フォームで注文する</button>' +
    '<button type="button" id="cart-close" class="btn">閉じる</button></div>' +
    '<form id="cart-form" style="display:none;margin-top:16px">' +
    '<label>お名前<input required name="name" maxlength="50" style="width:100%;padding:9px;border:1.5px solid #ccc;border-radius:8px;margin:4px 0 10px" /></label>' +
    '<label>連絡先（電話かメール）<input required name="contact" maxlength="100" style="width:100%;padding:9px;border:1.5px solid #ccc;border-radius:8px;margin:4px 0 10px" /></label>' +
    '<label>受け取り方法<select name="method" style="width:100%;padding:9px;border:1.5px solid #ccc;border-radius:8px;margin:4px 0 10px"><option value="店頭受け取り">店頭受け取り（来店時に支払い）</option><option value="発送希望">発送希望（送料＋振込先を個別に案内）</option></select></label>' +
    '<label>住所（発送希望の方のみ）<input name="address" maxlength="200" style="width:100%;padding:9px;border:1.5px solid #ccc;border-radius:8px;margin:4px 0 10px" /></label>' +
    '<label>備考<textarea name="note" maxlength="500" rows="3" style="width:100%;padding:9px;border:1.5px solid #ccc;border-radius:8px;margin:4px 0 10px"></textarea></label>' +
    '<button type="submit" class="btn fill">この内容で注文する</button>' +
    '<p id="cart-form-msg" class="note" style="margin-top:8px"></p></form>' +
    '</div>';
  document.body.appendChild(panel);
  function render() {
    var n = count();
    bar.style.display = n ? 'inline-flex' : 'none';
    document.getElementById('cart-count').textContent = 'カゴ：' + n + '点';
    var box = document.getElementById('cart-items');
    if (!n) { box.innerHTML = 'カゴは空です。'; return; }
    box.innerHTML = Object.keys(cart).map(function (k) {
      return '<div>' + nameOf(k) + ' ×' + cart[k] +
        ' <button type="button" data-dec="' + k + '" style="margin-left:8px">－</button>' +
        ' <button type="button" data-inc="' + k + '">＋</button>' +
        ' <button type="button" data-del="' + k + '">削除</button></div>';
    }).join('');
    box.querySelectorAll('button').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-inc') || b.getAttribute('data-dec') || b.getAttribute('data-del');
        if (b.hasAttribute('data-inc')) cart[id]++;
        else if (b.hasAttribute('data-dec')) { cart[id]--; if (cart[id] <= 0) delete cart[id]; }
        else delete cart[id];
        save(); render();
      });
    });
  }
  document.getElementById('cart-open').addEventListener('click', function () { panel.style.display = 'flex'; render(); });
  document.getElementById('cart-close').addEventListener('click', function () { panel.style.display = 'none'; });
  panel.addEventListener('click', function (e) { if (e.target === panel) panel.style.display = 'none'; });
  document.getElementById('cart-line').addEventListener('click', function () {
    if (!count()) return;
    var text = 'MAHALOセレクト商品の注文です。\n' + itemsText() + '\n受け取り方法とお名前を、このまま続けて送ってください。';
    location.href = 'https://line.me/R/oaMessage/' + LINE_ID + '/?' + encodeURIComponent(text);
  });
  document.getElementById('cart-form-open').addEventListener('click', function () {
    document.getElementById('cart-form').style.display = 'block';
  });
  document.getElementById('cart-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, msg = document.getElementById('cart-form-msg');
    if (!count()) { msg.textContent = 'カゴが空です。'; return; }
    msg.textContent = '送信しています…';
    var data = {
      items: itemsText(),
      name: f.name.value.trim(),
      contact: f.contact.value.trim(),
      method: f.method.value,
      address: f.address.value.trim(),
      note: f.note.value.trim(),
      ts: new Date().toISOString()
    };
    function fail() { msg.textContent = '送信できませんでした。お手数ですが、LINEで注文をお願いします。'; }
    try {
      if (!window.firebase || !firebase.firestore) { fail(); return; }
      if (!firebase.apps.length) {
        firebase.initializeApp({
          apiKey: 'AIzaSyAdq6e71I-1XsBHOsMc4Q_djsHlecqQKcQ',
          authDomain: 'mahalo-12007.firebaseapp.com',
          projectId: 'mahalo-12007',
          storageBucket: 'mahalo-12007.firebasestorage.app',
          messagingSenderId: '882306860348',
          appId: '1:882306860348:web:c540fd2f313206cab6ca39'
        });
      }
      firebase.firestore().collection('orders').add(data).then(function () {
        msg.textContent = '注文を受け付けました。お店から確認の連絡をします。店頭受け取りの方は、連絡のあとにご来店ください。';
        cart = {}; save(); render();
      }).catch(fail);
    } catch (err) { fail(); }
  });
  render();
})();
