/* MAHALO 新規ページ群 チャットbot（OHANA実装のキーワード式botを移植し、知識をMAHALO版に差し替え）
   自由入力は Gemini（window.__aiAsk / bot-ai.js）を優先し、失敗時はこのキーワード式にフォールバック。
   チップは即答。1日20回の上限管理と botLogs 記録は bot-ai.js 側。 */
(function(){
function logChat(topic, kind){ if (window.gtag){ gtag('event', 'chat_question', {topic: topic, kind: kind, site: 'mahalo-pages'}); } }
var QA = [
{ q:"営業時間・定休日は？", chip:"営業時間・定休日", a:"hair ID salon MAHALO（2階）は、受付9:00〜18:00、定休日は月曜です。elua Mahalo（1階・女性限定）は完全予約制で、水〜金10:00〜17:00、土日祝9:00〜18:00、定休日は月・火です。Eyes MAHALO（1階・まつげパーマ）は、対応時間7:30〜19:30（月〜土）で、日・祝は要相談です。" },
{ q:"場所と駐車場は？", chip:"場所・駐車場", a:"松山市味酒町3-2-29、MAHALOビルです。古町駅から徒歩約3分、駐車場は3台あります。2階が hair ID salon MAHALO、1階に elua Mahalo・Eyes MAHALO・Lea Mahalo があります。" },
{ q:"セレクト商品って何？", chip:"セレクト商品って？", a:"MAHALOセレクト商品は、お店で取り扱っている商品をまとめたページです。ラッシュアディクト、ReFa、オージュアなどがあります。商品の価格は店頭でご確認ください。このサイトの「セレクト商品」ページで一覧が見られます。" },
{ q:"髪質診断って何？", chip:"髪質診断って？", a:"髪質診断は、いくつかの質問に答えると、あなたに合ったおすすめメニューとホームケアを提案するページです。このサイトの「髪質診断」からどうぞ。結果は、会員登録するとマイページに保存できるようになります（準備中）。" },
{ q:"キラ水って何？", chip:"キラ水って何？", a:"煌水（キラ水）は、テラヘルツ機能水です。MAHALOの施術やヘッドスパで使っています。Eyes MAHALOでは、遠赤外線のキラ水とアイマスクを使う施術をしていて、温める施術ではありません。" },
{ q:"予約のしかたは？", chip:"予約のしかた", a:"ご予約は、各店舗のページや店舗のLINEからが確実です。Eyes MAHALOの予約・空き確認は公式LINE（https://lin.ee/q8vBvt1）が一番早くて確実です。空き状況はここでは分からないので、直接ご確認ください。" },
{ q:"料金の目安は？", chip:"料金の目安", a:"Eyes MAHALOは、遠赤外線まつげパーマ4,000円、根元メニュー3,000円です。美容室のメニュー料金と商品の価格は、公式サイト（https://www.hair-mahalo.com/）と店頭でご確認ください。ここでは分からない料金はお答えできません。" }
];
var panel = document.getElementById('chat-panel');
var fabBot = document.getElementById('fab-bot');
if(!panel || !fabBot) return;
function setPanel(open){ panel.hidden = !open; fabBot.setAttribute('aria-expanded', open ? 'true' : 'false'); }
fabBot.addEventListener('click', function(){ setPanel(panel.hidden); });
document.getElementById('chat-close').addEventListener('click', function(){ setPanel(false); });
  document.addEventListener('click', function(ev){
    if (!panel.hidden && !panel.contains(ev.target) && !fabBot.contains(ev.target)) setPanel(false);
  });
var log = document.getElementById('chat-log');
var chipsBox = document.getElementById('chips');
function addMsg(text, who){
  var d = document.createElement('div'); d.className = 'msg ' + who; d.textContent = text; log.appendChild(d);
  if (who === 'user' && chipsBox) chipsBox.style.display = 'none';
  log.scrollTop = log.scrollHeight; return d;
}
function addFallback(){
  var d = addMsg("ごめんなさい、まだその質問には答えられませんでした。お店のことなら、公式サイトや店舗のLINEで聞いてみてください。", 'bot');
  var a = document.createElement('a'); a.className = 'oc-link'; a.href = 'https://www.hair-mahalo.com/'; a.target = '_blank'; a.rel = 'noopener'; a.textContent = '公式サイトを見る';
  d.appendChild(document.createElement('br')); d.appendChild(a);
}
function has(text, words){ for (var i = 0; i < words.length; i++){ if (text.indexOf(words[i]) !== -1) return true; } return false; }
function answerFor(text){
  if (has(text, ["こんにちは","こんばんは","おはよう","はじめまして"])) { window.__ct='あいさつ'; return "こんにちは！MAHALOです。知りたいことを聞いてください。下のボタンからも選べます。"; }
  if (has(text, ["ありがとう","助かり","わかった","分かった"])) { window.__ct='お礼'; return "どういたしまして！また何かあれば聞いてください。"; }
  if (has(text, ["キラ水","煌水","きらすい"])) { window.__ct=QA[4].q; return QA[4].a; }
  if (has(text, ["診断","髪質","毛質"])) { window.__ct=QA[3].q; return QA[3].a; }
  if (has(text, ["セレクト","商品","ラッシュアディクト","リファ","ReFa","オージュア"])) { window.__ct=QA[2].q; return QA[2].a; }
  if (has(text, ["予約","空き","あき"])) { window.__ct=QA[5].q; return QA[5].a; }
  if (has(text, ["料金","値段","価格","いくら","目安"])) { window.__ct=QA[6].q; return QA[6].a; }
  if (has(text, ["場所","住所","駐車場","アクセス","どこ"])) { window.__ct=QA[1].q; return QA[1].a; }
  if (has(text, ["営業時間","定休日","何時","休み","時間"])) { window.__ct=QA[0].q; return QA[0].a; }
  if (has(text, ["誰","名前","主催","運営"])) { window.__ct='名前'; return "名前はなくて、MAHALOの案内役です。お店のことは、公式サイトや店舗のLINEでも聞けます。"; }
  return null;
}
QA.forEach(function(item){
  var b = document.createElement('button'); b.type = 'button'; b.className = 'chip'; b.textContent = item.chip;
  b.addEventListener('click', function(){ addMsg(item.q, 'user'); addMsg(item.a, 'bot'); logChat(item.q, 'chip'); });
  chipsBox.appendChild(b);
});
var form = document.getElementById('chat-form');
var input = document.getElementById('chat-input');
form.addEventListener('submit', function(e){
  e.preventDefault();
  var text = input.value.replace(/^\s+|\s+$/g, ''); if (!text) return;
  addMsg(text, 'user'); input.value = '';
  var typing = addMsg('考え中…', 'bot');
  function useRule(){
    if (typing) typing.remove();
    var ans = answerFor(text);
    logChat(ans ? (window.__ct || 'その他') : '答えられなかった質問', 'text'); window.__ct = null;
    if (window.__logBot) window.__logBot(text, ans || '（答えられなかった質問）');
    if (ans) addMsg(ans, 'bot'); else addFallback();
  }
  if (window.__aiAsk){
    window.__aiAsk(text).then(function(aiAns){
      if (aiAns){ if (typing) typing.remove(); addMsg(aiAns, 'bot'); logChat('AI回答', 'ai'); }
      else useRule();
    }).catch(function(){ useRule(); });
  } else useRule();
});
})();
