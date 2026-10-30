/* MAHALO マイページ本体ロジック
   土台は OHANA と同じ Firebase プロジェクト（ohana-share）。
   データは mahaloMembers/{uid} 配下に保存し、本人のログインでのみ読み書きする。
   実データが無い場合は空表示＋「見本データで見る」切替（見本は画面に明記）。
   Firebase が読み込めない環境（プレビュー等）では、見本表示で描画する。 */
(function(){
  var SAMPLE = {
    karte: [
      {date:'2026-10-03', shop:'hair ID salon MAHALO（2F）', menu:'カット＋オージュア トリートメント', staff:'担当スタッフ', memo:'毛先の乾燥が進んでいたので、補修寄りのラインでケアしました。'},
      {date:'2026-08-22', shop:'hair ID salon MAHALO（2F）', menu:'香草カラー＋ヘッドスパ', staff:'担当スタッフ', memo:'色味は落ち着いたブラウンに。頭皮はベル・ジュバンスでケア。'}
    ],
    diagnoses: [
      {worryLabel:'乾燥・パサつき', answers:{len:'long', worry:'dry', color:'sometimes', scalp:'dry', care:'treatment', finish:'moist', interest:'aujua'},
       menus:['煌水（キラ水）トリートメント','オージュア トリートメント'], cares:['オージュア ホームケアライン'], reasons:'乾燥・ツヤの悩みには、水分バランスを整える煌水と、悩み別に選べるオージュアの組み合わせが合います。', date:'2026-10-03'},
      {worryLabel:'うねり・広がり', answers:{len:'long', worry:'wave', color:'sometimes', scalp:'normal', care:'shampoo', finish:'light', interest:'none'},
       menus:['髪質改善トリートメント'], cares:['ReFa のドライヤー・アイロン・ブラシ'], reasons:'うねり・広がりには、髪質改善トリートメントで手触りを整えるのがおすすめです。', date:'2026-08-22'}
    ],
    scores: [
      {moisture:3, shine:3, hari:2, damage:2, scalp:3, comment:'まずは水分補給を中心に整えていきましょう。', date:'2026-08-22'},
      {moisture:4, shine:4, hari:3, damage:3, scalp:4, comment:'ツヤが出てきました。ホームケアを続けてみてください。', date:'2026-10-03'}
    ],
    proposal: {menu:'次回は、煌水（キラ水）トリートメント＋オージュアでのケアがおすすめです。', care:'ホームケアは、オージュアのラインを店頭で一緒に選びましょう。'},
    photos: [
      {url:'assets/img/salon-film1.jpg', caption:'施術の様子（見本の写真です）', kind:'施術'},
      {url:'assets/img/salon-film4.jpg', caption:'仕上がり（見本の写真です）', kind:'ビフォーアフター'}
    ],
    followups: [
      {from:'customer', text:'1週間たちましたが、まとまりが続いています。', date:'2026-10-10'},
      {from:'staff', text:'よかったです。乾かす前に、毛先だけオイルを足してみてください。', date:'2026-10-10'}
    ]
  };
  var LABELS = {
    len:{short:'ショート', medium:'ミディアム', long:'ロング'},
    worry:{dry:'乾燥・パサつき', wave:'うねり・広がり', damage:'カラーやパーマのダメージ', gray:'白髪', scalp:'頭皮のベタつき・かゆみ', shine:'ツヤがない'},
    color:{none:'していない', sometimes:'2〜3か月に1回くらい', often:'毎月くらい'},
    scalp:{normal:'特に気にならない', dry:'乾燥しがち', oily:'ベタつきがち', sensitive:'敏感・刺激が気になる'},
    care:{shampoo:'シャンプーが中心', treatment:'トリートメントも使う', oil:'オイルやミルクも使う'},
    finish:{moist:'しっとり', light:'さらさら軽く', hari:'ハリ・コシがほしい', gloss:'ツヤ重視'},
    interest:{kirasui:'煌水（キラ水）', belle:'弱酸性（ベル・ジュバンス）', aujua:'オージュア', lash:'まつげも気になる', none:'特になし・おまかせ'}
  };
  var QNAMES = {len:'髪の長さ', worry:'一番気になること', color:'カラーやパーマの頻度', scalp:'頭皮の状態', care:'普段のお手入れ', finish:'なりたい仕上がり', interest:'気になるもの'};
  var ITEMS = [
    {key:'moisture', name:'うるおい', color:'#3390CC'},
    {key:'shine', name:'ツヤ', color:'#c9a227'},
    {key:'hari', name:'ハリ・コシ', color:'#4d8a4f'},
    {key:'damage', name:'ダメージ', color:'#c0392b'},
    {key:'scalp', name:'頭皮', color:'#7b4ba8'}
  ];
  function $(id){ return document.getElementById(id); }
  function esc(t){ return String(t == null ? '' : t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fmtDate(v){
    if(!v) return '';
    if(typeof v === 'string') return v;
    if(v.toDate) { var d = v.toDate(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
    return '';
  }
  var state = {user:null, sample:false, data:null};

  /* ---------- 描画 ---------- */
  function renderScores(scores){
    var box = $('score-area'); if(!box) return;
    if(!scores || !scores.length){ box.innerHTML = '<div class="empty-box">まだ成績表がありません。ご来店のときに、スタッフが髪の状態を記録します。</div>'; return; }
    var latest = scores[scores.length - 1], prev = scores.length > 1 ? scores[scores.length - 2] : null;
    var html = '<div class="score-grid">';
    ITEMS.forEach(function(it){
      var v = latest[it.key] || 0;
      var diff = '';
      if(prev){
        var d = v - (prev[it.key] || 0);
        if(d > 0) diff = '<span class="si-diff up">▲ 前回より +' + d + '</span>';
        else if(d < 0) diff = '<span class="si-diff down">▼ 前回より ' + d + '</span>';
        else diff = '<span class="si-diff same">― 前回と同じ</span>';
      }
      html += '<div class="score-item"><div class="si-name">' + it.name + '</div><div class="si-num">' + v + '<small> / 5</small></div>' + diff + '<div class="score-bar"><i style="width:' + (v * 20) + '%"></i></div></div>';
    });
    html += '</div>';
    html += '<p class="note" style="margin-top:8px">※ スコアは5が一番良い状態です。ダメージは、数値が高いほどダメージが少ない状態を表します。</p>';
    if(scores.length > 1){
      var W = 640, H = 190, PL = 26, PR = 10, PT = 12, PB = 22;
      var iw = W - PL - PR, ih = H - PT - PB;
      var pts = function(key){
        return scores.map(function(s, i){
          var x = PL + (scores.length === 1 ? iw / 2 : iw * i / (scores.length - 1));
          var y = PT + ih * (1 - ((s[key] || 1) - 1) / 4);
          return x.toFixed(1) + ',' + y.toFixed(1);
        }).join(' ');
      };
      var grid = '';
      for(var g = 1; g <= 5; g++){ var gy = PT + ih * (1 - (g - 1) / 4); grid += '<line x1="' + PL + '" y1="' + gy + '" x2="' + (W - PR) + '" y2="' + gy + '" stroke="#e6e0d4" stroke-width="1"/><text x="4" y="' + (gy + 4) + '" font-size="10" fill="#7a756c">' + g + '</text>'; }
      var lines = ITEMS.map(function(it){ return '<polyline points="' + pts(it.key) + '" fill="none" stroke="' + it.color + '" stroke-width="2"/>'; }).join('');
      var xlabels = scores.map(function(s, i){
        var x = PL + (scores.length === 1 ? iw / 2 : iw * i / (scores.length - 1));
        var anchor = i === 0 ? 'start' : (i === scores.length - 1 ? 'end' : 'middle');
        return '<text x="' + x + '" y="' + (H - 6) + '" font-size="10" fill="#7a756c" text-anchor="' + anchor + '">' + esc(fmtDate(s.date || s.createdAt).slice(5)) + '</text>';
      }).join('');
      var legend = ITEMS.map(function(it){ return '<span style="color:' + it.color + '">●</span> ' + it.name; }).join('　');
      html += '<div class="chart-box"><p class="en">Score History</p><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="成績表の推移グラフ">' + grid + lines + xlabels + '</svg><p class="note">' + legend + '</p></div>';
    }
    if(latest.comment) html += '<div class="staff-comment"><p class="en">Staff Comment</p>' + esc(latest.comment) + '</div>';
    html += '<div class="share-row"><button type="button" class="btn small" id="share-score">成績表をシェアする</button></div>';
    box.innerHTML = html;
    var sb = $('share-score');
    if(sb) sb.addEventListener('click', function(){ shareText(scoreText(latest, prev)); });
  }
  function scoreText(latest, prev){
    var lines = ITEMS.map(function(it){ return it.name + '：' + (latest[it.key] || 0) + '/5'; });
    return 'わたしの髪の成績表（hair ID salon MAHALO）\n' + lines.join('\n') + (latest.comment ? '\nスタッフより：' + latest.comment : '');
  }
  function renderKarte(list){
    var box = $('karte-list'); if(!box) return;
    if(!list || !list.length){ box.innerHTML = '<div class="empty-box">まだ来店の記録がありません。ご来店後に、スタッフがこちらへ記録します。</div>'; return; }
    box.innerHTML = '<div class="timeline">' + list.map(function(k){
      return '<div class="tl-item"><div class="tl-date">' + esc(fmtDate(k.date || k.createdAt)) + '　' + esc(k.shop || '') + '</div><h3>' + esc(k.menu || '') + '</h3><p>' + (k.staff ? '担当：' + esc(k.staff) + '<br />' : '') + esc(k.memo || '') + '</p></div>';
    }).join('') + '</div>';
  }
  function renderDiag(list){
    var box = $('diag-area'); if(!box) return;
    if(!list || !list.length){ box.innerHTML = '<div class="empty-box">まだ診断結果が保存されていません。<a href="diagnosis.html">髪質診断</a>を受けると、結果がここに保存されます。</div>'; return; }
    var latest = list[0], prev = list.length > 1 ? list[1] : null;
    var html = '<div class="tl-item" style="margin-top:14px"><div class="tl-date">' + esc(fmtDate(latest.date || latest.createdAt)) + '</div><h3>一番気になること：' + esc(latest.worryLabel || '') + '</h3>' +
      '<p>おすすめメニュー：' + esc((latest.menus || []).join('／')) + '<br />ホームケア：' + esc((latest.cares || []).join('／')) + '</p></div>';
    if(prev && latest.answers && prev.answers){
      var diffs = [];
      Object.keys(QNAMES).forEach(function(k){
        var a = latest.answers[k], b = prev.answers[k];
        if(a !== b) diffs.push(QNAMES[k] + '：' + ((LABELS[k] || {})[b] || b || '―') + ' → ' + ((LABELS[k] || {})[a] || a || '―'));
      });
      html += '<div class="diag-compare"><strong>前回の診断との違い</strong><br />' + (diffs.length ? diffs.map(esc).join('<br />') : '前回と答えは同じでした。') + '</div>';
    }
    box.innerHTML = html;
  }
  function renderProposal(p, latestDiag){
    var box = $('proposal-area'); if(!box) return;
    var menu = (p && p.menu) || (latestDiag ? (latestDiag.menus || []).join('／') : '');
    var care = (p && p.care) || (latestDiag ? (latestDiag.cares || []).join('／') : '');
    if(!menu && !care){ box.innerHTML = '<div class="empty-box">まだ提案がありません。診断やご来店のあとに、スタッフと診断結果から提案が入ります。</div>'; return; }
    box.innerHTML = '<table class="info">' +
      (menu ? '<tr><th>次回のおすすめメニュー</th><td>' + esc(menu) + '</td></tr>' : '') +
      (care ? '<tr><th>ホームケアのおすすめ</th><td>' + esc(care) + '</td></tr>' : '') + '</table>' +
      '<p style="margin-top:14px"><a class="btn small" href="select.html">セレクト商品のページで見る</a></p>';
  }
  function renderPhotos(list){
    var box = $('photo-area'); if(!box) return;
    if(!list || !list.length){ box.innerHTML = '<div class="empty-box">まだ写真がありません。施術の写真は、スタッフが記録したものだけが、ここに表示されます。</div>'; return; }
    box.innerHTML = '<div class="photo-grid">' + list.map(function(p){
      return '<figure><img src="' + esc(p.url) + '" alt="' + esc(p.caption || '施術写真') + '" loading="lazy" /><figcaption>' + esc(p.kind || '') + (p.kind ? '｜' : '') + esc(p.caption || '') + '</figcaption></figure>';
    }).join('') + '</div><div class="share-row"><button type="button" class="btn small" id="share-photo">写真をシェアする</button></div>';
    var sb = $('share-photo');
    if(sb) sb.addEventListener('click', function(){ shareText('hair ID salon MAHALOで施術しました。'); });
  }
  function renderThread(list){
    var box = $('thread'); if(!box) return;
    if(!list || !list.length){ box.innerHTML = '<div class="empty-box">まだ投稿がありません。来店後の髪の様子を、写真とコメントで送ってください。スタッフが時系列で追って、アドバイスを返します。</div>'; return; }
    box.innerHTML = list.map(function(p){
      var who = p.from === 'staff' ? 'staff' : 'me';
      var name = p.from === 'staff' ? 'スタッフからのアドバイス' : 'わたしの投稿';
      return '<div class="post ' + who + '"><div class="pmeta">' + name + '　' + esc(fmtDate(p.date || p.createdAt)) + '</div>' + esc(p.text || '') + (p.photoUrl ? '<img src="' + esc(p.photoUrl) + '" alt="その後の様子の写真" loading="lazy" />' : '') + '</div>';
    }).join('');
  }
  function renderAll(data){
    renderScores(data.scores || []);
    renderKarte(data.karte || []);
    renderDiag(data.diagnoses || []);
    renderProposal(data.proposal || null, (data.diagnoses || [])[0] || null);
    renderPhotos(data.photos || []);
    renderThread(data.followups || []);
  }
  function shareText(text){
    if(navigator.share){ navigator.share({text: text}).catch(function(){}); return; }
    if(navigator.clipboard){ navigator.clipboard.writeText(text).then(function(){ alert('シェア用の文をコピーしました。'); }, function(){ alert('コピーできませんでした。'); }); return; }
    alert(text);
  }

  /* ---------- データ取得（Firestore） ---------- */
  function db(){ return firebase.firestore(); }
  function snapList(snap){ var out = []; snap.forEach(function(d){ out.push(d.data()); }); return out; }
  function loadAll(uid){
    var base = db().collection('mahaloMembers').doc(uid);
    var jobs = [
      base.collection('karte').get().then(function(s){ return snapList(s); }).catch(function(){ return []; }),
      base.collection('diagnoses').orderBy('createdAt', 'desc').limit(10).get().then(function(s){ return snapList(s); }).catch(function(){ return []; }),
      base.collection('scores').orderBy('createdAt', 'asc').limit(12).get().then(function(s){ return snapList(s); }).catch(function(){ return []; }),
      base.collection('photos').orderBy('createdAt', 'desc').limit(20).get().then(function(s){ return snapList(s); }).catch(function(){ return []; }),
      base.collection('followups').orderBy('createdAt', 'asc').limit(50).get().then(function(s){ return snapList(s); }).catch(function(){ return []; }),
      base.collection('proposals').doc('current').get().then(function(d){ return d.exists ? d.data() : null; }).catch(function(){ return null; })
    ];
    Promise.all(jobs).then(function(r){
      state.data = {karte: r[0], diagnoses: r[1], scores: r[2], photos: r[3], followups: r[4], proposal: r[5]};
      renderAll(state.data);
    });
  }

  /* ---------- その後の様子：送信 ---------- */
  function compressPhoto(file, done){
    var reader = new FileReader();
    reader.onload = function(){
      var img = new Image();
      img.onload = function(){
        var scale = Math.min(1, 900 / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        done(c.toDataURL('image/jpeg', 0.78));
      };
      img.onerror = function(){ done(null); };
      img.src = reader.result;
    };
    reader.onerror = function(){ done(null); };
    reader.readAsDataURL(file);
  }
  function initForm(){
    var form = $('follow-form'); if(!form) return;
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var msg = $('follow-msg');
      var text = $('follow-text').value.trim();
      if(!text){ msg.textContent = 'コメントを入力してください。'; return; }
      if(state.sample){ msg.textContent = '見本表示では送信できません。ログインすると、自分の記録として送れます。'; return; }
      if(!state.user){ msg.textContent = 'ログインしてから送ってください。'; return; }
      var fileEl = $('follow-photo');
      var file = fileEl && fileEl.files && fileEl.files[0];
      function post(photoUrl){
        db().collection('mahaloMembers').doc(state.user.uid).collection('followups')
          .add({text: text, photoUrl: photoUrl || null, from: 'customer', createdAt: firebase.firestore.FieldValue.serverTimestamp()})
          .then(function(){
            msg.textContent = '送りました。スタッフからのアドバイスをお待ちください。';
            $('follow-text').value = ''; if(fileEl) fileEl.value = '';
            loadAll(state.user.uid);
          })
          .catch(function(){ msg.textContent = '送信できませんでした。時間をおいて試してください。'; });
      }
      if(file) compressPhoto(file, post); else post(null);
    });
  }

  /* ---------- 認証まわり ---------- */
  function showGate(){ var g = $('mypage-gate'), a = $('mypage-app'); if(g) g.style.display = ''; if(a) a.style.display = 'none'; }
  function showApp(){ var g = $('mypage-gate'), a = $('mypage-app'); if(g) g.style.display = 'none'; if(a) a.style.display = ''; }
  function enterSample(){
    state.sample = true; state.data = SAMPLE;
    showApp();
    var b = $('sample-banner'); if(b) b.style.display = '';
    var nm = $('member-name'); if(nm) nm.textContent = '見本のお客様';
    var lo = $('logout-btn'); if(lo) lo.style.display = 'none';
    renderAll(SAMPLE);
  }
  function init(){
    initForm();
    var sb = $('sample-btn'); if(sb) sb.addEventListener('click', enterSample);
    var gb = $('sample-btn-gate'); if(gb) gb.addEventListener('click', enterSample);
    function loginMsg(txt){ var m = $('login-msg'); if(m){ m.textContent = txt; m.style.display = txt ? '' : 'none'; } }
    function doLogin(){
      if(!window.firebase || !firebase.auth){ loginMsg('読み込みが終わっていません。少し待ってからもう一度押してください。'); return; }
      try{ if(!firebase.apps.length) initFb(); }catch(e){}
      loginMsg('');
      var provider = new firebase.auth.GoogleAuthProvider();
      var ua = navigator.userAgent || '';
      var useRedirect = /iPhone|iPad|iPod|Android/.test(ua);
      if(useRedirect){
        firebase.auth().signInWithRedirect(provider).catch(function(){ loginMsg('ログイン画面を開けませんでした。通信環境をご確認のうえ、もう一度お試しください。'); });
      }else{
        firebase.auth().signInWithPopup(provider).catch(function(err){
          if(err && (err.code === 'auth/popup-blocked' || err.code === 'auth/operation-not-supported-in-this-environment' || err.code === 'auth/cancelled-popup-request')){
            firebase.auth().signInWithRedirect(provider);
          }else if(err && err.code !== 'auth/popup-closed-by-user'){
            loginMsg('ログインできませんでした。もう一度お試しください。');
          }
        });
      }
    }
    window.__mahaloLogin = doLogin;
    var loginBtn = $('google-login');
    if(loginBtn) loginBtn.addEventListener('click', doLogin);
    var lo = $('logout-btn');
    if(lo) lo.addEventListener('click', function(){ if(window.firebase && firebase.auth) firebase.auth().signOut().then(function(){ location.reload(); }); });
    if(!window.firebase || !firebase.auth){ enterSample(); return; }
    function initFb(){ firebase.initializeApp({
      apiKey: "AIzaSyAdq6e71I-1XsBHOsMc4Q_djsHlecqQKcQ",
      authDomain: "mahalo-12007.firebaseapp.com",
      projectId: "mahalo-12007",
      storageBucket: "mahalo-12007.firebasestorage.app",
      messagingSenderId: "882306860348",
      appId: "1:882306860348:web:c540fd2f313206cab6ca39"
    }); }
    try{ if(!firebase.apps.length) initFb(); }catch(e){}
    try{ firebase.auth().getRedirectResult().catch(function(){ loginMsg('ログインが完了しませんでした。もう一度お試しください。'); }); }catch(e){}
    if(location.hash === '#login'){ var gl = $('mypage-gate'); if(gl) setTimeout(function(){ gl.scrollIntoView({behavior:'smooth', block:'start'}); }, 300); }
    firebase.auth().onAuthStateChanged(function(u){
      if(!u){ showGate(); return; }
      state.user = u; state.sample = false;
      showApp();
      var b = $('sample-banner'); if(b) b.style.display = 'none';
      var nm = $('member-name'); if(nm) nm.textContent = u.displayName ? (u.displayName + ' さん') : 'メンバーさん';
      var lo2 = $('logout-btn'); if(lo2) lo2.style.display = '';
      try{ localStorage.setItem('ohana_member', '1'); }catch(e){}
      loadAll(u.uid);
    }, function(){ showGate(); });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
