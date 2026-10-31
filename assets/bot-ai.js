/* OHANA LP の Gemini bot モジュール（Firebase AI Logic / gemini-3.5-flash-lite / App Check / 1日20回）を移植。SYS は各ページの window.__botSYS。botLogs には site: mahalo-pages を追加。 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app-check.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-ai.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
var SYS = window.__botSYS || "";
/* 多言語対応：サイトで選んだ言語で答える（i18n.js が localStorage 'mahalo-lang' を管理） */
try {
  var _bl = localStorage.getItem('mahalo-lang') || 'ja';
  var _bn = { en: 'English', zh: '简体中文', ko: '한국어' }[_bl];
  if (_bn) SYS += "\n\n・回答は必ず " + _bn + " で書いてください（お店の名前や住所などの固有名詞はそのままで構いません）。";
} catch (e) {}
try {
  var aiApp = initializeApp({
  apiKey: "AIzaSyAdq6e71I-1XsBHOsMc4Q_djsHlecqQKcQ",
  authDomain: "mahalo-12007.firebaseapp.com",
  projectId: "mahalo-12007",
  storageBucket: "mahalo-12007.firebasestorage.app",
  messagingSenderId: "882306860348",
  appId: "1:882306860348:web:c540fd2f313206cab6ca39"
}, 'ohana-ai');
  initializeAppCheck(aiApp, { provider: new ReCaptchaEnterpriseProvider('6Ld5owYuAAAAANYK0NJy8RSdjmG1lW8A8bnTVdzW'), isTokenAutoRefreshEnabled: true });
  var aiDb = getFirestore(aiApp);
  var ai = getAI(aiApp, { backend: new GoogleAIBackend() });
  var model = getGenerativeModel(ai, { model: 'gemini-3.5-flash-lite', systemInstruction: SYS });
  var chat = null;
  function kunUsed(){
    try {
      var d = new Date();
      var key = 'mahalo_bot_' + d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
      var n = parseInt(localStorage.getItem(key) || '0', 10) + 1;
      localStorage.setItem(key, String(n));
      return n;
    } catch(e){ return 1; }
  }

  window.__logBot = function(q, a){
    try { addDoc(collection(aiDb, 'botLogs'), { q: String(q).slice(0, 300), a: String(a || '').slice(0, 2000), page: location.pathname, site: 'mahalo-pages', ts: serverTimestamp() }).catch(function(){}); } catch(e){}
  };
  window.__aiAsk = function(text){
    if (kunUsed() > 20) return Promise.resolve('たくさん聞いてくれて、ありがとうございます。ここから先は、お店に直接聞いてくださいね。公式サイト（https://www.hair-mahalo.com/）の各店舗ページや、店舗のLINEからどうぞ。');
    function attempt(){
      if (!chat) chat = model.startChat({ history: [] });
      return chat.sendMessage(text).then(function(res){ return res.response.text(); });
    }
    var p = attempt().catch(function(){ chat = null; return attempt(); });
    var timeout = new Promise(function(res){ setTimeout(function(){ res(null); }, 15000); });
    return Promise.race([p, timeout]).then(function(ans){
      if (ans) {
        try { addDoc(collection(aiDb, 'botLogs'), { q: text, a: String(ans).slice(0, 2000), page: location.pathname, site: 'mahalo-pages', ts: serverTimestamp() }).catch(function(){}); } catch(e){}
        return String(ans);
      }
      return null;
    }).catch(function(){ return null; });
  };
} catch(e){}
