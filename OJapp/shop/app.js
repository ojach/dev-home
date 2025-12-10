console.log("JS読み込み開始");

// 設定（CSV）
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRckMXYTdFw-2sSEmeqVTCXymb3F_NwrNdztP01BrZfH1n2WCORVwZuop7IxfG_KHGYqqlCuc3sBUee/pub?gid=1229129034&single=true&output=csv";

// マッピング
const HEADER_MAP = {
  "タイムスタンプ": "timestamp",
  "BOOTH商品URL": "boothUrl",
  "サムネ画像URL": "thumbnail",
  "タイトル": "title",
  "作者名": "author",
  "カテゴリー": "category",
  "スコア": "score",
  "visible": "visible"
};

// CSV取得
async function loadCSV() {
  const res = await fetch(CSV_URL);
  const text = await res.text();

  const rows = text.split("\n").map(r => r.split(","));
  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);

  return rows
    .map(cols => {
      const obj = {};
      cols.forEach((val, i) => (obj[headers[i]] = val.replace(/"/g, "").trim()));
      return obj;
    })
    .filter(item => item.boothUrl && item.visible !== "FALSE");
}

// カード描画
async function renderShop() {
  const grid = document.querySelector(".shop-grid");
  const items = await loadCSV();

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <img src="${item.thumbnail}" class="item-thumb">
      <div class="item-title">${item.title}</div>
      <div class="item-author">by ${item.author}</div>
      <a href="${item.boothUrl}" target="_blank" class="item-buy-btn">購入はこちら</a>
    `;

    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", renderShop);
", renderShop);
// ダークモード（現状維持）
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "😆";
}
let items = []; // ← グローバルにして再描画できるようにする

// CSV読込後、items に保存してから描画
async function loadAndRender() {
  items = await loadCSV();
  sortAndRender("new"); // ← 初期表示は新着
}

function sortAndRender(type) {
  // ---- ソート処理 ----
  if (type === "new") {
    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  if (type === "score") {
    items.sort((a, b) => Number(b.score) - Number(a.score));
  }
  if (type === "author") {
    items.sort((a, b) => a.author.localeCompare(b.author));
  }

  // ---- タブの見た目変更 ----
  document.querySelectorAll(".shop-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.sort === type);
  });

  // ---- 再描画 ----
  renderShop();
}

// ---- タブクリック ----
document.addEventListener("click", e => {
  if (e.target.classList.contains("shop-tab")) {
    const type = e.target.dataset.sort;
    sortAndRender(type);
  }
});

// ---- 描画 ----
function renderShop() {
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = ""; // ← 前の表示を消す

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <img src="${item.thumbnail}" class="item-thumb">
      <div class="item-title">${item.title}</div>
      <div class="item-author">by ${item.author}</div>
      <a href="${item.boothUrl}" target="_blank" class="item-buy-btn">購入はこちら</a>
    `;

    grid.appendChild(card);
  });
}

document.addEventListener("DOMContentLoaded", loadAndRender);
