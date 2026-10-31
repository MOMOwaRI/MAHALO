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
          '<div class="cbody"><p class="en">Member</p><h3>' + esc(p.displayName || 'メンバー') + '</h3><p>' + lines.join('<br />') + '</p>' +
          '<div class="comments"><button type="button" class="btn small" data-cbtn="' + d.id + '">コメント・質問を見る</button>' +
          '<div class="clist" data-clist="' + d.id + '" hidden></div>' +
          '<form class="cform" data-cform="' + d.id + '" hidden>' +
          '<input type="text" name="cname" maxlength="30" placeholder="お名前（ニックネーム可）" />' +
          '<textarea name="ctext" maxlength="500" rows="2" placeholder="この方への質問・コメント"></textarea>' +
          '<button type="submit" class="btn small fill">投稿する</button> <span class="cmsg note"></span></form></div></div></div>';
      });
      box.innerHTML = html;
      initComments();
      if (firebase.auth) firebase.auth().onAuthStateChanged(function (u) {
        currentUser = u;
        if (u) {
          markOwnCard(u.uid);
          document.querySelectorAll('[data-cform]').forEach(function (f) {
            if (f.getAttribute('data-cform') === u.uid) { /* 自分の欄はそのまま */ }
          });
        }
      });
    }).catch(function () {});
  }
  /* ---------- メンバーへのコメント・質問 ---------- */
  var currentUser = null;
  function fmtDate(iso) { return (iso || '').slice(0, 10); }
  function loadComments(uid) {
    var list = document.querySelector('[data-clist="' + uid + '"]');
    if (!list) return;
    firebase.firestore().collection('memberComments').where('targetUid', '==', uid).limit(200).get().then(function (s) {
      if (s.empty) { list.innerHTML = '<p class="note">まだコメントがありません。最初の質問をどうぞ。</p>'; return; }
      var docs = [];
      s.forEach(function (d) { docs.push(d); });
      docs.sort(function (a, b) { return String(a.data().createdAt || '').localeCompare(String(b.data().createdAt || '')); });
      var html = '';
      docs.forEach(function (d) {
        var c = d.data();
        var badge = (c.fromUid && c.fromUid === uid) ? ' <span class="tag">本人</span>' : '';
        var del = (currentUser && currentUser.uid === uid) ? ' <button type="button" class="btn small" data-cdel="' + d.id + '" data-cuid="' + uid + '">削除</button>' : '';
        html += '<div class="citem"><p style="margin:0"><strong>' + esc(c.name || 'ゲスト') + '</strong>' + badge + ' <span class="note">' + fmtDate(c.createdAt) + '</span>' + del + '</p><p style="margin:2px 0 0">' + esc(c.text || '') + '</p></div>';
      });
      list.innerHTML = html;
      list.querySelectorAll('[data-cdel]').forEach(function (b) {
        b.addEventListener('click', function () {
          if (!confirm('このコメントを削除しますか？')) return;
          firebase.firestore().collection('memberComments').doc(b.getAttribute('data-cdel')).delete().then(function () { loadComments(uid); });
        });
      });
    }).catch(function () { list.innerHTML = '<p class="note">読み込めませんでした。</p>'; });
  }
  function initComments() {
    document.querySelectorAll('[data-cbtn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var uid = btn.getAttribute('data-cbtn');
        var list = document.querySelector('[data-clist="' + uid + '"]');
        var form = document.querySelector('[data-cform="' + uid + '"]');
        var open = list.hidden;
        list.hidden = !open; form.hidden = !open;
        btn.textContent = open ? 'コメント・質問を閉じる' : 'コメント・質問を見る';
        if (open) loadComments(uid);
      });
    });
    document.querySelectorAll('[data-cform]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var uid = form.getAttribute('data-cform');
        var name = form.cname.value.trim();
        var text = form.ctext.value.trim();
        var msg = form.querySelector('.cmsg');
        if (!name || !text) { msg.textContent = 'お名前とコメントを入れてください。'; return; }
        msg.textContent = '投稿しています…';
        firebase.firestore().collection('memberComments').add({
          targetUid: uid, name: name, text: text,
          fromUid: currentUser ? currentUser.uid : '',
          createdAt: new Date().toISOString()
        }).then(function () {
          form.ctext.value = '';
          msg.textContent = '投稿しました。';
          loadComments(uid);
        }).catch(function () { msg.textContent = '投稿できませんでした。時間をおいて試してください。'; });
      });
    });
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
