// shop/app.js ver.1.0 最新
// ================================
// 設定
// ================================

let items = [];      // 全商品
let viewItems = [];  // 表示商品のフィルタ後リスト

let currentSort = "new"; 
let currentAuthor = "全て";
let currentCategory = "全て";
let lastSortMode = "new";
let randomCache = null;


async function loadItems() {
  const res = await fetch("/shop/api/items");
  if (!res.ok) throw new Error("items fetch failed");
  return await res.json();
}



// ================================
// フィルター生成（動的）
// ================================
function renderDynamicFilters() {
  // カテゴリ一覧を収集
  const categories = new Set(["全て"]);
  const authors = new Set(["全て"]);

  items.forEach(i => {
    if (i.category) categories.add(i.category);
    if (i.author) authors.add(i.author);
  });

  const categorySelect = document.getElementById("filter-category");
  const authorSelect = document.getElementById("filter-author");
  const priceSelect = document.getElementById("filter-price");

  // 🔄 既存内容リセット
  categorySelect.innerHTML = "";
  authorSelect.innerHTML = "";
  priceSelect.innerHTML = "";

  // ✅ カテゴリー
  [...categories].forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat === "全て" ? "all" : cat;
    opt.textContent = cat;
    if (cat === currentCategory) opt.selected = true;
    categorySelect.appendChild(opt);
  });

  // ✅ 作者
  [...authors].forEach(a => {
    const opt = document.createElement("option");
    opt.value = a === "全て" ? "all" : a;
    opt.textContent = a;
    if (a === currentAuthor) opt.selected = true;
    authorSelect.appendChild(opt);
  });

  // ✅ 価格帯（固定3種＋全て）
  const prices = [
    { value: "all", text: "全価格帯" },
    { value: "free", text: "無料" },
    { value: "under500", text: "〜¥500" },
    { value: "over500", text: "¥500〜" }
  ];
  prices.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.value;
    opt.textContent = p.text;
    priceSelect.appendChild(opt);
  });
}


