// =========================
// 設定
// =========================
const API_BASE = "https://ojshop-fav.trc-wasps.workers.dev";

const designer = localStorage.getItem("ojshop-admin-designer");
if (!designer) {
  alert("ログインしていません");
  location.href = "/OJapp/shop/admin/login.html";
}
document.getElementById("admin-name").textContent = `ログイン中：${designer}`;


// =========================
// 画像関連
// =========================
let originalImage = null;


// 画像読み込み
document.getElementById("thumb-input").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    originalImage = new Image();
    originalImage.src = reader.result;
    originalImage.onload = () => {
      document.getElementById("preview-original").src = originalImage.src;
      applyMosaic();
    };
  };
  reader.readAsDataURL(file);
});


// モザイク実行
document.getElementById("mosaic-range").addEventListener("input", applyMosaic);


function applyMosaic() {
  if (!originalImage) return;

  const level = Number(document.getElementById("mosaic-range").value);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = 300;
  canvas.height = 300;

  // 一度縮小して描画 → 拡大して pixelate
  const size = Math.max(1, 20 - level);

  ctx.drawImage(originalImage, 0, 0, size, size);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, size, size, 0, 0, 300, 300);

  document.getElementById("preview-processed").src = canvas.toDataURL();
}


// =========================
// 商品追加（R2 + D1）
// =========================
document.getElementById("add-item-btn").addEventListener("click", async () => {

  const product_id = document.getElementById("product-id").value;
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const price = Number(document.getElementById("price").value);
  const product_url = document.getElementById("product-url").value;

  if (!product_id || !title) {
    alert("商品IDとタイトルは必須です");
    return;
  }

  // ① 加工画像（processed）を Blob に変換
  const processedURL = document.getElementById("preview-processed").src;
  const blob = await (await fetch(processedURL)).blob();

  const author_key = b64url(designer);
  const key = `thumbs/${author_key}/${product_id}.png`;

  // ② R2 アップロード
  await fetch(`${API_BASE}/shop/admin/thumb?product_id=${product_id}&author_key=${author_key}`, {
    method: "POST",
    body: blob,
  });

  // ③ D1 登録
  await fetch(`${API_BASE}/shop/admin/item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      product_id,
      title,
      category,
      price,
      product_url,
      author: designer,
      author_key,
      thumbnail: key
    })
  });

  alert("商品追加完了！");
  location.reload();
});


// =========================
// 作者アイコン提出
// =========================
document.getElementById("author-icon-input").addEventListener("change", e => {
  const f = e.target.files[0];
  if (!f) return;
  document.getElementById("author-icon-preview").src = URL.createObjectURL(f);
});

document.getElementById("upload-author-icon").addEventListener("click", async () => {
  const file = document.getElementById("author-icon-input").files[0];
  if (!file) return alert("画像を選択");

  const author_key = b64url(designer);

  await fetch(`${API_BASE}/shop/admin/icon?author_key=${author_key}`, {
    method: "POST",
    body: file
  });

  alert("作者アイコンを更新しました！");
});


// =========================
// Base64URL
// =========================
function b64url(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

