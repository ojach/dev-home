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
function applyFilters() {
  const cat = document.getElementById("filter-category").value;
  const author = document.getElementById("filter-author").value;
  const price = document.getElementById("filter-price").value;
  const sort = document.querySelector(".tab.active").dataset.sort;

  let filtered = allItems.slice();

  // --- 絞り込み ---
  if (cat !== "all") filtered = filtered.filter(i => i.category === cat);
  if (author !== "all") filtered = filtered.filter(i => i.author === author);

  if (price === "free") filtered = filtered.filter(i => i.price == 0);
  if (price === "under500") filtered = filtered.filter(i => i.price <= 500);
  if (price === "over500") filtered = filtered.filter(i => i.price >= 500);

  // --- オススメモード特殊処理 ---
  if (sort === "random") {
    const randomPick = (arr, n) => arr.sort(() => Math.random() - 0.5).slice(0, n);

    // 他の条件に応じたブレンド処理
    if (author !== "all") {
      viewItems = randomPick(filtered, 10); // 作者内ランダム
    } else if (cat !== "all") {
      viewItems = randomPick(filtered, 10); // カテゴリ内ランダム
    } else if (price !== "all") {
      viewItems = randomPick(filtered, 10); // 価格帯内ランダム
    } 
    // 🆕 オススメ＋新着 / 人気
    else if (lastSortMode === "new") {
      const newest = allItems.sort((a,b)=>b.date - a.date).slice(0, 10);
      const randoms = randomPick(allItems, 5);
      viewItems = [...newest, ...randoms];
    } else if (lastSortMode === "fav") {
      const popular = allItems.sort((a,b)=>(b.favCount||0)-(a.favCount||0)).slice(0, 10);
      const randoms = randomPick(allItems, 5);
      viewItems = [...popular, ...randoms];
    } else {
      // 完全ランダム
      viewItems = randomPick(allItems, 15);
    }

    // 表示数制限（安全）
    if (viewItems.length > 30) viewItems = viewItems.slice(0, 30);

    renderShop();
    return;
  }

  // --- 通常ソート ---
  if (sort === "new") filtered.sort((a,b)=>b.date - a.date);
  if (sort === "fav") filtered.sort((a,b)=>(b.favCount||0)-(a.favCount||0));

  viewItems = filtered.slice(0, 30);
  renderShop();

  // 🔄 現在の並びを記憶しておく（オススメ用）
  lastSortMode = sort;
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

    // ✅ DBのカウントを反映
    data.forEach(fav => {
      const el = document.getElementById(`fav-${fav.id}`);
      if (el) el.textContent = fav.count;
    });

    // ✅ ローカルで押したハートを再描画
    document.querySelectorAll(".fav-btn").forEach(btn => {
      const id = btn.dataset.id;
      const favKey = `fav_${id}`;
      if (localStorage.getItem(favKey)) {
        btn.style.color = "#ff4b7d";
        btn.textContent = "❤️";
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
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = "";

viewItems.forEach(item => {
  // 🩷 IDのキーを安全に拾う
  const itemId = item.itemId || item.id || item.ID;
  const favKey = `fav_${itemId}`;
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
      <span class="fav-btn" data-id="${itemId}" style="color:${isFav ? '#ff4b7d' : '#999'}">
        ${isFav ? "❤️" : "♡"}
      </span>
      <span class="fav-count" id="fav-${itemId}">0</span>
    </div>

    <div class="item-author">
      by <a href="/OJapp/shop/author/?name=${encodeURIComponent(item.author)}"
            class="author-link">${item.author}</a>
    </div>
  `;

  // ✅ 商品クリックで商品ページへ（ハート除外）
  card.addEventListener("click", (e) => {
    if (e.target.classList.contains("fav-btn")) return;
    sessionStorage.setItem("ojapp_scroll_position", window.scrollY);
    location.href = `/OJapp/shop/product/?id=${itemId}`;
  });

  grid.appendChild(card);
});


  // ✅ カードのフェードイン
  animateCards();

  // ✅ 少し待ってからお気に入りデータを反映
  setTimeout(() => {
    console.log("🩷 loadFavorites 実行中");
    loadFavorites().then(() => {
      console.log("✅ お気に入り反映完了");
    });
  }, 500);
}

  // ✅ お気に入りボタン登録
  const favButtons = document.querySelectorAll(".fav-btn");
  favButtons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = e.target.dataset.id;
      const favKey = `fav_${id}`;

      // ✅ すでに押したことあるならスキップ
      if (localStorage.getItem(favKey)) {
        alert("もうお気に入り済みです❤️");
        return;
      }

      try {
        const res = await fetch("https://ojshop-fav.trc-wasps.workers.dev", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id })
        });

        const data = await res.json();
        document.getElementById(`fav-${id}`).textContent = data.count;

        // ✅ 押した記録を保存
        localStorage.setItem(favKey, "true");

        // ✅ ハート見た目変更
        e.target.classList.add("active");
        e.target.textContent = "❤️";
      } catch (err) {
        console.error("お気に入り失敗:", err);
      }
    });
});
  // ✅ お気に入り数を読み込み
  loadFavorites();


// ================================
// 今日のおすすめ（常時2件・カードクリックで遷移）
// ================================
function renderRecommend() {
  if (items.length < 2) return;

  const box = document.getElementById("recommend-box");
  if (!box) return;

  // ★ 2件ランダム選出
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 2);

  box.innerHTML = selected.map(item => {
    const thumb = item.thumbnail || "/OJapp/shop/noimage.png";
    const authorIcon = `/OJapp/shop/author/${item.author}.png`;

    return `
      <div class="recommend-item" data-id="${item.itemId}">
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

  // ✅ 各カードクリックで商品ページへ
  box.querySelectorAll(".recommend-item").forEach(card => {
    card.addEventListener("click", () => {
      const id = card.dataset.id;
      sessionStorage.setItem("ojapp_scroll_position", window.scrollY);
      location.href = `/OJapp/shop/product/?id=${id}`;
    });
  });
}

fetch("https://ojshop-fav.trc-wasps.workers.dev", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ id: "1" })
})
  .then(r => r.text())
  .then(console.log);

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
function updateThemeIcon() {
  const button = document.querySelector(".switch");
  if (!button) return;

  if (document.documentElement.classList.contains("dark")) {
    button.textContent = "🌙";
  } else {
    button.textContent = "🤩";
  }
}
