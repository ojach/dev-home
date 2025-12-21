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
async function applyFilters() {
  const activeTab = document.querySelector(".shop-tab.active");
  const sort = activeTab ? activeTab.dataset.sort : "new";

  const API = "https://ojshop-fav.trc-wasps.workers.dev/shop/api/items";

  // sort="fav" は Workers では "popular"
  // sort="random" は "recommended"
  let sortKey = sort;
  if (sort === "fav") sortKey = "popular";
  if (sort === "random") sortKey = "recommended";

  // Workers APIを叩く！
  const res = await fetch(`${API}?sort=${sortKey}`);
  const data = await res.json();

  // data は items の配列
  viewItems = data.slice(0, 20);
  renderShop();
}
document.querySelectorAll(".shop-tab").forEach(tab => {
  tab.addEventListener("click", () => {

    // active入れ替え
    document.querySelectorAll(".shop-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    // ソート再実行
    applyFilters();
  });
});



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
function loadFavorites() {

  // 各商品の♡状態を復元
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

    card.querySelector(".fav-btn").addEventListener("click", async e => {
  e.stopPropagation();
  const key = `fav_${FAV_VERSION}_${id}`;

  // 連続押し禁止
  if (localStorage.getItem(key)) return;

  // お気に入りAPIへPOST
  const res = await fetch("https://ojshop-fav.trc-wasps.workers.dev/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  });

  const data = await res.json();

  // ハート数を反映
  document.getElementById(`fav-${id}`).textContent = data.count;

  // ローカル保存（押した記録）
  localStorage.setItem(key, "true");

  // ボタンを赤く
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
async function renderRecommend() {

  const box = document.getElementById("recommend-box");
  if (!box) return;

  const API = "https://ojshop-fav.trc-wasps.workers.dev/shop/api/items";

  // Workers API（ランダム）
  const res = await fetch(`${API}?sort=recommended`);
  const data = await res.json();

  // 上位2件を使用
  const selected = data.slice(0, 2);

  box.innerHTML = selected.map(i => `
    <div class="recommend-item" data-id="${i.product_id}">
      <img src="${i.thumbnail}" class="recommend-thumb">
      <div class="recommend-title">${i.title}</div>
      <div class="recommend-author">by ${i.author}</div>
    </div>
  `).join("");

  // クリックで商品ページへ
  box.querySelectorAll(".recommend-item").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      location.href = `/OJapp/shop/product/?id=${id}`;
    });
  });
}

renderRecommend();

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
