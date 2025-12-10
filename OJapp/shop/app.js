<script>
console.log("JS読み込み開始");

// 設定
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

// CSV取得
async function loadCSV() {
  console.log("CSV取得中:", CSV_URL);

  const res = await fetch(CSV_URL);
  const text = await res.text();

  console.log("CSV内容:", text.substring(0, 200));

  const rows = text.split("\n").map(r => r.split(","));
  console.log("行数:", rows.length);

  const rawHeaders = rows.shift().map(h => h.replace(/"/g, "").trim());
  console.log("実際のヘッダ:", rawHeaders);

  const headers = rawHeaders.map(h => HEADER_MAP[h] || h);
  console.log("マッピング後:", headers);

  const items = rows
    .map(cols => {
      const obj = {};
      cols.forEach((val, i) => {
        obj[headers[i]] = val.replace(/"/g, "").trim();
      });
      return obj;
    })
    .filter(item => item.boothUrl);

  console.log("解析結果 items:", items);
  return items;
}

// 描画
async function renderShop() {
  console.log("renderShop開始");

  const grid = document.querySelector(".shop-grid");
  console.log("shop-grid:", grid);

  const items = await loadCSV();
  console.log("表示対象 items:", items);

  items.forEach(item => {
    const div = document.createElement("div");
    div.textContent = "item: " + item.title;
    grid.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", renderShop);
</script>
