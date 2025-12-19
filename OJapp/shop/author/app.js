// ================================
// 設定
// ================================
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRckMXYTdFw-2sSEmeqVTCXymb3F_NwrNdztP01BrZfH1n2WCORVwZuop7IxfG_KHGYqqlCuc3sBUee/pub?gid=1229129034&single=true&output=csv";

const AUTHOR_ICON_BASE = "/OJapp/shop/author";

const HEADER_MAP = {
  "タイムスタンプ": "timestamp",
  "BOOTH商品URL": "boothUrl",
  "サムネ画像": "thumbnail",
  "タイトル": "title",
  "作者名": "author",
  "カテゴリー": "category",
  "スコア": "score",
  "価格": "price",
  "visible": "visible",
  "product_id": "product_id",
};

let allItems = [];
let authorName = "";



// ================================
// 作者名取得
// ================================
function getAuthorName() {
  const params = new URLSearchParams(location.search);
  return params.get("name") || "";
}


// ================================
// CSV読み込み
// ================================
async function loadCSV() {
  const res = await fetch(CSV_URL);
  const text = await res.text();
  const rows = text.split("\n").map(r => r.split(","));
  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);

  const data = rows.map(cols => {
    const obj = {};
    cols.forEach((val, i) => (obj[headers[i]] = val.replace(/"/g, "").trim()));
    return obj;
  });

  console.log("CSV読込結果:", data.length, "件");
  return data.filter(item => !item.visible || item.visible.toUpperCase() !== "FALSE");
}



// ================================
// 作者ヘッダー描画
// ================================
function renderAuthorHeader(authorName) {
  const authorIcon = `${AUTHOR_ICON_BASE}/${authorName}.png`;

  const header = document.createElement("div");
  header.className = "author-header";

  header.innerHTML = `
    <div class="author-header-frame">
      <img class="author-header-icon"
           src="${authorIcon}"
           onerror="this.src='${AUTHOR_ICON_BASE}/default.png'">
    </div>
    <div class="author-header-name">${authorName}</div>
  `;

  document.querySelector(".author-page").prepend(header);
}


function renderCards(items) {
  console.log("🎨 renderCards起動！", items.length);
  const grid = document.querySelector(".shop-grid");
  if (!grid) return;

  grid.innerHTML = "";

  items.forEach(item => {
const thumb = item.thumbnail || "/OJapp/shop/noimage.png";

    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <div class="item-thumb-box">
        <img src="${thumb}" class="item-thumb">
      </div>
      <div class="item-title">${item.title}</div>
      <div class="item-price">¥${item.price || 0}</div>
      <div class="item-author">by ${item.author}</div>
      <a href="${item.boothUrl}" class="item-buy-btn" target="_blank">購入はこちら</a>
    `;

    grid.appendChild(card);

    // ✅ ここを追加：描画後に「show」クラスを付けて表示アニメを有効化
    setTimeout(() => card.classList.add("show"), 50);
  });
}


// ================================
// 初期処理
// ================================
async function start() {
  authorName = getAuthorName();
  console.log("作者名:", authorName);

  document.getElementById("author-title").textContent = `${authorName} さんの作品`;
  document.getElementById("author-desc").textContent =
    `作者「${authorName}」が登録したアイコン一覧です。`;

  renderAuthorHeader(authorName);

  allItems = await loadCSV();

  console.log("全アイテム件数:", allItems.length);
  const items = allItems.filter(i =>
    i.author.replace(/\r/g, "").trim() === authorName.trim()
  );

  console.log("フィルタ後:", items.length);
  renderCards(items);
}


// ================================
// 確実にDOM構築後に起動
// ================================
window.addEventListener("load", () => {
  setTimeout(start, 500); // ← ヘッダー・フッター読み込み待ち
});

// ================================
// ダークモード（維持）
// ================================
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "🤩";
}
// ===== デバッグ用：DOM上に商品が生成されてるか確認 =====
setTimeout(() => {
  const cards = document.querySelectorAll(".item-card");
  console.log("🧱 DOM上のカード数:", cards.length);
  if (cards.length > 0) {
    console.log("✅ 商品は描画されてるけどCSSで隠れてる可能性があります。");
  } else {
    console.warn("❌ 商品のHTMLが生成されていません。renderCardsが動いてない可能性。");
  }
}, 1500);
