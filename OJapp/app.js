// OJapp Builder 用 app.js

// API のエンドポイント
const API_ENDPOINT = "https://ojapp-auth.trc-wasps.workers.dev/api/create";

function toggleA(){
  let box=document.getElementById("assistantBox");
  box.style.display = (box.style.display=="none")?"block":"none";
}

// アイコンプレビュー
document.getElementById("iconInput").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("preview").src = URL.createObjectURL(file);
});

// =========================
// ▼ URLコピーボックス生成
// =========================
function showCopyBox(url) {
  // 既に存在する場合は消す
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
  const file = document.getElementById("iconInput").files[0];
  const name = document.getElementById("appName").value.trim();
  const url  = document.getElementById("appURL").value.trim();

  if (!file || !name || !url) {
    alert("アイコン・名前・URLを全部入れてな🔥");
    return;
  }

  // ★ URLスキーム判定（http/https以外 OK）
  const isScheme = /^[a-zA-Z0-9+\-.]+:\/\//.test(url);

  // アイコン → base64
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

        // URLスキームの場合は案内を変更
        if (isScheme) {
          guide = "アプリURLです！\nホーム追加したアイコンを起動するとアプリが直接ひらくで！🔥";
        }

        alert("OJapp 発行完了🎉\n\n" + guide);

        // ▼ 画面にコピーボックスを生成
        showCopyBox(accessUrl);

        console.log("issued:", result);
      } else {
        alert("保存失敗💥 時間あけてもう一度！");
      }
    } catch (e) {
      console.error(e);
      alert("通信エラー💥");
    }
  };

  reader.readAsDataURL(file);
});

// ダークモード（現状維持）
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "😆";
}
