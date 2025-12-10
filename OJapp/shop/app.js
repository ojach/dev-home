console.log("JS読み込み開始");

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRckMXYTdFw-2sSEmeqVTCXymb3F_NwrNdztP01BrZfH1n2WCORVwZuop7IxfG_KHGYqqlCuc3sBUee/pub?gid=1229129034&single=true&output=csv";

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

let items = [];       // 全商品
let viewItems = [];   // 表示用商品（カテゴリー＋ソート済み）

// ============================================
// CSV読み込み
// ============================================
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

// ============================================
// カテゴリー一覧生成
// ============================================
function renderCategoryTabs() {
  const categories = ["全て"];

  // CSV内のカテゴリを重複なしで抽出
  items.forEach(i => {
    if (i.category && !categories.includes(i.category)) {
      categories.push(i.category);
    }
  });

  const catArea = document.querySelector(".category-tabs");
  catArea.innerHTML = "";

  categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "category-tab";
    div.dataset.category = cat;
    div.textContent = cat;
    if (cat === "全て") div.classList.add("active");
    catArea.appendChild(div);
  });
}

// ============================================
// カテゴリーフィルタリング
// ============================================
function filterByCategory(category) {
  if (category === "全て") {
    viewItems = [...items];
  } else {
    viewItems = items.filter(i => i.category === category);
  }
  sortAndRender(currentSort); // ソート維持
}

// ============================================
// ソート処理
// ============================================
let currentSort = "new";

function sortAndRender(type) {
  currentSort = type;

  if (type === "new") {
    viewItems.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  if (type === "score") {
    viewItems.sort((a, b) => Number(b.score) - Number(a.score));
  }
  if (type === "author") {
    viewItems.sort((a, b) => a.author.localeCompare(b.author));
  }

  document.querySelectorAll(".shop-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.sort === type);
  });

  renderShop();
}

// ============================================
// 商品描画
// ============================================
function renderShop() {
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = "";

  viewItems.forEach(item => {
    const thumb = item.thumbnail || "/OJapp/shop/noimage.png";

    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <img src="${thumb}" class="item-thumb">
      <div class="item-title">${item.title}</div>
      <div class="item-author">by ${item.author}</div>
      <a href="${item.boothUrl}" target="_blank" class="item-buy-btn">購入はこちら</a>
    `;

    grid.appendChild(card);
  });
}

// ============================================
// タブクリックイベント（ソート & カテゴリー）
// ============================================
document.addEventListener("click", e => {
  if (e.target.classList.contains("shop-tab")) {
    sortAndRender(e.target.dataset.sort);
  }

  if (e.target.classList.contains("category-tab")) {
    document.querySelectorAll(".category-tab")
      .forEach(c => c.classList.remove("active"));

    e.target.classList.add("active");
    filterByCategory(e.target.dataset.category);
  }
});

// ============================================
// 初期表示
// ============================================
async function start() {
  items = await loadCSV();
  viewItems = [...items];
  renderCategoryTabs();
  sortAndRender("new");
}

document.addEventListener("DOMContentLoaded", start);

function animateCards() {
  const cards = document.querySelectorAll(".item-card");
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add("show");
    }, i * 60); // ← 少しずつズラして出す（60ms刻み）
  });
}

// ダークモード（現状維持）
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "😆";
}
