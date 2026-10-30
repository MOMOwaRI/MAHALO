/* OHANA LP の Gemini bot モジュール（Firebase AI Logic / gemini-3.5-flash-lite / App Check / 1日20回）を移植。SYS は各ページの window.__botSYS。botLogs には site: mahalo-pages を追加。 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app-check.js";
import { getAI, getGenerativeModel, GoogleAIBackend } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-ai.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";
var SYS = window.__botSYS || "";
try {
  var aiApp = initializeApp({
  apiKey: "AIzaSyCao64N8dfQoXBmsMHIDpLpQwQyXp-2iw0",
  authDomain: "ohana-share.firebaseapp.com",
  projectId: "ohana-share",
  storageBucket: "ohana-share.firebasestorage.app",
  messagingSenderId: "825904150210",
  appId: "1:825904150210:web:4ae90f047ac8cc761cad5b"
}, 'ohana-ai');
  initializeAppCheck(aiApp, { provider: new ReCaptchaEnterpriseProvider('6LfLJwcuAAAAAJk3CSivW9C-9E0Q-Cexl9wwibrv'), isTokenAutoRefreshEnabled: true });
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
