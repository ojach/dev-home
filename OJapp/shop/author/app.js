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
  "visible": "visible"
};

let allItems = [];
let authorName = "";

// URLパラメータ取得
function getAuthorName() {
  const params = new URLSearchParams(location.search);
  return params.get("name") || "";
}

async function loadCSV() {
  const res = await fetch(CSV_URL);
  const text = await res.text();

  

  const rows = text.split("\n").map(r => r.split(","));
  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);
renderAuthorHeader(authorName);
  return rows
    .map(cols => {
      const obj = {};
      cols.forEach((val, i) => (obj[headers[i]] = val.replace(/"/g, "").trim()));
      return obj;
    })
    .filter(item => item.visible !== "FALSE");
}

function renderCards(items) {
  const grid = document.querySelector(".shop-grid");
  grid.innerHTML = "";

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";

    const thumb = item.thumbnail || "/OJapp/shop/noimage.png";

    card.innerHTML = `
      <img src="${thumb}" class="item-thumb">
      <div class="item-title">${item.title}</div>
      <div class="item-author">by ${item.author}</div>
      <a href="${item.boothUrl}" class="item-buy-btn" target="_blank">購入はこちら</a>
    `;

    grid.appendChild(card);
  });
}

async function start() {
  authorName = getAuthorName();

  document.getElementById("author-title").textContent = `${authorName} さんの作品`;
  document.getElementById("author-desc").textContent =
    `作者「${authorName}」が登録したアイコン一覧です。`;

  allItems = await loadCSV();
  const items = allItems.filter(i => i.author === authorName);

  renderCards(items);
}
function renderAuthorHeader(authorName) {

  const authorIcon = authorIcons[authorName] || "/OJapp/shop/default-author.png";

  const header = document.createElement("div");
  header.className = "author-header";

  header.innerHTML = `
    <img class="author-header-icon" src="${authorIcon}">
    <div class="author-header-name">${authorName}</div>
  `;
// ダークモード（現状維持）
function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "😆";
}
  document.querySelector(".author-page").prepend(header);
}

document.addEventListener("DOMContentLoaded", start);
