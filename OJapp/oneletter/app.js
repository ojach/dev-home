// ==========================
// One Letter  app.js (土台)
// ==========================

// URL から ID を取得（/oneletter/XXXXX）
const path = location.pathname.split("/");
const id = path[2] || null;

// DOMキャッシュ
const creator = document.getElementById("creator");
const viewer  = document.getElementById("viewer");
const letterView = document.getElementById("letterView");
const firstOverlay = document.getElementById("firstOverlay");


// --------------------------
// モード分岐
//   IDなし → 作成モード
//   IDあり → 表示モード
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
}


// --------------------------
// 表示モード
// --------------------------
function enterViewMode(letterId) {
  creator.style.display = "none";
  viewer.style.display  = "block";

  console.log("[OneLetter] View Mode: ", letterId);

  // 本来は workers.js に fetch して手紙を取得するけど、
  // 今はまだ土台なので仮の表示だけ入れておく
  showTemporaryLetter();

  // 初回オーバーレイ（後でロジック入れる）
  showFirstOverlay(letterId);
}


// --------------------------
// 仮：表示モードのダミー表示
// （後で workers から取得して差し替える）
// --------------------------
function showTemporaryLetter() {
  letterView.innerHTML = `
    <div style="
      width:100%;
      height:100vh;
      display:flex;
      justify-content:center;
      align-items:center;
      background:#111;
      color:#fff;
      font-size:18px;">
      手紙を読み込んでいます…
    </div>
  `;
}


// --------------------------
// 初回オーバーレイ（仮）
// 本番では 30秒カウント＋<create with OJapp> 等入れる
// --------------------------
function showFirstOverlay(letterId) {
  const key = "oneletter_opened_" + letterId;

  // 初回のみ表示
  if (!localStorage.getItem(key)) {
    firstOverlay.classList.remove("hidden");
    localStorage.setItem(key, "1");
  }
}
