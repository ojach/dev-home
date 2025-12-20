// ==========================
// One Letter  app.js (リアルタイム版)
// ==========================

const path = location.pathname.split("/");
const id = path[2] || null;

// DOM
const creator = document.getElementById("creator");
const viewer  = document.getElementById("viewer");
const previewCanvas = document.getElementById("previewCanvas");
const firstOverlay = document.getElementById("firstOverlay");

// 入力要素
const layoutSel = document.getElementById("layout");
const bgColorInput = document.getElementById("bgColor");
const fontSel = document.getElementById("font");
const fontSizeSel = document.getElementById("fontSize");
const textArea = document.getElementById("text");
const imageInput = document.getElementById("imageInput");

// キャッシュ
let previewImageURL = null;


// --------------------------
// モード分岐
// --------------------------
if (!id) {
  enterCreateMode();
} else {
  enterViewMode(id);
}


// --------------------------
// 作成モード
// --------------------------
function enterCreateMode() {
  creator.style.display = "block";
  viewer.style.display  = "none";
  firstOverlay.style.display = "none";

  console.log("[OneLetter] Create Mode");

  // 初期プレビュー
  updatePreview();

  // 変更監視
  layoutSel.addEventListener("change", updatePreview);
  bgColorInput.addEventListener("input", updatePreview);
  fontSel.addEventListener("change", updatePreview);
  fontSizeSel.addEventListener("change", updatePreview);
  textArea.addEventListener("input", updatePreview);
  imageInput.addEventListener("change", handleImage);
}


// --------------------------
// 表示モード（後で workers 連携）
// --------------------------
function enterViewMode(letterId) {
  creator.style.display = "none";
  viewer.style.display  = "block";

  console.log("[OneLetter] View Mode: ", letterId);

  showTemporaryLetter();
  showFirstOverlay(letterId);
}


// --------------------------
// プレビュー：画像読み込み
// --------------------------
function handleImage(e) {
  const file = e.target.files[0];
  if (!file) return;

  previewImageURL = URL.createObjectURL(file);
  updatePreview();
}


// --------------------------
// ▼ プレビュー描画（最重要）
// --------------------------
function updatePreview() {
  const layout = layoutSel.value;
  const bgColor = bgColorInput.value;
  const font = fontSel.value;
  const fontSize = fontSizeSel.value;
  const text = textArea.value;

  // フォントサイズ適正化
  let px = "18px";
  if (fontSize === "small") px = "14px";
  else if (fontSize === "large") px = "24px";

  // HTML生成
  let html = "";

  // レイアウト分岐
  if (layout === "top") {
    html = `
      <div class="layout-top" style="background:${bgColor}">
        ${previewImageURL ? `<img src="${previewImageURL}" class="top-img">` : ''}
        <p class="text ${font}" style="font-size:${px};">${escapeHTML(text)}</p>
      </div>
    `;
  }

  else if (layout === "overlay") {
    html = `
      <div class="layout-overlay">
        ${previewImageURL ? `<img src="${previewImageURL}" class="overlay-img">` : ''}
        <p class="text overlay ${font}" style="font-size:${px};">${escapeHTML(text)}</p>
      </div>
    `;
  }

  else if (layout === "text") {
    html = `
      <div class="layout-text" style="background:${bgColor}">
        <p class="text only ${font}" style="font-size:${px};">${escapeHTML(text)}</p>
      </div>
    `;
  }

  previewCanvas.innerHTML = html;
}


// --------------------------
// HTMLサニタイズ（XSS防止）
// --------------------------
function escapeHTML(str){
  return str.replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;",
    '"':"&quot;", "'":"&#39;"
  }[m]));
}


// --------------------------
// ダミー（後で workers へ）
// --------------------------
function showTemporaryLetter() {
  viewer.innerHTML = `
    <div style="
      width:100%;height:100vh;
      display:flex;justify-content:center;align-items:center;
      background:#111;color:#fff;">
      読み込み中…
    </div>`;
}

function showFirstOverlay(letterId) {
  const key = "oneletter_opened_" + letterId;
  if (!localStorage.getItem(key)) {
    firstOverlay.classList.remove("hidden");
    localStorage.setItem(key, "1");
  }
}
