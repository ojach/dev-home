console.log("product page JS loaded");

// ===== 基本設定 =====
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
  "価格": "price",
};

// 作者アイコン（とりあえず共通のデフォルト）
function getAuthorIcon(authorName) {
  // 必要になったらここを作者ごとのパスにしてOK
  return "/OJapp/shop/default-author.png";
}

// ===== CSV 読み込み =====
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

// ===== 商品詳細を描画 =====
function renderProduct(item) {
  const box = document.getElementById("product-detail");
  const thumb = item.thumbnail || "/OJapp/shop/noimage.png";
  const authorIcon = getAuthorIcon(item.author);

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

    <a class="product-buy-btn" href="${item.boothUrl}" target="_blank">
      BOOTHで購入する
    </a>
  `;
}

// ===== 同じ作者の他の作品（3〜4件） =====
function renderOtherWorks(allItems, currentItem) {
  const grid = document.querySelector(".other-works-grid");
  if (!grid) return;

  const others = allItems
    .filter(i => i.author === currentItem.author && i._itemId !== currentItem._itemId)
    .slice(0, 4);

  grid.innerHTML = "";

  if (others.length === 0) {
    grid.innerHTML = "<p>他の作品はまだありません。</p>";
    return;
  }

  others.forEach(i => {
    const card = document.createElement("div");
    card.className = "item-card";
    const thumb = i.thumbnail || "/OJapp/shop/noimage.png";

    card.innerHTML = `
      <img src="${thumb}" class="item-thumb">
      <div class="item-title">${i.title}</div>
    `;

    card.addEventListener("click", () => {
      location.href = `/OJapp/shop/product/?id=${i._itemId}`;
    });

    grid.appendChild(card);
  });
}

// ===== 初期起動 =====
async function start() {
  const params = new URLSearchParams(location.search);
  const idParam = params.get("id"); // "1", "2", ...

  if (!idParam) {
    document.getElementById("product-detail").innerHTML =
      "<p>商品IDが指定されていません。</p>";
    return;
  }

  let items = await loadCSV();

  // ★ここで product 側も自動採番する
  items = items.map((item, index) => ({
    ...item,
    _itemId: String(index + 1),
  }));

  const item = items.find(i => i._itemId === idParam);

  if (!item) {
    document.getElementById("product-detail").innerHTML =
      "<p>商品が見つかりませんでした。</p>";
    return;
  }

  renderProduct(item);
  renderOtherWorks(items, item);
}

document.addEventListener("DOMContentLoaded", start);
