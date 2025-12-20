// =======================================
// oneletter/viewer/app.js v1.0
// 手紙データを取得して1ページ表示するだけ
// =======================================

(async function () {

  // URL から ID を取得
  const segments = location.pathname.split("/").filter(s => s !== "");
  const id = segments[segments.length - 1];

  const API = "https://ojapp-oneletter.trc-wasps.workers.dev";

  const root = document.getElementById("root");
  root.innerHTML = "読み込み中…";

  try {
    // JSON 取得
    const res = await fetch(`${API}/api/oneletter/${id}`);
    if (!res.ok) {
      root.innerHTML = "手紙が見つかりません。";
      return;
    }

    const d = await res.json();

    // 描画開始
    renderLetter(d);

  } catch (e) {
    console.error(e);
    root.innerHTML = "読み込みに失敗しました。";
  }


  // --- 手紙レンダリング ---
  function renderLetter(d) {

    const writing = d.writing === "vertical" ? "tategaki" : "";

    let html = "";

    // レイアウト別に分岐
    if (d.layout === "top") {
      html = `
        <div class="layout-top" style="background:${d.bgColor}">
          ${d.imageURL ? `<img src="${d.imageURL}" class="img-top">` : ""}
          <p class="letter-text ${writing}" 
             style="font-size:${d.fontSize}px; font-family:${d.font};">
            ${escapeHTML(d.text)}
          </p>
        </div>
      `;
    }

    if (d.layout === "overlay") {
      html = `
        <div class="layout-overlay">
          ${d.imageURL ? `<img src="${d.imageURL}" class="img-overlay">` : ""}
          <p class="letter-text overlay ${writing}" 
             style="font-size:${d.fontSize}px; font-family:${d.font};">
            ${escapeHTML(d.text)}
          </p>
        </div>
      `;
    }

    if (d.layout === "text") {
      html = `
        <div class="layout-text" style="background:${d.bgColor}">
          <p class="letter-text ${writing}" 
             style="font-size:${d.fontSize}px; font-family:${d.font};">
            ${escapeHTML(d.text)}
          </p>
        </div>
      `;
    }

    if (d.layout === "diary") {
      html = `
        <div class="layout-diary" style="background:${d.bgColor}">
          <div class="frame">
            ${d.imageURL ? `<img src="${d.imageURL}">` : ""}
          </div>
          <p class="letter-text ${writing}" 
             style="font-size:${d.fontSize}px; font-family:${d.font};">
            ${escapeHTML(d.text)}
          </p>
        </div>
      `;
    }

    root.innerHTML = html;
  }


  // --- HTMLエスケープ ---
  function escapeHTML(str) {
    return str.replace(/[&<>"']/g, m => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;"
    })[m]);
  }

})();

