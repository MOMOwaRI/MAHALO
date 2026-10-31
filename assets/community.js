/* MAHALOコミュニティ：公開プロフィールと公開投稿をFirestoreから読み込んで表示する。 */
(function () {
  function esc(t) { return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function ensure() {
    if (!window.firebase || !firebase.firestore) return false;
    try {
      if (!firebase.apps.length) firebase.initializeApp({
        apiKey: 'AIzaSyAdq6e71I-1XsBHOsMc4Q_djsHlecqQKcQ',
        authDomain: 'mahalo-12007.firebaseapp.com',
        projectId: 'mahalo-12007',
        storageBucket: 'mahalo-12007.firebasestorage.app',
        messagingSenderId: '882306860348',
        appId: '1:882306860348:web:c540fd2f313206cab6ca39'
      });
    } catch (e) {}
    return true;
  }
  function markOwnCard(uid) {
    if (!uid) return;
    var card = document.querySelector('[data-uid="' + uid + '"]');
    if (!card || card.querySelector('.own-edit')) return;
    var cbody = card.querySelector('.cbody');
    if (!cbody) return;
    var a = document.createElement('p');
    a.className = 'own-edit';
    a.style.marginTop = '10px';
    a.innerHTML = '<a class="btn small" href="mypage.html">✎ 自分のプロフィールを編集する（マイページ）</a>';
    cbody.appendChild(a);
  }
  function renderProfiles() {
    var box = document.getElementById('member-cards');
    if (!box || !ensure()) return;
    firebase.firestore().collection('memberProfiles').orderBy('updatedAt', 'desc').limit(30).get().then(function (s) {
      if (s.empty) return;
      var html = '';
      s.forEach(function (d) {
        var p = d.data();
        var lines = [];
        if (p.job) lines.push('業種：' + esc(p.job));
        if (p.skill) lines.push('得意：' + esc(p.skill));
        if (p.hobby) lines.push('趣味：' + esc(p.hobby));
        if (p.intro) lines.push(esc(p.intro));
        html += '<div class="card" data-uid="' + d.id + '">' +
          (p.icon ? '<img src="' + p.icon + '" alt="' + esc(p.displayName || 'メンバー') + '" />' : '<img src="assets/img/building-front.jpg" alt="" />') +
          '<div class="cbody"><p class="en">Member</p><h3>' + esc(p.displayName || 'メンバー') + '</h3><p>' + lines.join('<br />') + '</p></div></div>';
      });
      box.innerHTML = html;
      if (firebase.auth) firebase.auth().onAuthStateChanged(function (u) { if (u) markOwnCard(u.uid); });
    }).catch(function () {});
  }
  function renderPosts() {
    var box = document.getElementById('posts-feed');
    if (!box || !ensure()) return;
    firebase.firestore().collection('memberPosts').orderBy('createdAt', 'desc').limit(20).get().then(function (s) {
      if (s.empty) { box.innerHTML = '<div class="empty-box">まだ公開の投稿がありません。最初の投稿をお待ちしています。</div>'; return; }
      var html = '';
      s.forEach(function (d) {
        var p = d.data();
        html += '<div class="card">' +
          (p.photo ? '<img src="' + p.photo + '" alt="投稿写真" />' : '<img src="assets/img/salon-main.jpg" alt="" />') +
          '<div class="cbody"><p class="en">' + (p.isHair ? 'Hair Style' : 'Post') + '</p><h3>' + esc(p.displayName || 'メンバー') + '</h3><p>' + esc(p.text || '') + '</p><p class="note">' + esc((p.createdAt || '').slice(0, 10)) + '</p></div></div>';
      });
      box.innerHTML = html;
    }).catch(function () {
      box.innerHTML = '<div class="empty-box">読み込めませんでした。時間をおいて開いてください。</div>';
    });
  }
  function init() { renderProfiles(); renderPosts(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
