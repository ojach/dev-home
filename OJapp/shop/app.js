<script>
// ====== 設定部分 ====== //
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRckMXYTdFw-2sSEmeqVTCXymb3F_NwrNdztP01BrZfH1n2WCORVwZuop7IxfG_KHGYqqlCuc3sBUee/pub?gid=1229129034&single=true&output=csv";

// 日本語ヘッダ → JS 内部キーに変換するマッピング
const HEADER_MAP = {
  "タイムスタンプ": "timestamp",
  "BOOTHのURL": "boothUrl",
  "サムネ画像のURL": "thumbnail",
  "作品タイトル": "title",
  "作者名": "author",
  "購入先カテゴリ": "category",
  "visible": "visible"
};

// ====== CSV → 商品リスト変換 ====== //
async function loadCSV() {
  const res = await fetch(CSV_URL);
  const csvText = await res.text();

  // CSVを行ごとに分解
  const rows = csvText.trim().split("\n").map(row => row.split(","));

  // 1行目 = ヘッダ
  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h); // 変換

  const items = rows.map(row => {
    const obj = {};
    row.forEach((value, i) => {
      const key = headers[i];
      obj[key] = value.replace(/"/g, "").trim();
    });
    return obj;
  });

  return items;
}

// ====== 商品カードを生成 ====== //
function createItemCard(item) {
  const card = document.createElement("div");
  card.className = "item-card";

  card.innerHTML = `
    <img src="${item.thumbnail}" class="item-thumb" alt="${item.title}">
    <h3 class="item-title">${item.title || "タイトル未設定"}</h3>
    <p class="item-author">by ${item.author || "不明"}</p>
    <a href="${item.boothUrl}" class="item-buy-btn" target="_blank" rel="noopener noreferrer">
      購入はこちら
    </a>
  `;
  return card;
}

// ====== 画面へ描画 ====== //
async function renderShop() {
  const grid = document.querySelector(".shop-grid");
  if (!grid) return;

  const items = await loadCSV();

  items
    .filter(item => item.boothUrl)              // 空行を弾く
    .filter(item => item.visible !== "FALSE")   // FALSE の行は非公開
    .forEach(item => {
      const card = createItemCard(item);
      grid.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", renderShop);
</script>
