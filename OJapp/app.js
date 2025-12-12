// OJapp Builder 用 app.js

// API のエンドポイント
const API_ENDPOINT = "https://ojapp-auth.trc-wasps.workers.dev/api/create";

// ===============================
// 共通UI
// ===============================
function toggleA(){
  let box=document.getElementById("assistantBox");
  box.style.display = (box.style.display=="none")?"block":"none";
}

function showMessage(text) {
  const box = document.getElementById("assistantBox");
  box.textContent = text;
}

// ===============================
// アイコン処理（Canvas縮小）
// ===============================
const iconInput = document.getElementById("iconInput");
const previewImg = document.getElementById("preview");

let resizedIconBlob = null; // ← これを workers.js に送る

iconInput.addEventListener("change", () => {
  const file = iconInput.files[0];
  if (!file) return;

  // 最終セーフティ（内部用）
  if (file.size > 2 * 1024 * 1024) {
    showMessage("❌ 画像ファイルが大きすぎます");
    iconInput.value = "";
    return;
  }

  const img = new Image();
  const reader = new FileReader();

  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {
    const w = img.width;
    const h = img.height;

    // 小さすぎる画像はNG
    if (w <= 100 || h <= 100) {
      showMessage("❌ 画像サイズが小さすぎます（100×100px以上）");
      iconInput.value = "";
      return;
    }

    // 長方形は警告のみ
    if (w !== h) {
      showMessage("⚠️ 正方形ではありません。歪んで表示される場合があります");
    } else {
      showMessage("✅ アイコン画像を確認しました");
    }

    // ===== Canvas 縮小（最大512）=====
    const maxSize = 512;
    const targetSize = Math.min(w, h, maxSize);

    const canvas = document.createElement("canvas");
    canvas.width = targetSize;
    canvas.height = targetSize;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, targetSize, targetSize);

    // Blob化（PNG）
    canvas.toBlob(blob => {
      resizedIconBlob = blob;

      // プレビューは縮小後の画像
      previewImg.src = URL.createObjectURL(blob);
    }, "image/png");
  };
});

// =========================
// ▼ URLコピーボックス生成
// =========================
function showCopyBox(url) {
  const old = document.getElementById("copyBoxWrap");
  if (old) old.remove();

  const wrap = document.createElement("div");
  wrap.id = "copyBoxWrap";
  wrap.style = `
    margin:20px auto;
    width:90%;
    max-width:500px;
    padding:18px;
    background:#fff;
    border-radius:14px;
    box-shadow:0 6px 16px rgba(0,0,0,.1);
    text-align:center;
    font-family:-apple-system,BlinkMacSystemFont;
  `;

  wrap.innerHTML = `
    <div style="font-size:14px;color:#444;margin-bottom:6px;">発行された OJapp URL</div>
    <div id="copyTarget"
         style="word-break:break-all;background:#f4f4f4;padding:8px;border-radius:8px;font-size:14px;">
      ${url}
    </div>
    <button id="copyBtn"
      style="
        margin-top:12px;padding:8px 16px;border-radius:8px;border:none;
        background:#2bb7ff;color:#fff;font-weight:bold;cursor:pointer;">
      📋 コピー
    </button>
  `;

  document.querySelector(".main").appendChild(wrap);

  document.getElementById("copyBtn").onclick = ()=>{
    navigator.clipboard.writeText(url);
    alert("コピーしたで✌");
  };
}

// =========================
// ▼ Create App ボタン
// =========================
document.getElementById("createBtn").addEventListener("click", async () => {
  const name = document.getElementById("appName").value.trim();
  const url  = document.getElementById("appURL").value.trim();

  if (!resizedIconBlob || !name || !url) {
    alert("アイコン・名前・URLを全部入れてな🔥");
    return;
  }

  // URLスキーム判定
  const isScheme = /^[a-zA-Z0-9+\-.]+:\/\//.test(url);

  // ★ 縮小後アイコン → base64
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result;

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          name: name,
          app_url: url,
          icon_base64: base64
        })
      });

      const result = await res.json();

      if (result.status === "ok") {
        const accessUrl = result.access_url;

        let guide = "このURLを開いて『ホーム画面に追加』してね！";

        if (isScheme) {
          guide = "アプリURLです！\nホーム追加したアイコンを起動するとアプリが直接ひらくで！🔥";
        }

        alert("OJapp 発行完了🎉\n\n" + guide);
        showCopyBox(accessUrl);

      } else {
        alert("保存失敗💥 時間あけてもう一度！");
      }
    } catch (e) {
      console.error(e);
      alert("通信エラー💥");
    }
  };

  reader.readAsDataURL(resizedIconBlob);
});

function checkURLLevel(url) {
  const green = ['https://', 'http://', 'mailto:', 'tel:', 'sms:'];

  const yellow = [
    'twitter://', 'x://',
    'instagram://',
    'youtube://',
    'twitch://',
    'discord://',
    'amazon://',
    'paypay://'
  ];

  if (green.some(p => url.startsWith(p))) return 'green';
  if (yellow.some(p => url.startsWith(p))) return 'yellow';
  return 'red'; // line:// 含む、それ以外すべて
}
function getURLCheckData(level) {
  if (level === 'green') {
    return {
      icon: '🟢',
      text: '推奨されているURLです。\n多くの環境で安定して動作します。',
      needConfirm: false
    };
  }

  if (level === 'yellow') {
    return {
      icon: '🟡',
      text: 'アプリ用URLが含まれています。\n環境によっては動作しない場合があります。',
      needConfirm: true
    };
  }

  return {
    icon: '🔴',
    text: '推奨されていないURLです。\n正常に動作しない可能性があります。',
    needConfirm: true
  };
}
function onURLInput() {
  const url = document.getElementById('app-url').value.trim();
  const result = document.getElementById('url-check');
  const checkboxWrap = document.getElementById('url-confirm-wrap');
  const checkbox = document.getElementById('url-confirm');
  const createBtn = document.getElementById('create-app');

  checkbox.checked = false;

  if (!url) {
    result.style.display = 'none';
    checkboxWrap.style.display = 'none';
    createBtn.disabled = true;
    return;
  }

  const level = checkURLLevel(url);
  const data = getURLCheckData(level);

  result.className = `url-check ${level}`;
  result.innerText = `${data.icon} ${data.text}`;
  result.style.display = 'block';

  if (data.needConfirm) {
    checkboxWrap.style.display = 'block';
    createBtn.disabled = true;
  } else {
    checkboxWrap.style.display = 'none';
    createBtn.disabled = false;
  }
}
function onURLConfirmChange() {
  const checkbox = document.getElementById('url-confirm');
  const createBtn = document.getElementById('create-app');

  createBtn.disabled = !checkbox.checked;
}

// =========================
// ダークモード（現状維持）
// =========================
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "😆";
}
