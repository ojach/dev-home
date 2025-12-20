// One Letter app.js v1.0
// 手紙データを POST → URL を受け取るだけの超シンプル版

const API_ENDPOINT = "https://ojapp-oneletter.trc-wasps.workers.dev/api/create";

document.addEventListener("DOMContentLoaded", () => {

  const imgInput = document.getElementById("iconInput");
  const preview = document.getElementById("preview");
  const textInput = document.getElementById("appName");
  const createBtn = document.getElementById("createBtn");

  let imageBase64 = "";   // base64保持

  // ===============================
  // 画像アップロード → base64化
  // ===============================
  imgInput.addEventListener("change", () => {
    const file = imgInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      imageBase64 = e.target.result; // 画像の base64
      preview.src = imageBase64;
    };
    reader.readAsDataURL(file);
  });

  // ===============================
  // URL 表示カード
  // ===============================
  function showCopyBox(url) {
    const area = document.getElementById("resultArea");

    area.innerHTML = `
      <div style="
        background: linear-gradient(135deg, #2bb7ff, #0077ff);
        padding: 18px;
        border-radius: 16px;
        color: #fff;
        font-weight: bold;
        text-align: center;
        box-shadow: 0 6px 20px rgba(0, 140, 255, 0.35);
      ">
        <div style="font-size:16px; margin-bottom:6px;">✨ あなたの One Letter ✨</div>
        <div style="
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

    document.getElementById("copyBtn").onclick = () => {
      navigator.clipboard.writeText(url);
      alert("コピーしたで✌");
    };
  }

  // ===============================
  // 作成ボタン
  // ===============================
  createBtn.addEventListener("click", async () => {

    const text = textInput.value.trim();

    if (!text) {
      alert("本文を書いてな🔥");
      return;
    }

    try {
      // Worker に送る JSON
      const payload = {
        text,
        image_base64: imageBase64,
        layout: "text",          // とりあえず textのみ
        bgColor: "#000000",      // とりあえず黒背景
        font: "serif",
        fontSize: 22,
        writing: "horizontal"
      };

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (result.status === "ok") {
        const accessUrl = `https://ojach.com/oneletter/${result.id}`;
        showCopyBox(accessUrl);
      } else {
        alert("保存に失敗した💥");
      }

    } catch (e) {
      console.error(e);
      alert("通信エラー💥");
    }

  });

});

// ===============================
// ダークモード
// ===============================
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "🤩";
}
}); 