// ================================
// ソート
// ================================
function applyFilters() {
  const cat = document.getElementById("filter-category").value;
  const author = document.getElementById("filter-author").value;
  const price = document.getElementById("filter-price").value;

  const activeTab = document.querySelector(".shop-tab.active");
  const sort = activeTab ? activeTab.dataset.sort : "new";

  let filtered = items.slice();   // ← 正しい。items を壊さない。

  // === 絞り込み ===
  if (cat !== "all") filtered = filtered.filter(i => i.category === cat);
  if (author !== "all") filtered = filtered.filter(i => i.author === author);

  if (price === "free") filtered = filtered.filter(i => i.price == 0);
  if (price === "under500") filtered = filtered.filter(i => i.price <= 500);
  if (price === "over500") filtered = filtered.filter(i => i.price >= 500);

  // =====================================================
  // 🔥 ソート部分（全部再構築した正しいバージョン）
  // =====================================================

  // 完全ランダムシャッフル（Fisher–Yates）
  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

// sort が random 以外ならキャッシュ破棄
if (sort !== "random") {
  randomCache = null;
}

// === 🎲 おすすめ＝ランダム20件 ===
if (sort === "random") {
   // 🛡 Safari保険：0件ガード
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

  // === 🆕 新着順 ===
  if (sort === "new") {
    filtered.sort((a, b) => b.date - a.date);
  }

  // === ❤️ 人気順 ===
  if (sort === "fav") {
    filtered.sort((a, b) => (b.favCount || 0) - (a.favCount || 0));
  }

  // 表示は常に20件
  viewItems = filtered.slice(0, 20);

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
// DBからお気に入り数を取得して反映
// ================================
async function loadFavorites() {
  try {
    const res = await fetch("https://ojshop-fav.trc-wasps.workers.dev");
    const data = await res.json();

    // DBの favCount を items に反映（人気順用）
    data.forEach(fav => {
      const item = items.find(i => i.product_id === fav.id);
      if (item) item.favCount = Number(fav.count);
    });

    // 表示中の fav 数を更新
    data.forEach(fav => {
  const el = document.getElementById(`fav-${fav.id}`);
  const btn = document.querySelector(`.fav-btn[data-id="${fav.id}"]`);

  if (el) el.textContent = fav.count;
  if (btn && fav.count > 0) {
    btn.textContent = "❤️";
    btn.style.color = "#ff4b7d";
  }
});

    // localStorage（v2）を元にハート再描画
    document.querySelectorAll(".fav-btn").forEach(btn => {
      const id = btn.dataset.id;
      const favKey = `fav_${FAV_VERSION}_${id}`;
      if (localStorage.getItem(favKey)) {
        btn.textContent = "❤️";
        btn.style.color = "#ff4b7d";
      }
    });
  } catch (err) {
    console.error("お気に入り数の取得失敗:", err);
  }
}


// ================================
// 商品グリッドの描画
// ================================
function renderShop() {
  const isFav = false; // 初期はDB基準にしない
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = "";

  viewItems.forEach(item => {
    const productId = item.product_id;
    const favKey = `fav_${FAV_VERSION}_${productId}`;
    const isFav = localStorage.getItem(favKey);

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
      <div class="item-price-line">
        <span class="item-price">¥${item.price}</span>
       <span class="fav-btn" data-id="${productId}" style="color:#999">♡</span>
<span class="fav-count" id="fav-${productId}">0</span>

      <div class="item-author">
        by <a href="/OJapp/shop/author/?name=${encodeURIComponent(item.author)}"
              class="author-link">${item.author}</a>
      </div>
    `;

    // 商品クリック（fav除外）
    card.addEventListener("click", e => {
      if (e.target.classList.contains("fav-btn")) return;
      sessionStorage.setItem("ojapp_scroll_position", window.scrollY);
      location.href = `/OJapp/shop/product/?id=${productId}`;
    });

    // favクリック
    card.querySelector(".fav-btn").addEventListener("click", async e => {
      e.stopPropagation();
      const id = e.target.dataset.id;
      const key = `fav_${FAV_VERSION}_${id}`;

      if (localStorage.getItem(key)) return;

      try {
        const res = await fetch("https://ojshop-fav.trc-wasps.workers.dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });

        const data = await res.json();
        document.getElementById(`fav-${id}`).textContent = data.count;

        localStorage.setItem(key, "true");
        e.target.textContent = "❤️";
        e.target.style.color = "#ff4b7d";
      } catch (err) {
        console.error("お気に入り失敗:", err);
      }
    });

    grid.appendChild(card);
  });

  animateCards();




}

// ================================
// 今日のおすすめ（常時2件・カードクリックで遷移）
// ================================
function renderRecommend() {
  const box = document.getElementById("recommend-box");
  if (!box) return;

  // ★ 2件ランダム選出
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2);

  box.innerHTML = selected.map(item => {
    const thumb = item.thumbnail || "/OJapp/shop/noimage.png";
    const authorIcon = `/OJapp/shop/author/${item.author}.png`;

    return `
      <div class="recommend-item" data-id="${item.product_id}">
        <div class="item-thumb-box">
          <img src="${thumb}" class="recommend-thumb">
          <img src="${authorIcon}" class="author-icon">
        </div>

        <div class="recommend-title">${item.title}</div>

        <div class="recommend-author">
          by <a href="/OJapp/shop/author/?name=${encodeURIComponent(item.author)}"
                class="author-link">${item.author}</a>
        </div>
      </div>
    `;
  }).join("");

  // クリックで商品ページへ
  box.querySelectorAll(".recommend-item").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      sessionStorage.setItem("ojapp_scroll_position", window.scrollY);
      location.href = `/OJapp/shop/product/?id=${id}`;
    });
  });
}

// ================================
// クリックイベント（タブ & カテゴリー）
// ================================
document.addEventListener("click", e => {
  if (e.target.classList.contains("shop-tab")) {
    document.querySelectorAll(".shop-tab").forEach(t => t.classList.remove("active"));
    e.target.classList.add("active");
    randomCache = null;
    applyFilters();
  }
});

//横スクロールおすすめ帯
function renderRecommendMore() {
 const box = document.getElementById("recommend-more");
  if (!box) return;

  const selected = [...items].sort(() => Math.random() - 0.5).slice(0, 5);

  box.innerHTML = selected.map(item => `
    <div class="recommend-more-item" data-id="${item.product_id}">
      <img src="${item.thumbnail}" class="recommend-more-thumb">
      <div class="recommend-more-title">${item.title}</div>
      <div class="recommend-more-author">by ${item.author}</div>
    </div>
  `).join("");

  // クリックで商品ページへ
  box.querySelectorAll(".recommend-more-item").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      sessionStorage.setItem("ojapp_scroll_position", window.scrollY);
      location.href = `/OJapp/shop/product/?id=${id}`;
    });
  });
}



// ================================
// 初期起動（itemId 自動生成版）
// ================================
async function start() {
  items = await loadItems();   // ← ここだけ

  viewItems = [...items];

  renderRecommend();
  renderDynamicFilters();
  applyFilters();
  renderRecommendMore();
  await loadFavorites();
}

// ================================
// ダークモードスイッチ
// ================================
function updateThemeIcon() {
  const button = document.querySelector(".switch");
  if (!button) return;

  if (document.documentElement.classList.contains("dark")) {
    button.textContent = "🌙";
  } else {
    button.textContent = "🤩";
  }
}
