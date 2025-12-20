// ==========================
// One Letter  app.js 完成版
// ==========================

const path = location.pathname.split("/");
const id = path[2] || null;

// DOM
const creator = document.getElementById("creator");
const viewer  = document.getElementById("viewer");
const previewCanvas = document.getElementById("previewCanvas");
const letterView = document.getElementById("letterView");
const firstOverlay = document.getElementById("firstOverlay");

// 入力
const layoutSel = document.getElementById("layout");
const bgColorInput = document.getElementById("bgColor");
const fontSel = document.getElementById("font");
const fontSizeSel = document.getElementById("fontSize");
const writingSel = document.getElementById("writing");
const textArea = document.getElementById("text");
const imageInput = document.getElementById("imageInput");

let previewImageURL = null;


// --------------------------
// モード分岐
// --------------------------
if (!id) enterCreateMode();
else     enterViewMode(id);


// --------------------------
// 作成モード
// --------------------------
function enterCreateMode() {
  creator.style.display = "block";
  viewer.style.display  = "none";

  updatePreview();

  layoutSel.addEventListener("change", updatePreview);
  bgColorInput.addEventListener("input", updatePreview);
  fontSel.addEventListener("change", updatePreview);
  fontSizeSel.addEventListener("change", updatePreview);
  writingSel.addEventListener("change", updatePreview);
  textArea.addEventListener("input", updatePreview);
  imageInput.addEventListener("change", readImage);
}


// --------------------------
// 表示モード（後でworkersに繋ぐだけ）
// --------------------------
function enterViewMode(letterId) {
  creator.style.display = "none";
  viewer.style.display  = "block";

  letterView.innerHTML = `
    <div style="
      width:100%;height:100vh;
      display:flex;justify-content:center;align-items:center;
      background:#111;color:#fff;">
      読み込み中…
    </div>
  `;

  showFirstOverlay(letterId);
}


// --------------------------
// プレビュー：画像読み込み
// --------------------------
function readImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  previewImageURL = URL.createObjectURL(file);
  updatePreview();
}


// --------------------------
// ▼ プレビュー描画（全レイアウト対応）
// --------------------------
function updatePreview() {
  const layout = layoutSel.value;
  const bg = bgColorInput.value;
  const font = fontSel.value;
  const writing = writingSel.value;
  const text = escapeHTML(textArea.value);

  let px = "18px";
  if (fontSizeSel.value === "small") px = "14px";
  else if (fontSizeSel.value === "large") px = "24px";

  const tate = (writing === "vertical") ? "tategaki" : "";

  let html = "";

  // ---- 上部画像＋文字 ----
  if (layout === "top") {
    html = `
      <div class="layout-top" style="background:${bg}">
        ${previewImageURL ? `<img src="${previewImageURL}" class="top-img">` : ""}
        <p class="text ${font}" style="font-size:${px};">${text}</p>
      </div>
    `;
  }

  // ---- 背景画像＋オーバーレイ ----
  else if (layout === "overlay") {
    html = `
      <div class="layout-overlay">
        ${previewImageURL ? `<img src="${previewImageURL}" class="overlay-img">` : ""}
        <p class="text overlay ${font}" style="font-size:${px};">${text}</p>
      </div>
    `;
  }

  // ---- 文字のみ ----
  else if (layout === "text") {
    html = `
      <div class="layout-text" style="background:${bg}">
        <p class="text ${font} ${tate}" style="font-size:${px};">${text}</p>
      </div>
    `;
  }

  // ---- 絵日記（額縁＋縦書き対応）----
  else if (layout === "diary") {
    html = `
      <div class="layout-diary" style="--bg:${bg}">
        <div class="diary-frame">
          ${previewImageURL ? `<img src="${previewImageURL}">` : ""}
        </div>
        <p class="text ${font} ${tate}" style="font-size:${px};">${text}</p>
      </div>
    `;
  }

  previewCanvas.innerHTML = html;
}


// --------------------------
function showFirstOverlay(letterId) {
  const key = "oneletter_opened_" + letterId;
  if (!localStorage.getItem(key)) {
    firstOverlay.classList.remove("hidden");
    localStorage.setItem(key, "1");
  }
}


// --------------------------
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;",
    '"':"&quot;", "'":"&#39;"
  }[m]));
}
async function createLetter() {

  const data = {
    layout: layoutSel.value,
    bgColor: bgColorInput.value,
    font: fontSel.value,
    fontSize: fontSizeSel.value,
    writing: writingSel.value,
    text: textArea.value
  };

  const fd = new FormData();
  fd.append("json", JSON.stringify(data));

  // 画像（任意）
  if (imageInput.files[0]) {
    fd.append("image", imageInput.files[0]);
  }

  const res = await fetch("https://your-worker-url/api/oneletter/create", {
    method: "POST",
    body: fd
  });

  const j = await res.json();

  // 完成URLへジャンプ
  location.href = j.url;
}
