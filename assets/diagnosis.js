/* 髪質診断ロジック（クライアントサイドのみ）
   選択式の回答から、おすすめメニューとホームケア商品をチャット風に提案する。
   提案先はすべて実在の技術・商品（ワード集登録済み）に限定し、価格は出さない。 */
(function(){
  var log = document.getElementById('dlog');
  var form = document.getElementById('dform');
  if(!log || !form) return;
  function add(text, who){
    var d = document.createElement('div'); d.className = 'dmsg ' + who; d.textContent = text; log.appendChild(d);
    log.scrollIntoView({block:'end', behavior:'smooth'}); return d;
  }
  function val(id){ var el = document.getElementById(id); return el ? el.value : ''; }
  var MENU = {
    kirasui:  {name:'煌水（キラ水）トリートメント', why:'煌水（テラヘルツ機能水）を使い、髪の水分バランスを整える方向のケアです。パサつきやツヤ不足が気になる方に。'},
    belle:    {name:'ベル・ジュバンス弱酸性 ヘッドスパ／弱酸性メニュー', why:'弱酸性美容法ベル・ジュバンスのメニューです。頭皮の状態が気になる方、髪と頭皮をいたわりたい方に。'},
    aujua:    {name:'オージュア トリートメント', why:'悩みに合わせてラインを選べるオージュアのトリートメントです。今の髪の状態に合わせた提案ができます。'},
    kaizen:   {name:'髪質改善トリートメント', why:'うねりや広がり、手触りの改善を目指すトリートメントです。'},
    allergy:  {name:'抗アレルギーカラー', why:'カラーの刺激が気になる方のためのカラーです。「アレルギーでカラーを諦めないで」が合言葉です。'},
    koso:     {name:'香草カラー', why:'髪と頭皮への負担に配慮したカラーメニューです。'},
    headspa:  {name:'ヘッドスパ（煌水／ベル・ジュバンス／オージュア）', why:'頭皮のコンディションを整えるヘッドスパです。気分転換にもおすすめです。'}
  };
  var CARE = {
    aujuaHome:{name:'オージュア ホームケアライン', link:'select.html#aujua', why:'お悩みに合わせたラインを、店頭でご相談のうえ選べます。'},
    refa:     {name:'ReFa のドライヤー・アイロン・ブラシ', link:'select.html#refa', why:'毎日のドライとスタイリングの負担を減らす道具です。取り扱い機種は店頭でご確認ください。'},
    lash:     {name:'ラッシュアディクト（まつげ美容液）', link:'select.html#lashaddict', why:'まつげのケアも気になる方に。Eyes MAHALOでも取り扱っています。'}
  };
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var len = val('q-len'), worry = val('q-worry'), color = val('q-color'),
        scalp = val('q-scalp'), care = val('q-care'), finish = val('q-finish'), interest = val('q-interest');
    if(!len || !worry || !color || !scalp || !care || !finish || !interest){
      add('まだ答えていない質問があります。上から順に、全部の質問に答えてみてください。', 'bot'); return;
    }
    var worryLabel = document.querySelector('#q-worry option:checked').textContent;
    add('診断しますね。一番気になるのは「' + worryLabel + '」ですね。', 'bot');
    var menus = [], cares = [], reasons = [];
    if (worry === 'dry' || worry === 'shine') { menus.push(MENU.kirasui); menus.push(MENU.aujua); cares.push(CARE.aujuaHome); reasons.push('乾燥・ツヤの悩みには、水分バランスを整える煌水と、悩み別に選べるオージュアの組み合わせが合います。'); }
    if (worry === 'wave') { menus.push(MENU.kaizen); menus.push(MENU.kirasui); cares.push(CARE.refa); reasons.push('うねり・広がりには、髪質改善トリートメントで手触りを整えて、仕上げの道具も見直すのがおすすめです。'); }
    if (worry === 'damage') { menus.push(MENU.aujua); menus.push(MENU.kirasui); cares.push(CARE.aujuaHome); cares.push(CARE.refa); reasons.push('ダメージが気になる時は、補修寄りのケアと、熱の負担を減らす道具の両方から整えます。'); }
    if (worry === 'gray') { menus.push(color === 'often' ? MENU.allergy : MENU.koso); reasons.push('白髪のカラーは、頻度と頭皮の状態に合わせて選ぶのが大事です。'); }
    if (scalp !== 'normal' || worry === 'scalp') { menus.push(MENU.belle); menus.push(MENU.headspa); reasons.push('頭皮の状態が気になる場合は、弱酸性のベル・ジュバンスとヘッドスパで、頭皮から整える方向がおすすめです。'); }
    if (interest === 'kirasui' && menus.indexOf(MENU.kirasui) === -1) menus.unshift(MENU.kirasui);
    if (interest === 'belle' && menus.indexOf(MENU.belle) === -1) menus.unshift(MENU.belle);
    if (interest === 'aujua' && menus.indexOf(MENU.aujua) === -1) menus.unshift(MENU.aujua);
    if (interest === 'lash') cares.push(CARE.lash);
    if (finish === 'hari' && cares.indexOf(CARE.refa) === -1 && menus.indexOf(MENU.kaizen) === -1) menus.push(MENU.kaizen);
    if (!menus.length) { menus.push(MENU.kirasui); menus.push(MENU.headspa); reasons.push('まずは髪と頭皮の土台を整えるメニューからが、おすすめです。'); }
    if (!cares.length) cares.push(CARE.aujuaHome);
    // 重複除去（先頭3件まで）
    menus = menus.filter(function(m,i){ return menus.indexOf(m) === i; }).slice(0,3);
    cares = cares.filter(function(c,i){ return cares.indexOf(c) === i; }).slice(0,3);
    setTimeout(function(){
      add(reasons.join('\n'), 'bot');
      var html = 'あなたへの提案です。\n\n■ おすすめメニュー\n' + menus.map(function(m){ return '★ ' + m.name + '\n　' + m.why; }).join('\n') +
        '\n\n■ ホームケアのおすすめ\n' + cares.map(function(c){ return '★ ' + c.name + '\n　' + c.why; }).join('\n') +
        '\n\n商品の価格は店頭でご確認ください。メニューの詳しい内容は、お店で今の髪の状態を見てから一緒に決めましょう。';
      var d = add(html, 'result');
      cares.forEach(function(c){
        var a = document.createElement('a'); a.className = 'oc-link'; a.href = c.link; a.textContent = 'セレクト商品で見る：' + c.name;
        d.appendChild(document.createElement('br')); d.appendChild(a);
      });
      var save = document.createElement('div');
      save.style.marginTop = '12px'; save.style.fontSize = '.85rem';
      d.appendChild(save);
      // ログイン中なら、結果をFirestore（mahaloMembers/{uid}/diagnoses）へ保存する
      var payload = {
        answers: {len: len, worry: worry, color: color, scalp: scalp, care: care, finish: finish, interest: interest},
        worryLabel: worryLabel,
        menus: menus.map(function(m){ return m.name; }),
        cares: cares.map(function(c){ return c.name; }),
        reasons: reasons.join('\n')
      };
      window.__lastDiagnosis = payload;
      function saveNote(t){ save.textContent = t; }
      try{
        if(window.firebase && firebase.auth && firebase.firestore){
          var u = firebase.auth().currentUser;
          if(u){
            saveNote('マイページへ保存しています…');
            firebase.firestore().collection('mahaloMembers').doc(u.uid).collection('diagnoses')
              .add(Object.assign({}, payload, {createdAt: firebase.firestore.FieldValue.serverTimestamp()}))
              .then(function(){ saveNote('この診断結果を、マイページに保存しました。前回の診断との違いも、マイページで見られます。'); })
              .catch(function(){ saveNote('保存できませんでした。時間をおいて、もう一度診断してみてください。'); });
            var mp = document.createElement('a'); mp.className = 'oc-link'; mp.href = 'mypage.html'; mp.textContent = 'マイページで結果を見る';
            save.appendChild(document.createElement('br')); save.appendChild(mp);
          } else {
            saveNote('この診断結果は、会員登録（無料）してログインすると、マイページに自動で保存されます。前回の診断との違いも見られるようになります。');
            var b = document.createElement('a'); b.className = 'oc-link'; b.href = 'mypage.html'; b.textContent = '無料メンバー登録／ログイン';
            save.appendChild(document.createElement('br')); save.appendChild(b);
          }
        } else {
          saveNote('この診断結果は、会員登録（無料）してログインすると、マイページに自動で保存されます。');
        }
      }catch(e){ saveNote('この診断結果は、会員登録（無料）してログインすると、マイページに自動で保存されます。'); }
    }, 500);
  });
})();
