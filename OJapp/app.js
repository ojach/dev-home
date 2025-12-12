// ===============================
// API
// ===============================
const API_ENDPOINT = "https://ojapp-auth.trc-wasps.workers.dev/api/create";

// ===============================
// 共通UI
// ===============================
function toggleA() {
  const box = document.getElementById("assistantBox");
  box.style.display = (box.style.display === "none") ? "block" : "none";
}

function showMessage(text) {
  const box = document.getElementById("assistantBox");
  box.textContent = text;
}

// ===============================
// アイコン処理（高品質版）
// ===============================
const iconInput = document.getElementById("iconInput");
const previewImg = document.getElementById("preview");
let resizedIconBlob = null;

iconInput.addEventListener("change", () => {
  const file = iconInput.files[0];
  if (!file) return;

  if (file.size > 2 * 1024 * 1024) {
    showMessage("❌ 画像ファイルが大きすぎます（2MBまで）");
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

    if (w <= 100 || h <= 100) {
      showMessage("❌ 画像サイズが小さすぎます（100×100px以上）");
      iconInput.value = "";
      return;
    }

    if (w !== h) {
      showMessage("⚠️ 正方形ではありません。歪むことがあります");
    } else {
      showMessage("✅ アイコン画像を確認しました");
    }

    const size = Math.min(w, h, 512);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, size, size);

    canvas.toBlob(blob => {
      resizedIconBlob = blob;
      previewImg.src = URL.createObjectURL(blob);
    }, "image/png");
  };
});

// ===============================
// URLチェック判定
// ===============================
function checkURLLevel(url) {
  const green = ['https://', 'http://', 'mailto:', 'tel:', 'sms:'];
  const yellow = [
    'twitter://', 'x://', 'instagram://',
    'youtube://', 'twitch://', 'discord://',
    'amazon://', 'paypay://'
  ];
  if (green.some(p => url.startsWith(p))) return 'green';
  if (yellow.some(p => url.startsWith(p))) return 'yellow';
  return 'red';
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

// ===============================
// DOMセッティング（URL判定）
// ===============================
document.addEventListener("DOMContentLoaded", () => {

  const urlInput = document.getElementById("appURL");
  const result = document.getElementById("url-check");
  const wrap = document.getElementById("url-confirm-wrap");
  const checkbox = document.getElementById("url-confirm");
  const createBtn = document.getElementById("createBtn");

  createBtn.disabled = true;

  urlInput.addEventListener("input", () => {
    const url = urlInput.value.trim();
    checkbox.checked = false;

    if (!url) {
      result.style.display = "none";
      wrap.style.display = "none";
      createBtn.disabled = true;
      return;
    }

    const level = checkURLLevel(url);
    const data = getURLCheckData(level);

    result.className = `url-check ${level}`;
    result.textContent = `${data.icon} ${data.text}`;
    result.style.display = "block";

    if (data.needConfirm) {
      wrap.style.display = "block";
      createBtn.disabled = true;
    } else {
      wrap.style.display = "none";
      createBtn.disabled = false;
    }
  });

  checkbox.addEventListener("change", () => {
    createBtn.disabled = !checkbox.checked;
  });
});

// ===============================
// ★ 青く光る OJappカードを表示するUI
// ===============================
function showCopyBox(url) {
  const area = document.getElementById("resultArea");
  if (!area) return;

  area.innerHTML = `
    <div style="
      background: linear-gradient(135deg, #2bb7ff, #0077ff);
      padding: 18px;
      border-radius: 16px;
      color: #fff;
      font-weight: bold;
      text-align: center;
      box-shadow: 0 6px 20px rgba(0, 140, 255, 0.35);
      animation: fadeIn 0.4s ease;
    ">
      <div style="font-size:16px; margin-bottom:6px;">✨ 発行された OJapp ✨</div>
      <div id="copyTarget" style="
        font-size:14px;
        word-break: break-all;
        background: rgba(255,255,255,0.2);
        padding: 8px;
        border-radius: 10px;
      ">${url}</div>

      <button id="copyBtn" style="
        margin-top: 12px;
        padding: 8px 16px;
        background: #ffffff;
        color: #0077ff;
        border: none;
        border-radius: 10px;
        font-weight: bold;
        cursor: pointer;
      ">📋 コピー</button>
    </div>
  `;

  // コピー機能
  document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(url);
    alert("コピーしたで✌");
  };
}

// ===============================
// Create App（本処理）
// ===============================
document.getElementById("createBtn").addEventListener("click", async () => {

  const name = document.getElementById("appName").value.trim();
  const url  = document.getElementById("appURL").value.trim();

  if (!resizedIconBlob || !name || !url) {
    alert("アイコン・名前・URLを全部入れてな🔥");
    return;
  }

  const reader = new FileReader();
  reader.onload = async () => {
    try {

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          name,
          app_url: url,
          icon_base64: reader.result
        })
      });

      const result = await res.json();

      if (result.status === "ok") {
        const accessUrl = result.access_url;
        showCopyBox(accessUrl); // ★ ここで表示！
      } else {
        alert("保存失敗💥 時間をおいて試してみて！");
      }

    } catch (e) {
      alert("通信エラー💥 ネット環境を確認！");
      console.error(e);
    }
  };

  reader.readAsDataURL(resizedIconBlob);
});

// ===============================
// ダークモード
// ===============================
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "😆";
}
