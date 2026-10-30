/* OHANA LP (github-site/index.html) の認証ボタンを移植し、色をMAHALOブルーに変更。ログインは OHANA と同じFirebaseプロジェクト ohana-share を共用。ログイン中の一般会員は、このサイトの mypage.html へ。 */
(function(){
  var LOGIN_URL = 'https://momowari.github.io/OHANA-share/login.html';
  var DOC = '';
  var OWNER = 'ELCzyeeoDCU4gveavc077L4jBqE3';
  function memberKnown(){ try{ return !!localStorage.getItem('ohana_member'); }catch(e){ return false; } }
  function memberLabel(){ return memberKnown() ? 'ログイン' : '無料メンバー登録'; }
  function init(){
    if(!window.firebase || !firebase.auth) return;
    try{ if(!firebase.apps.length) firebase.initializeApp({
  apiKey: "AIzaSyCao64N8dfQoXBmsMHIDpLpQwQyXp-2iw0",
  authDomain: "ohana-share.firebaseapp.com",
  projectId: "ohana-share",
  storageBucket: "ohana-share.firebasestorage.app",
  messagingSenderId: "825904150210",
  appId: "1:825904150210:web:4ae90f047ac8cc761cad5b"
}); }catch(e){}
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '無料メンバー登録';
    btn.style.cssText = 'background:#fff;color:#1d4e89;border:2px solid #2b5ea7;font-weight:bold;font-family:inherit;font-size:.85rem;border-radius:999px;padding:8px 16px;cursor:pointer;box-shadow:0 4px 12px rgba(120,70,10,.18)';
    var wrapEl = document.querySelector('.wrap') || document.body;
    var rowEl = document.createElement('div');
    rowEl.style.cssText = 'position:fixed;top:10px;right:max(10px, calc(50% - 350px));z-index:96';
    rowEl.appendChild(btn);
    window.__authBtn = btn;
    var hdr = wrapEl.querySelector('header');
    if(hdr && hdr.parentNode === wrapEl) wrapEl.insertBefore(rowEl, hdr.nextSibling);
    else wrapEl.insertBefore(rowEl, wrapEl.firstChild);
    btn.addEventListener('click', function(){
      var u = firebase.auth().currentUser;
      if(!u){ location.href = memberKnown() ? LOGIN_URL + '#login' : LOGIN_URL; }
      else if(u.uid === OWNER && window.__toggleSiteEdit){ window.__toggleSiteEdit(); }
      else if(u.uid === OWNER && DOC){ location.href = 'member.html?id=' + DOC + '&edit=1'; }
      else location.href = 'mypage.html';
    });
    firebase.auth().onAuthStateChanged(function(u){
      if(!u){ btn.textContent = memberLabel(); return; }
      btn.textContent = (u.uid === OWNER) ? (document.body.classList.contains('site-editing') ? '編集を終わる' : '✎ 編集する') : 'マイページ';
      try{ localStorage.setItem('ohana_member', '1'); }catch(e){}
      if(u.uid === OWNER && DOC){
        var pv = document.querySelector('.hero-pv');
        if(pv){
          pv.style.cursor = 'pointer';
          var tag = document.createElement('div');
          tag.textContent = '✎ アニメーションを編集';
          tag.style.cssText = 'position:absolute;top:10px;right:10px;z-index:6;background:rgba(255,255,255,.94);border:1px solid #d8c7ae;border-radius:999px;padding:5px 11px;font-weight:bold;font-size:.78rem;color:#7a4b12';
          pv.appendChild(tag);
          pv.addEventListener('click', function(){ location.href = 'member.html?id=' + DOC + '&edit=1&cm=1'; });
        }
      }
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
