console.log("作者名:", getAuthorName());
// ================================
// 設定
// ================================
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRckMXYTdFw-2sSEmeqVTCXymb3F_NwrNdztP01BrZfH1n2WCORVwZuop7IxfG_KHGYqqlCuc3sBUee/pub?gid=1229129034&single=true&output=csv";

const AUTHOR_ICON_BASE = "/OJapp/shop/author"; // 作者アイコンの場所

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

let allItems = [];
let authorName = "";


// ================================
// URLパラメータから作者名取得
// ================================
function getAuthorName() {
  const params = new URLSearchParams(location.search);
  return params.get("name") || "";
}


// ================================
// CSV読み込み
// ================================
async function loadCSV() {
  console.log(allItems.map(i => i.author));
  console.log("CSV作者:", i.author, "URL作者:", authorName);
  const res = await fetch(CSV_URL);
  const text = await res.text();

  const rows = text.split("\n").map(r => r.split(","));
  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);

  return rows
    .map(cols => {
      const obj = {};
      cols.forEach((val, i) => (obj[headers[i]] = val.replace(/"/g, "").trim()));
      return obj;
    })
    .filter(item => !item.visible || item.visible.toUpperCase() !== "FALSE"); // 非公開は除外
}


// ================================
// 作者ヘッダー描画
// ================================
function renderAuthorHeader(authorName) {
  const authorIcon = `${AUTHOR_ICON_BASE}/${authorName}.png`;

  const header = document.createElement("div");
  header.className = "author-header";

  header.innerHTML = `
    <img class="author-header-icon"
         src="${authorIcon}"
         onerror="this.src='${AUTHOR_ICON_BASE}/default.png'">

    <div class="author-header-name">${authorName}</div>
  `;

  document.querySelector(".author-page").prepend(header);
}


// ================================
// 作品カード描画
// ================================
function renderCards(items) {
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = "";

  items.forEach(item => {
    const thumb = item.thumbnail || "/OJapp/shop/noimage.png";

    const card = document.createElement("div");
    card.className = "item-card";

    card.innerHTML = `
      <img src="${thumb}" class="item-thumb">
      <div class="item-title">${item.title}</div>
      <div class="item-price">¥${item.price || 0}</div>

      <div class="item-author">by ${item.author}</div>

      <a href="${item.boothUrl}" class="item-buy-btn" target="_blank">
        購入はこちら
      </a>
    `;

    grid.appendChild(card);
  });
}


// ================================
// 初期処理
// ================================
async function start() {
  authorName = getAuthorName();
  document.getElementById("author-title").textContent = `${authorName} さんの作品`;
  document.getElementById("author-desc").textContent =
    `作者「${authorName}」が登録したアイコン一覧です。`;

  renderAuthorHeader(authorName);

  // ✅ CSV読み込み
  allItems = await loadCSV();

  // ✅ ここで中身を確認
  console.log("作者名:", authorName);
  console.log("全アイテム件数:", allItems.length);
  allItems.forEach(item => console.log("CSV作者:", item.author));

  // ✅ 作者でフィルタ
  const items = allItems.filter(item =>
    item.author.replace(/\r/g, "").trim() === authorName.trim()
  );

  console.log("フィルタ後:", items);

  renderCards(items);
}


// ================================
// ダークモード（維持）
// ================================
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "🤩";
}
