// ============================================
// OJapp Shop 2025-12-19 最新安定版（D1対応）
// ============================================

// ----------------------
// 設定
// ----------------------
const FAV_VERSION = "v2";
let items = [];
let viewItems = [];

let currentSort = "new";
let randomCache = null;

const API_BASE = "https://ojshop-fav.trc-wasps.workers.dev";


// ============================================
// D1から商品一覧取得
// ============================================
async function loadItems() {
  const res = await fetch(`${API_BASE}/shop/api/items`);
  if (!res.ok) throw new Error("items fetch failed");
  return await res.json();
}



// ============================================
// フィルター生成
// ============================================
function renderDynamicFilters() {
  const categories = new Set(["all"]);
  const authors = new Set(["all"]);

  items.forEach(i => {
    if (i.category) categories.add(i.category);
    if (i.author) authors.add(i.author);
  });

  const category = document.getElementById("filter-category");
  const author = document.getElementById("filter-author");
  const price = document.getElementById("filter-price");

  category.innerHTML = "";
  author.innerHTML = "";
  price.innerHTML = "";

  [...categories].forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c === "all" ? "全て" : c;
    category.appendChild(opt);
  });

  [...authors].forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a === "all" ? "全て" : a;
    author.appendChild(opt);
  });

  [
    ["all", "全価格帯"],
    ["free", "無料"],
    ["under500", "〜¥500"],
    ["over500", "¥500〜"],
  ].forEach(([v, t]) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = t;
    price.appendChild(opt);
  });
}



// ============================================
// ソート ＆ 絞り込み
// ============================================
async function applyFilters() {
  const activeTab = document.querySelector(".shop-tab.active");
  const sort = activeTab ? activeTab.dataset.sort : "new";

  const API = `${API_BASE}/shop/api/items`;

  let sortKey = sort;
  if (sort === "fav") sortKey = "popular";
  if (sort === "random") sortKey = "recommended";

  const res = await fetch(`${API}?sort=${sortKey}`);
  const data = await res.json();

  viewItems = data.slice(0, 20);
  renderShop();
}

document.querySelectorAll(".shop-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".shop-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    applyFilters();
  });
});



// ============================================
// モーダル
// ============================================
function openModal(item) {
  const modal = document.getElementById("item-modal");
  document.getElementById("modal-thumb").src = item.thumbnail;
  document.getElementById("modal-title").textContent = item.title;
  document.getElementById("modal-author").textContent = `作者: ${item.author}`;
  document.getElementById("modal-category").textContent = `カテゴリー: ${item.category}`;
  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("item-modal").classList.add("hidden");
}



// ============================================
// フェードインアニメ
// ============================================
function animateCards() {
  const cards = document.querySelectorAll(".item-card");
  cards.forEach((card, i) => {
    setTimeout(() => card.classList.add("show"), i * 60);
  });
}



// ============================================
// お気に入りロード
// ============================================
function loadFavorites() {
  document.querySelectorAll(".fav-btn").forEach(btn => {
    const id = btn.dataset.id;
    const key = `fav_${FAV_VERSION}_${id}`;
    if (localStorage.getItem(key)) {
      btn.textContent = "❤️";
      btn.style.color = "#ff4b7d";
    }
  });
}



// ============================================
// 商品一覧レンダー（修正版）
// ============================================
async function renderShop() {
  const API = API_BASE;

  const res = await fetch(`${API}/shop/api/items`);
  const items = await res.json();

  // ★ 修正：IDを shop-grid → shop-list に統一
  const grid = document.getElementById("shop-list");
  grid.innerHTML = "";

  items.forEach(item => {
    const thumb = `${API}/shop/r2/${item.thumbnail}`;
    const icon  = `${API}/shop/r2/authors/${item.author_key}.png`;

    const card = document.createElement("div");
    card.className = "item-card";
    card.innerHTML = `
      <div class="item-thumb-box">
        <img src="${thumb}" class="item-thumb">
        <img src="${icon}" class="author-icon">
      </div>

      <div class="item-title">${item.title}</div>

      <div class="item-meta">
        <div class="item-price">${item.price}円</div>
        <div class="item-author">${item.author}</div>
      </div>
    `;

    card.addEventListener("click", () => {
      location.href = \`/OJapp/shop/product/?id=\${item.product_id}\`;
    });

    grid.appendChild(card);

    requestAnimationFrame(() => {
      card.classList.add("show");
    });
  });
}



// ============================================
// 推しアイテム 2件（修正版）
// ============================================
async function renderRecommend() {
  const API = API_BASE;
  const res = await fetch(`${API}/shop/api/items?sort=recommended`);
  const items = await res.json();

  // ★ 修正：recommend-box → recommend-list
  const box = document.getElementById("recommend-list");
  box.innerHTML = "";

  items.slice(0, 2).forEach(item => {
    const thumb = `${API}/shop/r2/${item.thumbnail}`;
    const icon = `${API}/shop/r2/authors/${item.author_key}.png`;

    const div = document.createElement("div");
    div.className = "recommend-item";
    div.innerHTML = `
      <img src="${thumb}" class="recommend-thumb">
      <div class="recommend-title">${item.title}</div>
      <div class="recommend-author">
        <img src="${icon}" class="recommend-author-icon"> ${item.author}
      </div>
    `;

    div.addEventListener("click", () => {
      location.href = \`/OJapp/shop/product/?id=\${item.product_id}\`;
    });

    box.appendChild(div);
  });
}



// ============================================
// 横スクロール（人気 / おすすめ）
// ============================================
async function loadScrollRows() {
  const API = API_BASE;

  const popularRes = await fetch(`${API}/shop/api/items?sort=views`);
  const popular = await popularRes.json();

  document.getElementById("scroll-popular").innerHTML =
    popular.map(item => {
      const thumb = item.thumbnail
        ? `${API}/shop/r2/${item.thumbnail}`
        : "/OJapp/shop/noimage.png";

      return `
        <div class="scroll-item"
             onclick="location.href='/OJapp/shop/product/?id=${item.product_id}'">
          <img src="${thumb}" class="scroll-thumb">
          <div class="scroll-title-text">${item.title}</div>
        </div>
      `;
    }).join("");


  const recRes = await fetch(`${API}/shop/api/items?sort=recommended`);
  const rec = await recRes.json();

  document.getElementById("scroll-recommend").innerHTML =
    rec.map(item => {
      const thumb = item.thumbnail
        ? `${API}/shop/r2/${item.thumbnail}`
        : "/OJapp/shop/noimage.png";

      return `
        <div class="scroll-item"
             onclick="location.href='/OJapp/shop/product/?id=${item.product_id}'">
          <img src="${thumb}" class="scroll-thumb">
          <div class="scroll-title-text">${item.title}</div>
        </div>
      `;
    }).join("");
}

loadScrollRows();



// ============================================
// 初期起動
// ============================================
async function start() {
  items = await loadItems();
  viewItems = [...items];

  renderRecommend();
  renderDynamicFilters();
  applyFilters();
  await loadFavorites();
  renderShop();
}

document.addEventListener("DOMContentLoaded", start);



// ============================================
// ダークモード
// ============================================
function updateThemeIcon() {
  const button = document.querySelector(".switch");
  if (!button) return;
  button.textContent = document.documentElement.classList.contains("dark")
    ? "🌙"
    : "🤩";
}
