/* OHANA LP (github-site/index.html) の認証ボタンを移植し、色をMAHALOブルーに変更。会員登録はMAHALO専用（会員データは mahaloMembers に分離）。ログイン中の一般会員は、このサイトの mypage.html へ。 */
(function(){
  var LOGIN_URL = 'mypage.html';
  var DOC = '';
  var OWNER = 'ELCzyeeoDCU4gveavc077L4jBqE3';
  var OWNER_EMAIL = 'zakka.lea@gmail.com';
  function isOwner(u){ return !!u && (u.uid === OWNER || u.email === OWNER_EMAIL); }
  var STAFF_EMAILS = ['mahalo1455@gmail.com'];
  function isEditor(u){ return isOwner(u) || (!!u && STAFF_EMAILS.indexOf(u.email) >= 0); }
  function memberKnown(){ try{ return !!localStorage.getItem('ohana_member'); }catch(e){ return false; } }
  function memberLabel(){ return memberKnown() ? 'ログイン' : '無料メンバー登録'; }
  function init(){
    if(!window.firebase || !firebase.auth) return;
    try{ if(!firebase.apps.length) firebase.initializeApp({
  apiKey: "AIzaSyAdq6e71I-1XsBHOsMc4Q_djsHlecqQKcQ",
  authDomain: "mahalo-12007.firebaseapp.com",
  projectId: "mahalo-12007",
  storageBucket: "mahalo-12007.firebasestorage.app",
  messagingSenderId: "882306860348",
  appId: "1:882306860348:web:c540fd2f313206cab6ca39"
}); }catch(e){}
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = '無料メンバー登録';
    btn.style.cssText = 'background:#fff;color:#0068B7;border:2px solid #3390CC;font-weight:bold;font-family:inherit;font-size:.85rem;border-radius:999px;padding:8px 16px;cursor:pointer;box-shadow:0 4px 12px rgba(120,70,10,.18)';
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
      if(!u){
        if(/mypage\.html$/.test(location.pathname)){
          if(window.__mahaloLogin){ window.__mahaloLogin(); }
          else { var gl = document.getElementById('google-login'); if(gl){ gl.scrollIntoView({behavior:'smooth', block:'center'}); gl.click(); } }
        }
        else location.href = memberKnown() ? LOGIN_URL + '#login' : LOGIN_URL;
      }
      else if(isEditor(u) && window.__toggleSiteEdit){ window.__toggleSiteEdit(); }
      else if(isOwner(u) && DOC){ location.href = 'member.html?id=' + DOC + '&edit=1'; }
      else location.href = 'mypage.html';
    });
    firebase.auth().onAuthStateChanged(function(u){
      if(!u){ btn.textContent = memberLabel(); return; }
      btn.textContent = (isEditor(u)) ? (document.body.classList.contains('site-editing') ? '編集を終わる' : '✎ 編集する') : 'マイページ';
      try{ localStorage.setItem('ohana_member', '1'); }catch(e){}
      if(isOwner(u) && DOC){
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
