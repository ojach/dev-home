// CSV の場所
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRckMXYTdFw-2sSEmeqVTCXymb3F_NwrNdztP01BrZfH1n2WCORVwZuop7IxfG_KHGYqqlCuc3sBUee/pub?gid=1229129034&single=true&output=csv";

// CSV のキー対応
const HEADER_MAP = {
  "タイムスタンプ": "timestamp",
  "itemId": "itemId",
  "BOOTH商品URL": "boothUrl",
  "サムネ画像URL": "thumbnail",
  "タイトル": "title",
  "作者名": "author",
  "カテゴリー": "category",
  "価格": "price",
  "visible": "visible"
};

// 作者アイコン（ショップと同じものを使う）
const authorIcons = window.authorIcons || {}; // グローバル共有用


// ===== CSV 読み込み =====
async function loadCSV() {
  const res = await fetch(CSV_URL);
  const text = await res.text();

  const rows = text.split("\n").map(r => r.split(","));
  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);

  return rows.map(cols => {
    const obj = {};
    cols.forEach((val, i) => (obj[headers[i]] = val.replace(/"/g, "").trim()));
    return obj;
  }).filter(i => i.visible !== "FALSE");
}


// ===== 商品表示 =====
function renderProduct(item) {
  const box = document.getElementById("product-detail");

  const authorIcon = authorIcons[item.author] || "/OJapp/shop/default-author.png";
  const thumb = item.thumbnail || "/OJapp/shop/noimage.png";

  box.innerHTML = `
    <img class="product-thumb" src="${thumb}">

    <div class="product-title">${item.title}</div>

    <div class="product-author-box">
      <img class="product-author-icon" src="${authorIcon}">
      <a href="/OJapp/shop/author/?name=${encodeURIComponent(item.author)}">
        ${item.author}
      </a>
    </div>

    <div class="product-price">¥${item.price}</div>

    <a class="product-buy-btn" href="${item.boothUrl}" target="_blank">BOOTHで購入する</a>
  `;
}


// ===== 作者の他の作品（3〜4つだけ） =====
function renderOtherWorks(allItems, item) {
  const works = allItems.filter(i => i.author === item.author && i.itemId !== item.itemId);

  const limit = works.slice(0, 4); // ←最大4つだけ

  const grid = document.querySelector(".other-works-grid");
  grid.innerHTML = "";

  limit.forEach(w => {
    const card = document.createElement("div");
    card.className = "item-card";

    const thumb = w.thumbnail || "/OJapp/shop/noimage.png";

    card.innerHTML = `
      <img src="${thumb}" class="item-thumb">
      <div class="item-title">${w.title}</div>
    `;

    // 商品ページへ遷移
    card.addEventListener("click", () => {
      location.href = `/OJapp/shop/product/?id=${w.itemId}`;
    });

    grid.appendChild(card);
  });
}


// ===== 初期起動 =====
async function start() {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");

  const items = await loadCSV();
  const item = items.find(i => i.itemId === id);

  if (!item) {
    document.getElementById("product-detail").innerHTML = "<p>商品が見つかりません。</p>";
    return;
  }

  renderProduct(item);
  renderOtherWorks(items, item);
}

document.addEventListener("DOMContentLoaded", start);
