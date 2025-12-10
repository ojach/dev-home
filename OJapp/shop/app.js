<script>
// ====== 設定部分 ====== //
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRckMXYTdFw-2sSEmeqVTCXymb3F_NwrNdztP01BrZfH1n2WCORVwZuop7IxfG_KHGYqqlCuc3sBUee/pub?gid=1229129034&single=true&output=csv";

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

// ====== CSVを読み込む ====== //
async function loadCSV() {
  const res = await fetch(CSV_URL);
  const text = await res.text();

  const rows = text.split("\n").map(r => r.split(","));

  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);

  const items = rows
    .map(cols => {
      const obj = {};
      cols.forEach((value, i) => {
        obj[headers[i]] = value.replace(/"/g, "").trim();
      });
      return obj;
    })
    .filter(item => item.boothUrl && item.boothUrl !== ""); // 空行除外

  return items;
}

// ====== カード生成 ====== //
function createItemCard(item) {
  const card = document.createElement("div");
  card.className = "item-card";

  card.innerHTML = `
    <img src="${item.thumbnail}" class="item-thumb">
    <h3 class="item-title">${item.title || "タイトル未設定"}</h3>
    <p class="item-author">by ${item.author || "不明"}</p>
    <a href="${item.boothUrl}" class="item-buy-btn" target="_blank">
      購入はこちら
    </a>
  `;
  return card;
}

// ====== 描画 ====== //
async function renderShop() {
  const grid = document.querySelector(".shop-grid");
  if (!grid) {
    console.error("shop-grid が見つかりません");
    return;
  }

  const items = await loadCSV();

  items
    .filter(item => item.visible !== "FALSE")
    .forEach(item => {
      grid.appendChild(createItemCard(item));
    });
}

document.addEventListener("DOMContentLoaded", renderShop);
</script>
