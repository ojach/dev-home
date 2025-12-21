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

  // カテゴリー
  [...categories].forEach(c => {
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c === "all" ? "全て" : c;
    category.appendChild(opt);
  });

  // 作者
  [...authors].forEach(a => {
    const opt = document.createElement("option");
    opt.value = a;
    opt.textContent = a === "all" ? "全て" : a;
    author.appendChild(opt);
  });

  // 価格帯
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
function applyFilters() {
  const cat = document.getElementById("filter-category").value;
  const author = document.getElementById("filter-author").value;
  const price = document.getElementById("filter-price").value;
  const activeTab = document.querySelector(".shop-tab.active");
  const sort = activeTab ? activeTab.dataset.sort : "new";

  let filtered = items.slice();

  // 絞り込み
  if (cat !== "all") filtered = filtered.filter(i => i.category === cat);
  if (author !== "all") filtered = filtered.filter(i => i.author === author);
  if (price === "free") filtered = filtered.filter(i => i.price == 0);
  if (price === "under500") filtered = filtered.filter(i => i.price <= 500);
  if (price === "over500") filtered = filtered.filter(i => i.price >= 500);

  // 完全ランダム
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  if (sort !== "random") randomCache = null;

  if (sort === "random") {
    if (!filtered.length) {
      viewItems = [];
      renderShop();
      return;
    }
    if (!randomCache) {
      randomCache = shuffle(filtered).slice(0, 20);
    }
    viewItems = randomCache;
    renderShop();
    return;
  }

  // 新着順
  if (sort === "new") {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // 人気順
  if (sort === "fav") {
    filtered.sort((a, b) => (b.favCount || 0) - (a.favCount || 0));
  }

  viewItems = filtered.slice(0, 20);
  renderShop();
}



// ============================================
// モーダル（使う場合）
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
// 表示アニメ
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
async function loadFavorites() {
  try {
    const res = await fetch(`${API_BASE}/shop/api/items`);
    const data = await res.json();

    // items に favCount を反映
    data.forEach(f => {
      const item = items.find(i => i.product_id === f.id);
      if (item) item.favCount = Number(f.count || 0);
    });

    // 表示中の数値を更新
    data.forEach(f => {
      const el = document.getElementById(`fav-${f.id}`);
      if (el) el.textContent = f.count;
    });

    // ローカル保存された♡を反映
    document.querySelectorAll(".fav-btn").forEach(btn => {
      const id = btn.dataset.id;
      const key = `fav_${FAV_VERSION}_${id}`;
      if (localStorage.getItem(key)) {
        btn.textContent = "❤️";
        btn.style.color = "#ff4b7d";
      }
    });

  } catch (e) {
    console.error("fav load error", e);
  }
}



// ============================================
// 商品グリッド描画
// ============================================
function renderShop() {
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = "";

  viewItems.forEach(item => {
    const id = item.product_id;
    const key = `fav_${FAV_VERSION}_${id}`;
    const isFav = localStorage.getItem(key);

    const thumb = item.thumbnail || "/OJapp/shop/noimage.png";
    const icon = `/OJapp/shop/author/${item.author}.png`;

    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <div class="item-thumb-box">
        <img src="${thumb}" class="item-thumb">
        <img src="${icon}" class="author-icon">
      </div>
      <div class="item-title">${item.title}</div>
      <div class="item-price-line">
        <span class="item-price">¥${item.price}</span>
        <span class="fav-btn" data-id="${id}" style="color:${isFav ? "#ff4b7d" : "#999"}">
          ${isFav ? "❤️" : "♡"}
        </span>
        <span class="fav-count" id="fav-${id}">0</span>
      </div>
      <div class="item-author">by ${item.author}</div>
    `;

    // 商品クリック
    card.addEventListener("click", e => {
      if (e.target.classList.contains("fav-btn")) return;
      sessionStorage.setItem("ojapp_scroll_position", window.scrollY);
      location.href = `/OJapp/shop/product/?id=${id}`;
    });

    // ♡ クリック
    card.querySelector(".fav-btn").addEventListener("click", async e => {
      e.stopPropagation();
      const key = `fav_${FAV_VERSION}_${id}`;

      if (localStorage.getItem(key)) return;

      const res = await fetch(`${API_BASE}/shop/api/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      const data = await res.json();
      document.getElementById(`fav-${id}`).textContent = data.count;
      localStorage.setItem(key, "true");
      e.target.textContent = "❤️";
      e.target.style.color = "#ff4b7d";
    });

    grid.appendChild(card);
  });

  animateCards();
}



// ============================================
// 今日のおすすめ（2件）
// ============================================
function renderRecommend() {
  const box = document.getElementById("recommend-box");
  if (!box) return;

  const selected = [...items].sort(() => Math.random() - 0.5).slice(0, 2);

  box.innerHTML = selected.map(i => `
    <div class="recommend-item" data-id="${i.product_id}">
      <img src="${i.thumbnail}" class="recommend-thumb">
      <div class="recommend-title">${i.title}</div>
      <div class="recommend-author">by ${i.author}</div>
    </div>
  `).join("");

  box.querySelectorAll(".recommend-item").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      location.href = `/OJapp/shop/product/?id=${id}`;
    });
  });
}



// ============================================
// 横スクロールおすすめ
// ============================================
async function loadScrollRows() {

  const API = "https://ojshop-fav.trc-wasps.workers.dev";

  // 人気（閲覧数順）
  const popularRes = await fetch(`${API}/shop/api/items?sort=views`);
  const popular = await popularRes.json();

  document.getElementById("scroll-popular").innerHTML =
    popular.map(item => `
      <div class="scroll-item" onclick="location.href='/OJapp/shop/product/?id=${item.product_id}'">
        <img src="${item.thumbnail}" class="scroll-thumb">
        <div class="scroll-title-text">${item.title}</div>
      </div>
    `).join("");

  // おすすめ（ランダム）
  const recRes = await fetch(`${API}/shop/api/items?sort=recommended`);
  const rec = await recRes.json();

  document.getElementById("scroll-recommend").innerHTML =
    rec.map(item => `
      <div class="scroll-item" onclick="location.href='/OJapp/shop/product/?id=${item.product_id}'">
        <img src="${item.thumbnail}" class="scroll-thumb">
        <div class="scroll-title-text">${item.title}</div>
      </div>
    `).join("");
}

loadScrollRows();



// ============================================
// 初期起動
// ============================================
async function start() {
  items = await loadItems();   // ← D1 API 読み込み
  viewItems = [...items];

  renderRecommend();
  renderDynamicFilters();
  applyFilters();
  await loadFavorites();       // ← 1回だけでOK
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
