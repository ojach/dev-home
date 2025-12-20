// ==========================
// One Letter  app.js（Creator専用 完成版）
// ==========================

// GitHub版：常に creator モード固定
const creator = document.getElementById("creator");
const previewCanvas = document.getElementById("previewCanvas");
const firstOverlay = document.getElementById("firstOverlay");

// 入力 DOM
const layoutSel = document.getElementById("layout");
const bgColorInput = document.getElementById("bgColor");
const fontSel = document.getElementById("font");
const fontSizeSel = document.getElementById("fontSize");
const writingSel = document.getElementById("writing");
const textArea = document.getElementById("text");
const imageInput = document.getElementById("imageInput");

let previewImageURL = null;

// ===============
// Creator モード
// ===============
creator.style.display = "block";
firstOverlay.style.display = "none";

updatePreview();

layoutSel.addEventListener("change", updatePreview);
bgColorInput.addEventListener("input", updatePreview);
fontSel.addEventListener("change", updatePreview);
fontSizeSel.addEventListener("change", updatePreview);
writingSel.addEventListener("change", updatePreview);
textArea.addEventListener("input", updatePreview);
imageInput.addEventListener("change", readImage);


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
// プレビュー描画（全レイアウト対応）
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

  if (layout === "top") {
    html = `
      <div class="layout-top" style="background:${bg}">
        ${previewImageURL ? `<img src="${previewImageURL}" class="top-img">` : ""}
        <p class="text ${font}" style="font-size:${px};">${text}</p>
      </div>`;
  }

  else if (layout === "overlay") {
    html = `
      <div class="layout-overlay">
        ${previewImageURL ? `<img src="${previewImageURL}" class="overlay-img">` : ""}
        <p class="text overlay ${font}" style="font-size:${px};">${text}</p>
      </div>`;
  }

  else if (layout === "text") {
    html = `
      <div class="layout-text" style="background:${bg}">
        <p class="text ${font} ${tate}" style="font-size:${px};">${text}</p>
      </div>`;
  }

  else if (layout === "diary") {
    html = `
      <div class="layout-diary" style="--bg:${bg}">
        <div class="diary-frame">${previewImageURL ? `<img src="${previewImageURL}">` : ""}</div>
        <p class="text ${font} ${tate}" style="font-size:${px};">${text}</p>
      </div>`;
  }

  previewCanvas.innerHTML = html;
}


// --------------------------
// HTMLエスケープ
// --------------------------
function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));
}


// =============================
// 手紙の作成  →  Workers へ送信
// =============================
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

  if (imageInput.files[0]) {
    fd.append("image", imageInput.files[0]);
  }

  // ★ あなたの Workers URL に修正！
  const API = "https://ojapp-oneletter.trc-wasps.workers.dev";

  const res = await fetch(`${API}/api/oneletter/create`, {
    method: "POST",
    body: fd
  });

  const j = await res.json();

  // Workers が返す Pages viewer のURLへ移動
  location.href = j.url;
}
