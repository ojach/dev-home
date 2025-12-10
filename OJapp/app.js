// OJapp Builder 用 app.js

// API のエンドポイント（Cloudflare Worker）
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

// Create App ボタン
document.getElementById("createBtn").addEventListener("click", async () => {
  const file = document.getElementById("iconInput").files[0];
  const name = document.getElementById("appName").value.trim();
  const url  = document.getElementById("appURL").value.trim();

  if (!file || !name || !url) {
    alert("アイコン・名前・URLを全部入れてな🔥");
    return;
  }

  // ★ URLスキーム対応 : http/https 以外も許可
  const isScheme = /^[a-zA-Z0-9+\-.]+:\/\//.test(url);

  // 画像を base64 に変換
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result; // data:image/png;base64,...

    try {

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          name: name,
          app_url: url,           // ← ここにそのままスキームが入ってOK
          icon_base64: base64
        })
      });

      const result = await res.json();

      if (result.status === "ok") {

        // ★ 表示する案内をスキーム対応に変更
        let guide = "このURLを開いて『ホーム画面に追加』してね！";

        if (isScheme) {
          guide = "これはアプリURLです。\nホーム追加して開くと自動起動するで！🔥";
        }

        alert(
          "OJapp 発行完了🎉\n\n" +
          result.access_url + "\n\n" +
          guide
        );

        console.log("issued:", result);

      } else {
        console.error(result);
        alert("保存失敗💥 ちょっと時間おいて試してみて");
      }
    } catch (e) {
      console.error(e);
      alert("通信エラー💥 ネット環境を確認してな");
    }
  };

  reader.readAsDataURL(file);
});

// クリップボードコピー機能
function copyText(id){
  const text=document.getElementById(id).innerText;
  navigator.clipboard.writeText(text);
  alert("コピーしたで✌");
}

// ダークモード
function toggleTheme() {
  document.documentElement.classList.toggle("dark");

  const sw = document.querySelector(".switch");
  if (document.documentElement.classList.contains("dark")) {
    sw.textContent = "🌙";
  } else {
    sw.textContent = "😆";
  }
}
