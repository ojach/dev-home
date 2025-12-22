// ============================================
// OJapp Shop Admin 2025-12-22 完全版
// （ログイン・アイコン・商品追加・商品管理 全部入り）
// ============================================

const API_BASE = "https://ojshop-fav.trc-wasps.workers.dev";

// ===============================
// 作者名 Base64URL
// ===============================
function encodeAuthorName(name) {
  const utf8 = new TextEncoder().encode(name);
  let bin = "";
  utf8.forEach(b => bin += String.fromCharCode(b));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// ============================================
// ① ログイン（778方式）
// ============================================
(() => {
  const KEY = "ojshop-admin-designer";
  if (localStorage.getItem(KEY)) return;

  const input = prompt("デザイナー専用ページです。\nパスワードを入力してください：");
  if (!input) {
    alert("キャンセルされました");
    location.href = "/OJapp/shop/";
    return;
  }
  if (!input.endsWith("778")) {
    alert("パスワードが違います。");
    location.href = "/OJapp/shop/";
    return;
  }

  const designer = input.slice(0, -3);
  localStorage.setItem(KEY, designer);
  alert("ログイン成功！ようこそ " + designer + " さん");
})();


// ============================================
// ② 作者アイコン UI 切替（登録済/未登録）
// ============================================
document.addEventListener("DOMContentLoaded", async () => {
  const designer = localStorage.getItem("ojshop-admin-designer");
  if (!designer) return;

  const authorKey = encodeAuthorName(designer);
  const box = document.getElementById("author-icon-box");
  const iconURL = `${API_BASE}/shop/r2/authors/${authorKey}.png`;

  const exists = await fetch(iconURL, { method: "HEAD" })
    .then(r => r.ok)
    .catch(() => false);

  if (exists) {
    // --- 登録済 UI ---
    box.innerHTML = `
      <h3>作者アイコン</h3>
      <img src="${iconURL}" class="admin-author-icon">
      <button id="icon-change-btn" class="submit-btn">変更する</button>
      <input type="file" id="icon-change-file" accept="image/*" style="margin-top:10px;">
      <div id="icon-update-result" class="result-box"></div>
    `;

    document.getElementById("icon-change-btn").addEventListener("click", async () => {
      const f = document.getElementById("icon-change-file").files[0];
      if (!f) return alert("ファイルを選んでください");

      const res = await fetch(`${API_BASE}/shop/admin/icon?author_key=${authorKey}`, {
        method: "POST",
        body: f
      });
      const json = await res.json();
      document.getElementById("icon-update-result").innerHTML =
        json.ok ? "更新しました！再読み込みしてください。" : "失敗しました。";
    });

    return;
  }

  // --- 未登録 UI（あなたが作った元UI） ---
  // ※ index.html 側にそのまま残してOK
});


// ============================================
// ③ サムネプレビュー
// ============================================
document.getElementById("thumb").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  document.getElementById("preview").src = URL.createObjectURL(file);
  document.getElementById("preview").style.display = "block";
});


