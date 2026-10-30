/* OHANA LP のその場編集（Firestore siteTexts）を移植。PAGE は各ページの window.__mahaloPageKey で切替。 */
(function(){
  var PAGE = window.__mahaloPageKey || 'mahalo-top';
  var OWNER = 'ELCzyeeoDCU4gveavc077L4jBqE3';
  var editing = false;
  var applied = {};
  var linkList = [];
  var pendingLinks = {};
  function $(id){ return document.getElementById(id); }
  function esc(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function hash(t){ var h = 0; for(var i = 0; i < t.length; i++){ h = (h * 31 + t.charCodeAt(i)) | 0; } return 'k' + (h >>> 0).toString(36); }
  function ensureApp(){ try{ if(window.firebase && !firebase.apps.length){ firebase.initializeApp({
  apiKey: "AIzaSyAdq6e71I-1XsBHOsMc4Q_djsHlecqQKcQ",
  authDomain: "mahalo-12007.firebaseapp.com",
  projectId: "mahalo-12007",
  storageBucket: "mahalo-12007.firebasestorage.app",
  messagingSenderId: "882306860348",
  appId: "1:882306860348:web:c540fd2f313206cab6ca39"
}); } }catch(e){} }
  function db(){ return firebase.firestore(); }
  function pureText(el){ for(var i = 0; i < el.childNodes.length; i++){ if(el.childNodes[i].nodeType === 1) return false; } return (el.textContent || '').trim().length > 0; }
  function excluded(el){ return !!el.closest('.film,.ofabs,.opanel,.sns,.tags,#live-sec,#site-savebar,.ied-panel,script,style,textarea,select,.authbar-row,.member-grid'); }
  function targets(){
    var out = [];
    document.querySelectorAll('.wrap *').forEach(function(el){
      if(el.tagName === 'A') return;
      if(el.closest('a')) return;
      if(!pureText(el)) return;
      if(excluded(el)) return;
      out.push(el);
    });
    return out;
  }
  function stampLinks(){
    linkList = [];
    document.querySelectorAll('.wrap a[href]').forEach(function(a){
      if(a.closest('.ofabs,.opanel,.ied-panel,.tags,#site-savebar')) return;
      a.setAttribute('data-lk', String(linkList.length));
      linkList.push({el: a, text: a.textContent.trim(), href: a.getAttribute('href'), html: a.innerHTML});
    });
  }
  function applyLink(i, v){
    var L = linkList[i];
    if(!L || !v) return;
    if(typeof v.t === 'string') L.el.textContent = v.t;
    if(typeof v.h === 'string') L.el.setAttribute('href', v.h);
  }
  function openLinkPanel(a){
    var old = $('link-panel');
    if(old) old.remove();
    var i = parseInt(a.getAttribute('data-lk'), 10);
    var L = linkList[i];
    if(!L) return;
    var cur = pendingLinks[i] || {t: a.textContent.trim(), h: a.getAttribute('href')};
    var panel = document.createElement('div');
    panel.className = 'ied-panel';
    panel.id = 'link-panel';
    panel.innerHTML = '<h3>リンクの編集</h3>' +
      '<label>表示する文字<textarea id="lp-text" rows="2">' + esc(cur.t) + '</textarea></label>' +
      '<label>リンク先（URL）<input type="text" id="lp-href" value="' + esc(cur.h) + '"></label>' +
      '<p style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap"><button type="button" id="lp-save" style="font-family:inherit;font-weight:bold;background:#e07b24;color:#fff;border:none;border-radius:999px;padding:7px 16px;cursor:pointer">このリンクを保存</button><button type="button" id="lp-undo" style="font-family:inherit;font-weight:bold;background:#fff;color:#8a6a4f;border:1.5px solid #d8c7ae;border-radius:999px;padding:7px 16px;cursor:pointer">元に戻す</button><button type="button" id="lp-close" style="font-family:inherit;font-weight:bold;background:#fff;color:#8a6a4f;border:1.5px solid #d8c7ae;border-radius:999px;padding:7px 16px;cursor:pointer">閉じる</button><span id="lp-msg" style="font-size:.85rem;color:#8a6a4f"></span></p>';
    a.parentNode.insertBefore(panel, a.nextSibling);
    function upd(){
      pendingLinks[i] = {t: $('lp-text').value, h: $('lp-href').value};
      a.textContent = $('lp-text').value;
    }
    $('lp-text').addEventListener('input', upd);
    $('lp-href').addEventListener('input', upd);
    $('lp-close').addEventListener('click', function(){ panel.remove(); });
    $('lp-save').addEventListener('click', function(){
      var upd2 = {};
      upd2['lnk' + i] = JSON.stringify({t: $('lp-text').value, h: $('lp-href').value});
      db().collection('siteTexts').doc(PAGE).set(upd2, {merge: true}).then(function(){
        applied['lnk' + i] = upd2['lnk' + i];
        delete pendingLinks[i];
        $('lp-msg').textContent = '保存しました';
      }).catch(function(){ $('lp-msg').textContent = '保存できませんでした'; });
    });
    $('lp-undo').addEventListener('click', function(){
      delete pendingLinks[i];
      var saved = applied['lnk' + i];
      if(saved){ try{ applyLink(i, JSON.parse(saved)); }catch(e){} }
      else { a.innerHTML = L.html; a.setAttribute('href', L.href); }
      panel.remove();
    });
  }
  function setEdit(on){
    editing = on;
    document.body.classList.toggle('site-editing', on);
    var bar = $('site-savebar');
    if(bar) bar.classList.toggle('on', on);
    if($('sb-msg')) $('sb-msg').textContent = '';
    var btn = window.__authBtn;
    if(btn) btn.textContent = on ? '編集を終わる' : '✎ 編集する';
    targets().forEach(function(el){ el.contentEditable = on ? 'true' : 'false'; });
    if(on) pendingLinks = {};
    if(!on){ var lp = $('link-panel'); if(lp) lp.remove(); }
  }
  function undoEdit(){
    targets().forEach(function(el){ var k = el.getAttribute('data-tk'); if(k && applied[k] !== undefined) el.textContent = applied[k]; });
    linkList.forEach(function(L, i){
      var saved = applied['lnk' + i];
      if(saved){ try{ applyLink(i, JSON.parse(saved)); }catch(e){} }
      else { L.el.innerHTML = L.html; L.el.setAttribute('href', L.href); }
    });
    pendingLinks = {};
    var lp = $('link-panel'); if(lp) lp.remove();
    if($('sb-msg')) $('sb-msg').textContent = '元に戻しました';
  }
  function saveAll(){
    $('sb-msg').textContent = '保存しています…';
    var upd = {};
    targets().forEach(function(el){
      var k = el.getAttribute('data-tk');
      if(!k) return;
      var v = el.textContent.trim();
      if(applied[k] !== undefined && applied[k] !== v) upd[k] = v;
      else if(applied[k] === undefined && v) upd[k] = v;
    });
    Object.keys(pendingLinks).forEach(function(i){ upd['lnk' + i] = JSON.stringify(pendingLinks[i]); });
    var job = Object.keys(upd).length ? db().collection('siteTexts').doc(PAGE).set(upd, {merge: true}).then(function(){ Object.keys(upd).forEach(function(k){ applied[k] = upd[k]; }); }) : Promise.resolve();
    job.then(function(){
      $('sb-msg').textContent = '保存しました';
      setTimeout(function(){ setEdit(false); }, 500);
    }).catch(function(){ $('sb-msg').textContent = '保存できませんでした。時間をおいて試してください。'; });
  }
  document.addEventListener('click', function(ev){
    if(!editing) return;
    var a = ev.target.closest ? ev.target.closest('a[href]') : null;
    if(a && a.hasAttribute('data-lk')){ ev.preventDefault(); openLinkPanel(a); }
  }, true);
  function init(){
    if(!window.firebase || !firebase.auth) return;
    ensureApp();
    var els = targets();
    els.forEach(function(el){ el.setAttribute('data-tk', hash(el.textContent.trim())); applied[el.getAttribute('data-tk')] = el.textContent.trim(); });
    stampLinks();
    if(firebase.firestore){
      db().collection('siteTexts').doc(PAGE).get().then(function(doc){
        if(!doc.exists) return;
        var data = doc.data() || {};
        els.forEach(function(el){ var v = data[el.getAttribute('data-tk')]; if(typeof v === 'string'){ el.textContent = v; applied[el.getAttribute('data-tk')] = v; } });
        els.forEach(function(el){ var k = el.getAttribute('data-tk'); if(applied[k] === undefined) applied[k] = el.textContent.trim(); });
        linkList.forEach(function(L, i){
          var v = data['lnk' + i];
          if(typeof v === 'string'){ applied['lnk' + i] = v; try{ applyLink(i, JSON.parse(v)); }catch(e){} }
        });
      }).catch(function(){});
    }
    var bar = document.createElement('div');
    bar.id = 'site-savebar';
    bar.innerHTML = '<span id="sb-msg"></span><button type="button" id="sb-save">保存する</button><button type="button" id="sb-cancel">キャンセル</button>';
    document.body.appendChild(bar);
    $('sb-save').addEventListener('click', saveAll);
    $('sb-cancel').addEventListener('click', function(){ if(confirm('保存していない変更を、元に戻しますか？')){ undoEdit(); setEdit(false); } });
    window.__toggleSiteEdit = function(){ setEdit(!editing); };
    window.__isSiteEditing = function(){ return editing; };
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
