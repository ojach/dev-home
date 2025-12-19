// shop/app.js ver.1.0 最新
// ================================
// 設定
// ================================
const FAV_VERSION = "v2";
let items = [];      // 全商品
let viewItems = [];  // 表示商品のフィルタ後リスト

let currentSort = "new"; 
let currentAuthor = "全て";
let currentCategory = "全て";
let lastSortMode = "new";
let randomCache = null;


// ================================
// D1から商品一覧を取得
// ================================
async function loadItems() {
  const res = await fetch("/shop/api/items");
  if (!res.ok) throw new Error("items fetch failed");
  return await res.json();   // ← D1 JSON
}



// ================================
// フィルター生成
// ================================
function renderDynamicFilters() {
  const categories = new Set(["all"]);
  const authors = new Set(["all"]);

  items.forEach(i => {
    if (i.category) categories.add(i.category);
    if (i.author) authors.add(i.author);
  });

  // DOM
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

// ================================
// 絞り込み＋ソート
// ================================
function applyFilters() {
  const cat = document.getElementById("filter-category").value;
  const author = document.getElementById("filter-author").value;
  const price = document.getElementById("filter-price").value;
  const activeTab = document.querySelector(".shop-tab.active");
  const sort = activeTab ? activeTab.dataset.sort : "new";

  let filtered = items.slice();

  if (cat !== "all")    filtered = filtered.filter(i => i.category === cat);
  if (author !== "all") filtered = filtered.filter(i => i.author === author);

  if (price === "free")      filtered = filtered.filter(i => i.price == 0);
  if (price === "under500")  filtered = filtered.filter(i => i.price <= 500);
  if (price === "over500")   filtered = filtered.filter(i => i.price >= 500);

  // ランダム
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // random以外ならキャッシュ消える
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

  // 新着順（created_at）
  if (sort === "new") {
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  // 人気順（favCount）
  if (sort === "fav") {
    filtered.sort((a, b) => (b.favCount || 0) - (a.favCount || 0));
  }

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
// お気に入りのロード
// ================================
async function loadFavorites() {
  try {
    const res = await fetch("https://ojshop-fav.trc-wasps.workers.dev");
    const data = await res.json();

    // items に favCount 反映
    data.forEach(f => {
      const item = items.find(i => i.product_id === f.id);
      if (item) item.favCount = Number(f.count || 0);
    });

    // 表示中の数値も更新
    data.forEach(f => {
      const el = document.getElementById(`fav-${f.id}`);
      if (el) el.textContent = f.count;
    });

    // ローカルの♡を復元
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




// ================================
// 商品一覧描画
// ================================
function renderShop() {
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = "";

  viewItems.forEach(item => {
    const id = item.product_id;
    const key = `fav_${FAV_VERSION}_${id}`;
    const isFav = localStorage.getItem(key);

    const card = document.createElement("div");
    card.className = "item-card";

    const thumb = item.thumbnail || "/OJapp/shop/noimage.png";
    const authorIcon = `/OJapp/shop/author/${item.author}.png`;

    card.innerHTML = `
      <div class="item-thumb-box">
        <img src="${thumb}" class="item-thumb">
        <img src="${authorIcon}" class="author-icon">
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

    // カードクリック
    card.addEventListener("click", e => {
      if (e.target.classList.contains("fav-btn")) return;
      sessionStorage.setItem("ojapp_scroll_position", window.scrollY);
      location.href = `/OJapp/shop/product/?id=${id}`;
    });

    // ♡クリック
    card.querySelector(".fav-btn").addEventListener("click", async e => {
      e.stopPropagation();
      const key = `fav_${FAV_VERSION}_${id}`;

      // 二度押し禁止
      if (localStorage.getItem(key)) return;

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
    });

    grid.appendChild(card);
  });

  loadFavorites();
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
// 初期起動
// ================================
async function start() {
  const res = await fetch("/shop/api/items");
  items = await res.json();  // ← CSVじゃなく API を読む！

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