// ============================================
// ④ 商品追加（R2 → D1）
// ============================================
document.getElementById("submit").addEventListener("click", async () => {
  const designer = localStorage.getItem("ojshop-admin-designer");
  const author_key = encodeAuthorName(designer);

  const file = document.getElementById("thumb").files[0];
  const title = document.getElementById("title").value;
  const category = document.getElementById("category").value;
  const price = Number(document.getElementById("price").value);

  if (!file || !title) return alert("画像・タイトルは必須です！");

  const product_id = crypto.randomUUID();

  // ① R2に画像アップロード
  const up = await fetch(
    `${API_BASE}/shop/admin/thumb?product_id=${product_id}&author_key=${author_key}`,
    { method: "POST", body: file }
  ).then(r => r.json());

  if (!up.ok) return alert("画像アップロードに失敗しました");

  // ② D1に商品登録
  const payload = {
    product_id,
    title,
    author: designer,
    author_key,
    category,
    price,
    product_url: "",
    thumbnail: `thumbs/${author_key}/${product_id}.png`
  };

  const res = await fetch(`${API_BASE}/shop/admin/item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const json = await res.json();

  document.getElementById("result").innerHTML =
    json.ok ? `登録完了！<b>${json.product_id}</b>` : "エラー発生";
  document.getElementById("result").style.display = "block";

  loadMyItems(); // ← 自動反映
});


// ============================================
// ⑤ マイ商品一覧（編集UI付き）
// ============================================
async function loadMyItems() {
  const designer = localStorage.getItem("ojshop-admin-designer");
  const author_key = encodeAuthorName(designer);

  const box = document.getElementById("my-items");
  box.innerHTML = "<p>読み込み中...</p>";

  const res = await fetch(`${API_BASE}/shop/api/items`);
  const items = await res.json();

  const mine = items.filter(i => i.author_key === author_key);
  if (mine.length === 0) {
    box.innerHTML = "<p>まだ商品がありません。</p>";
    return;
  }

  box.innerHTML = "";

  mine.forEach(item => {
    const thumb = `${API_BASE}/shop/r2/${item.thumbnail}`;

    const div = document.createElement("div");
    div.className = "admin-item";

    div.innerHTML = `
      <img src="${thumb}" class="admin-thumb">
      <div class="admin-info">
        <b>${item.title}</b><br>
        ${item.price}円 / ${item.category}
      </div>

      <div class="admin-buttons">
        <button class="btn-vis" data-id="${item.product_id}">
          ${item.visible ? "非公開にする" : "公開にする"}
        </button>

        <button class="btn-mosaic" data-id="${item.product_id}">モザイク</button>

        <button class="btn-del" data-id="${item.product_id}">削除</button>
      </div>
    `;

    box.appendChild(div);
  });

  bindAdminButtons();
}

document.addEventListener("DOMContentLoaded", loadMyItems);


// ============================================
// ⑥ 管理ボタン（非公開 / 削除 / モザイク）
// ============================================
function bindAdminButtons() {

  // --- 公開/非公開 ---
  document.querySelectorAll(".btn-vis").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const newVal = btn.textContent.includes("非公開") ? 0 : 1;

      await fetch(`${API_BASE}/shop/admin/visible?id=${id}&value=${newVal}`, {
        method: "POST"
      });

      loadMyItems();
    });
  });

  // --- 削除（B方式：D1 + R2 完全削除） ---
  document.querySelectorAll(".btn-del").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;

      if (!confirm("本当に削除しますか？\n（取り消しできません）")) return;
      if (!confirm("最終確認です。本当に削除しますか？")) return;

      await fetch(`${API_BASE}/shop/admin/delete?id=${id}`, {
        method: "POST"
      });

      loadMyItems();
    });
  });

  // --- モザイク生成 ---
  document.querySelectorAll(".btn-mosaic").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      const item = items.find(t => t.product_id === id);
      if (!item) return;

      const imgURL = `${API_BASE}/shop/r2/${item.thumbnail}`;
      showMosaic(imgURL);
    });
  });
}


// ============================================
// ⑦ モザイク生成（canvas）
// ============================================
function showMosaic(imgURL) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();

  img.onload = function () {
    canvas.width = img.width;
    canvas.height = img.height;

    const size = 16; // ← モザイクサイズ
    ctx.drawImage(img, 0, 0);

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

    for (let y = 0; y < canvas.height; y += size) {
      for (let x = 0; x < canvas.width; x += size) {

        const i = (y * canvas.width + x) * 4;
        const r = data.data[i];
        const g = data.data[i + 1];
        const b = data.data[i + 2];

        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, size, size);
      }
    }

    const url = canvas.toDataURL("image/png");
    const w = window.open();
    w.document.write(`<img src="${url}" style="width:100%">`);
  };

  img.crossOrigin = "anonymous";
  img.src = imgURL;
}

