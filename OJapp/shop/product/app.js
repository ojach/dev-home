console.log("商品ページ JS 読み込み完了");

const CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRckMXYTdFw-2sSEmeqVTCXymb3F_NwrNdztP01BrZfH1n2WCORVwZuop7IxfG_KHGYqqlCuc3sBUee/pub?gid=1229129034&single=true&output=csv";

const HEADER_MAP = {
  "タイムスタンプ": "timestamp",
  "BOOTH商品URL": "boothUrl",
  "サムネ画像": "thumbnail",
  "タイトル": "title",
  "作者名": "author",
  "カテゴリー": "category",
  "スコア": "score",
  "visible": "visible",
  "価格": "price"
};


function convertDriveUrl(url) {
  if (!url) return "";

  // 複数URLの場合は最初の1つだけ使う
  const first = url.split(",")[0].trim();

  // open?id=XXXX
  const match = first.match(/id=([^&]+)/);
  if (match) {
    return `https://drive.google.com/uc?id=${match[1]}`;
  }

  return first; // 念のためそのまま返す
}
// =====================================
// URL から id を取得
// =====================================
function getItemId() {
  const p = new URLSearchParams(location.search);
  return Number(p.get("id"));
}

// =====================================
// CSV 読み込み
// =====================================
async function loadCSV() {
  const res = await fetch(CSV_URL);
  const txt = await res.text();

  const rows = txt.split("\n").map(r => r.split(","));
  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);

  return rows
    .map(cols => {
      const obj = {};
      cols.forEach((v, i) => obj[headers[i]] = v.replace(/"/g, "").trim());
      return obj;
    })
    .filter(item => item.visible !== "FALSE");
}

// =====================================
// 作者アイコンの取得
// =====================================
function getAuthorIcon(name) {
  return `/OJapp/shop/author/${name}.png`;
}

// =====================================
// 商品ページ描画
// =====================================
function renderProduct(item) {
  const box = document.getElementById("productBox");

const thumb = convertDriveUrl(item.thumbnail) || "/OJapp/shop/noimage.png";
  const icon = getAuthorIcon(item.author);

  box.innerHTML = `
    <div class="product-thumb-box">
      <img src="${thumb}" class="product-thumb">

      <img src="${icon}" class="product-author-icon"
           onclick="location.href='/OJapp/shop/author/?name=${item.author}'">
    </div>

    <div class="product-title">${item.title}</div>

    <div class="product-price">¥${item.price}</div>

    <div class="product-meta">
      作者：<a href="/OJapp/shop/author/?name=${item.author}">${item.author}</a><br>
      カテゴリー：${item.category}
    </div>

    <a class="product-buy-btn" target="_blank" href="${item.boothUrl}">
      購入はこちら
    </a>
  `;
}

// =====================================
// 戻る機能（元の位置まで戻る）
// =====================================
document.getElementById("backArea").addEventListener("click", () => {
  const pos = sessionStorage.getItem("ojapp_scroll_position");
  if (pos) {
    history.back();
    setTimeout(() => {
      window.scrollTo(0, Number(pos));
    }, 50);
  } else {
    history.back();
  }
});

// =====================================
// 初期起動
// =====================================
async function start() {
  const itemId = getItemId();
  if (!itemId) {
    document.getElementById("productBox").textContent = "商品が見つかりません。";
    return;
  }

  const items = await loadCSV();

  const item = items[itemId - 1]; // itemId は 1 から
  if (!item) {
    document.getElementById("productBox").textContent = "商品が存在しません。";
    return;
  }

  renderProduct(item);
}

start();

