// =======================================
// One Letter viewer/app.js v1.0
// DB から読み込んだ 1枚の手紙を表示するだけ
// =======================================

(function () {

  const data = window.__LETTER__;
  if (!data) {
    console.error("LETTER data missing");
    document.body.innerHTML = "<h2 style='padding:20px;'>データが読み込めませんでした。</h2>";
    return;
  }

  const {
    text = "",
    bgColor = "#ffffff",
    font = "serif",
    fontSize = 20,
    writing = "horizontal",   // "horizontal" | "vertical"
    imageURL = "",
    layout = "text"           // "text" | "image-top" | "image-bottom"
  } = data;

  const root = document.getElementById("root");

  // ================================
  // レイアウト作成
  // ================================
  let html = `
    <div id="letter-container" style="
      background:${bgColor};
      color:#fff;
      min-height:100vh;
      padding:20px;
      box-sizing:border-box;
      font-family:${font};
      font-size:${fontSize}px;
      writing-mode:${writing === "vertical" ? "vertical-rl" : "horizontal-tb"};
      display:flex;
      flex-direction:column;
      align-items:center;
      line-height:1.8;
    ">
  `;

  // ===== 画像を上に置くレイアウト =====
  if (layout === "image-top" && imageURL) {
    html += `
      <img src="${imageURL}" style="
        width: 100%;
        max-width: 600px;
        border-radius: 14px;
        margin-bottom: 20px;
      ">
    `;
  }

  // ===== 本文 =====
  html += `
    <div style="
      white-space:pre-wrap;
      text-align:${writing === "vertical" ? "right" : "left"};
      max-width:600px;
      width:100%;
    ">
      ${escapeHTML(text)}
    </div>
  `;

  // ===== 画像を下に置くレイアウト =====
  if (layout === "image-bottom" && imageURL) {
    html += `
      <img src="${imageURL}" style="
        width: 100%;
        max-width: 600px;
        border-radius: 14px;
        margin-top: 20px;
      ">
    `;
  }

  html += `</div>`; // letter-container

  root.innerHTML = html;

  // ================================
  // HTMLエスケープ
  // ================================
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, function(m) {
      return ({
        "&":"&amp;",
        "<":"&lt;",
        ">":"&gt;",
        "\"":"&quot;",
        "'":"&#39;"
      })[m];
    });
  }

})();
