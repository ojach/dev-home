console.log("JS読み込み開始");

// ================================
// 設定
// ================================
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
  "visible": "visible",
  "価格": "price"
};

let items = [];      // 全商品
let viewItems = [];  // 表示商品のフィルタ後リスト

let currentSort = "new";      
let currentCategory = "全て";


// ================================
// CSV読み込み
// ================================
async function loadCSV() {
  const res = await fetch(CSV_URL);
  const text = await res.text();

  const rows = text.split("\n").map(r => r.split(","));
  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);

  return rows
    .map(cols => {
      const obj = {};
      cols.forEach((val, i) => {
        obj[headers[i]] = val.replace(/"/g, "").trim();
      });
      return obj;
    })
    .filter(item => item.visible !== "FALSE");
}


// ================================
// カテゴリータブ表示
// ================================
function renderCategoryTabs() {
  const categories = ["全て"];

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

    if (cat === currentCategory) div.classList.add("active");

    catArea.appendChild(div);
  });
}


// ================================
// カテゴリーフィルター
// ================================
function filterByCategory(category) {
  currentCategory = category;

  if (category === "全て") {
    viewItems = [...items];
  } else {
    viewItems = items.filter(i => i.category === category);
  }

  sortAndRender(currentSort);
}


// ================================
// ソート
// ================================
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

  document.querySelectorAll(".shop-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.sort === type);
  });

  renderShop();
}


// ================================
// モーダル
// ================================
function openModal(item) {
  const modal = document.getElementById("item-modal");

  document.getElementById("modal-thumb").src = item.thumbnail || "/OJapp/shop/noimage.png";
  document.getElementById("modal-title").textContent = item.title;
  document.getElementById("modal-author").textContent = `作者: ${item.author}`;
  document.getElementById("modal-category").textContent = `カテゴリー: ${item.category}`;
  document.getElementById("modal-link").href = item.boothUrl;

  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("item-modal").classList.add("hidden");
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("modal-bg")) closeModal();
  if (e.target.classList.contains("modal-close")) closeModal();
});

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeModal();
});


// ================================
// ふわっとアニメ
// ================================
function animateCards() {
  const cards = document.querySelectorAll(".item-card");
  cards.forEach((card, i) => {
    setTimeout(() => {
      card.classList.add("show");
    }, i * 60);
  });
}


// ================================
// 商品リスト描画
// ================================
function renderShop() {
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = "";

viewItems.forEach(item => {
  const thumb = item.thumbnail || "/OJapp/shop/noimage.png";
  const authorIcon = `/OJapp/shop/author/${item.author}.png`;

  const card = document.createElement("div");
  card.className = "item-card";

card.innerHTML = `
  <div class="item-thumb-box">
    <img src="${thumb}" class="item-thumb">
    <img src="${authorIcon}" class="author-icon"
         onclick="location.href='/OJapp/shop/author/?name=${encodeURIComponent(item.author)}'">
  </div>

  <div class="item-title">${item.title}</div>

  <div class="item-meta">
    <span class="item-price">¥${item.price}</span>
    <span class="item-author">
      by <a href="/OJapp/shop/author/?name=${encodeURIComponent(item.author)}"
            class="author-link">${item.author}</a>
    </span>
  </div>
`;


  // ✅ ここが正しい位置！（ループの中）
  card.addEventListener("click", () => {
    sessionStorage.setItem("ojapp_scroll_position", window.scrollY);
    location.href = `/OJapp/shop/product/?id=${item.itemId}`;
  });

  grid.appendChild(card);
}); // ← ここでループが閉じる

animateCards();
}

// ================================
// 今日のおすすめ
// ================================
function renderRecommend() {
  if (items.length <= 1) return;

  const box = document.getElementById("recommend-box");
  if (!box) return;

  const randomItem = items[Math.floor(Math.random() * items.length)];

  const thumb = randomItem.thumbnail || "/OJapp/shop/noimage.png";
  const authorIcon = `/OJapp/shop/author/${randomItem.author}.png`;

  box.innerHTML = `
    <div class="item-thumb-box">
      <img src="${thumb}" class="recommend-thumb">
      <img src="${authorIcon}" class="author-icon">
    </div>

    <div class="recommend-title">${randomItem.title}</div>

    <div class="recommend-author">
      by <a href="/OJapp/shop/author/?name=${encodeURIComponent(randomItem.author)}"
            class="author-link">${randomItem.author}</a>
    </div>
  `;
}


// ================================
// クリックイベント（タブ & カテゴリー）
// ================================
document.addEventListener("click", e => {
  if (e.target.classList.contains("shop-tab")) {
    sortAndRender(e.target.dataset.sort);
  }

  if (e.target.classList.contains("category-tab")) {
    document.querySelectorAll(".category-tab").forEach(c => c.classList.remove("active"));
    e.target.classList.add("active");
    filterByCategory(e.target.dataset.category);
  }
});


// ================================
// 初期起動（itemId 自動生成版）
// ================================
async function start() {
  items = await loadCSV();

  // ★ itemId を自動生成（1,2,3,...）
  items = items.map((item, index) => ({
    ...item,
    itemId: String(index + 1),
  }));

  viewItems = [...items];

  renderRecommend();
  renderCategoryTabs();
  sortAndRender("new");
}

document.addEventListener("DOMContentLoaded", start);


// ================================
// ダークモードスイッチ
// ================================
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "🤩";
}
