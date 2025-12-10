let items = [];
let currentSort = "new";
let currentCategory = "全て";

async function loadAndRender() {
  items = await loadCSV();

  // カテゴリータブ生成
  renderCategoryTabs(getUniqueCategories(items));

  // 初回は新着 & 全て
  applyFilters();
}

/* ------------------------
   並び替えタブ
------------------------ */
function sortItems(type) {
  currentSort = type;

  if (type === "new") {
    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }
  if (type === "score") {
    items.sort((a, b) => Number(b.score) - Number(a.score));
  }
  if (type === "author") {
    items.sort((a, b) => a.author.localeCompare(b.author));
  }

  document.querySelectorAll(".shop-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.sort === type);
  });
}

/* ------------------------
   カテゴリータブ生成
------------------------ */
function renderCategoryTabs(categories) {
  const wrap = document.querySelector(".category-tabs");
  wrap.innerHTML = "";

  categories.forEach(cat => {
    const tab = document.createElement("div");
    tab.className = "category-tab" + (cat === "全て" ? " active" : "");
    tab.dataset.category = cat;
    tab.textContent = cat;
    wrap.appendChild(tab);
  });
}

/* ------------------------
   カテゴリー適用
------------------------ */
function filterByCategory(list) {
  if (currentCategory === "全て") return list;
  return list.filter(item => item.category === currentCategory);
}

/* ------------------------
   ソート＋カテゴリー同時適用
------------------------ */
function applyFilters() {
  // ソート
  sortItems(currentSort);

  // カテゴリー絞り込み
  const filtered = filterByCategory(items);

  // 再描画
  renderShop(filtered);
}

/* ------------------------
   タブクリック処理
------------------------ */
document.addEventListener("click", e => {
  // ソート
  if (e.target.classList.contains("shop-tab")) {
    const type = e.target.dataset.sort;
    sortItems(type);
    applyFilters();
    return;
  }

  // カテゴリー
  if (e.target.classList.contains("category-tab")) {
    const cat = e.target.dataset.category;
    currentCategory = cat;

    document.querySelectorAll(".category-tab").forEach(tab => {
      tab.classList.toggle("active", tab.dataset.category === cat);
    });

    applyFilters();
  }
});

/* ------------------------
   商品描画
------------------------ */
function renderShop(list) {
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = "";

  list.forEach(item => {
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

document.addEventListener("DOMContentLoaded", loadAndRender);

// ダークモード（現状維持）
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "😆";
}
