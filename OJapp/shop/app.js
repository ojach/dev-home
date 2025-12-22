// ============================================
// OJapp Shop 2025-12-22 完全安定版（D1 + R2対応）
// ============================================

const API_BASE = "https://ojshop-fav.trc-wasps.workers.dev";
const FAV_VERSION = "v2";

let items = [];     // 全商品
let viewItems = []; // フィルタ後表示商品


// ===============================
// 商品一覧を Workers から取得
// ===============================
async function loadItems() {
  const res = await fetch(`${API_BASE}/shop/api/items`);
  return await res.json();
}

function loadFavorites() {
  document.querySelectorAll(".fav-btn").forEach(btn => {
    const id = btn.dataset.id;
    const key = `fav_${id}`;

    if (localStorage.getItem(key)) {
      btn.classList.add("active");
    }
  });
}


// ===============================
// 推しアイコン（2件）
// ===============================
async function renderRecommend() {
  const res = await fetch(`${API_BASE}/shop/api/items?sort=recommended`);
  const data = await res.json();

  const box = document.getElementById("recommend-box");
  if (!box) return;

  box.innerHTML = "";

  data.slice(0, 2).forEach(item => {
    const thumb = `${API_BASE}/shop/r2/${item.thumbnail}`;
    const icon  = `${API_BASE}/shop/r2/authors/${item.author_key}.png`;

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
      location.href = `/OJapp/shop/product/?id=${item.product_id}`;
    });

    box.appendChild(div);
  });
}



// ===============================
// フィルターUI 詰め込み
// ===============================
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

  if (!category) return;

  category.innerHTML = "";
  author.innerHTML = "";
  price.innerHTML = "";

  [...categories].forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c === "all" ? "全て" : c;
    category.appendChild(o);
  });

  [...authors].forEach(a => {
    const o = document.createElement("option");
    o.value = a;
    o.textContent = a === "all" ? "全て" : a;
    author.appendChild(o);
  });

  [
    ["all", "全価格帯"],
    ["free", "無料"],
    ["under500", "〜¥500"],
    ["over500", "¥500〜"],
  ].forEach(([v, t]) => {
    const o = document.createElement("option");
    o.value = v;
    o.textContent = t;
    price.appendChild(o);
  });
}



// ===============================
// 絞り込み ＆ ソート
// ===============================
async function applyFilters() {
  const activeTab = document.querySelector(".shop-tab.active");
  let sort = activeTab ? activeTab.dataset.sort : "new";

  // Workers用変換
  if (sort === "fav") sort = "popular";
  if (sort === "random") sort = "recommended";

  const res = await fetch(`${API_BASE}/shop/api/items?sort=${sort}`);
  const data = await res.json();

  viewItems = data.slice(0, 40);
  renderShop();
}



// ===============================
// 商品グリッド描画
// ===============================
async function renderShop() {
  const grid = document.getElementById("shop-list");
  if (!grid) return;

  grid.innerHTML = "";

  viewItems.forEach(item => {
    const thumb = `${API_BASE}/shop/r2/${item.thumbnail}`;
    const icon  = `${API_BASE}/shop/r2/authors/${item.author_key}.png`;

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
      <div class="fav-zone">
  <span class="fav-btn" data-id="${item.product_id}" onclick="toggleFav(this)">🤍</span>
  <span class="fav-count" data-id="${item.product_id}">
    ${item.favorite_count ?? 0}
  </span>
</div>
    `;
card.querySelector(".fav-btn").addEventListener("click", (e) => {
  e.stopPropagation();  // カードの遷移を止める

  const btn = e.target;
  const id = btn.dataset.id;
  const key = `fav_${FAV_VERSION}_${id}`;

  if (localStorage.getItem(key)) {
    localStorage.removeItem(key);
    btn.textContent = "🤍";
    btn.style.color = "#aaa";
  } else {
    localStorage.setItem(key, "1");
    btn.textContent = "❤️";
    btn.style.color = "#ff4b7d";
  }
});

    card.addEventListener("click", () => {
      location.href = `/OJapp/shop/product/?id=${item.product_id}`;
    });

    grid.appendChild(card);

    requestAnimationFrame(() => card.classList.add("show"));
  });
}



// ===============================
// 人気・おすすめ 横スクロール
// ===============================
async function loadScrollRows() {

  // 人気（閲覧数順）
  {
    const res = await fetch(`${API_BASE}/shop/api/items?sort=views`);
    const data = await res.json();

    const wrap = document.getElementById("scroll-popular");
    if (wrap) {
      wrap.innerHTML = data.map(item => {
        const thumb = `${API_BASE}/shop/r2/${item.thumbnail}`;
        return `
          <div class="scroll-item"
               onclick="location.href='/OJapp/shop/product/?id=${item.product_id}'">
            <img src="${thumb}" class="scroll-thumb">
            <div class="scroll-title-text">${item.title}</div>
          </div>
        `;
      }).join("");
    }
  }

  // おすすめ（ランダム）
  {
    const res = await fetch(`${API_BASE}/shop/api/items?sort=recommended`);
    const data = await res.json();

    const wrap = document.getElementById("scroll-recommend");
    if (wrap) {
      wrap.innerHTML = data.map(item => {
        const thumb = `${API_BASE}/shop/r2/${item.thumbnail}`;
        return `
          <div class="scroll-item"
               onclick="location.href='/OJapp/shop/product/?id=${item.product_id}'">
            <img src="${thumb}" class="scroll-thumb">
            <div class="scroll-title-text">${item.title}</div>
          </div>
        `;
      }).join("");
    }
  }
}
// -------------------------
//   お気に入りボタンAPI
//--------------------------
async function toggleFav(btn) {
  const id = btn.dataset.id;
  const key = `fav_${id}`;

  // ★ すでに押したなら何もせず return
  if (localStorage.getItem(key)) return;

  // 色を変える
  btn.classList.add("active");

  // API に送る（1回だけ加算）
  const res = await fetch(`${API_BASE}/shop/api/fav?id=${id}`, {
    method: "POST",
  });

  const data = await res.json();

  // 数字更新
  const countEl = document.querySelector(`.fav-count[data-id="${id}"]`);
  if (countEl) countEl.textContent = data.favorite_count;

  // ★ ここで「一生押した扱い」にする
  localStorage.setItem(key, "1");
}



// ===============================
// 初期スタート
// ===============================
async function start() {

  items = await loadItems();
  viewItems = [...items];

  renderRecommend();
  renderDynamicFilters();
  applyFilters();
  loadScrollRows();
}



// ===============================
// ソートタブ
// ===============================
document.querySelectorAll(".shop-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".shop-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    applyFilters();
  });
});



document.addEventListener("DOMContentLoaded", start);
