export default {
  async fetch(req, env) {

    // POST 以外禁止
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const form = await req.formData();

    // 商品ID生成
    const product_id = crypto.randomUUID();
    const author = form.get("author");
// ============================================
// 作者アイコンアップロード機能（完全版）
// ============================================

document.addEventListener("DOMContentLoaded", () => {

  const designer = localStorage.getItem("ojshop-admin-designer");
  if (!designer) return;

  const preview = document.getElementById("author-icon-preview");
  const input = document.getElementById("author-icon-input");
  const submitBtn = document.getElementById("author-icon-submit");
  const result = document.getElementById("author-icon-result");
  const label = document.getElementById("author-icon-label");

  // 必須要素が見つからない場合
  if (!preview || !input || !submitBtn || !result) {
    console.error("作者アイコン関連の要素が見つかりません。");
    return;
  }

  // -------------------------------
  // アイコンの存在チェック → 初回/再提出の振り分け
  // -------------------------------
  const iconURL = `https://ojshop-fav.trc-wasps.workers.dev/shop/r2/authors/${designer}.png`;

  fetch(iconURL, { method: "HEAD" }).then(r => {
    if (r.ok) {
      // すでに登録済み → 再提出モード
      preview.src = iconURL;
      preview.style.display = "block";
      label.textContent = "作者アイコン（再提出で更新できます）";
    } else {
      // 初回提出
      label.textContent = "作者アイコンを提出してください（PNG推奨）";
    }
  });

  // -------------------------------
  // プレビュー表示
  // -------------------------------
  input.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;

    preview.src = URL.createObjectURL(file);
    preview.style.display = "block";
  });

  // -------------------------------
  // アイコンアップロード
  // -------------------------------
  submitBtn.addEventListener("click", async () => {
    const file = input.files[0];
    if (!file) {
      alert("ファイルを選択してください！");
      return;
    }

    const res = await fetch(
      `https://ojshop-fav.trc-wasps.workers.dev/shop/admin/icon?author=${designer}`,
      {
        method: "POST",
        body: file
      }
    );

    const json = await res.json();
    result.style.display = "block";

    if (json.ok) {
      result.innerHTML = `アイコンをアップロードしました！<br>${json.url}`;
    } else {
      result.textContent = "アップロードに失敗しました。";
    }
  });

});

    // ================================
    // サムネ受け取り → R2へ保存
    // ================================
    const img = form.get("thumbnail");
    const key = `thumbs/${author}/${product_id}.png`;

    await env.SHOP_R2.put(key, img.stream(), {
      httpMetadata: { contentType: img.type }
    });

    // 正しいR2配信URL
    const thumbnailURL = `https://ojshop-fav.trc-wasps.workers.dev/shop/r2/${key}`;

    // ================================
    // 商品情報を Workers本体へ登録
    // ================================
    const body = {
      product_id,
      title: form.get("title"),
      author,
      category: form.get("category"),
      price: Number(form.get("price") || 0),
      visible: Number(form.get("visible") || 1),
      thumbnail: thumbnailURL
    };

    const apiRes = await fetch(
      "https://ojshop-fav.trc-wasps.workers.dev/shop/admin/item",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      }
    );

    const dbResult = await apiRes.json();

    // ================================
    // フロントへ返却
    // ================================
    return new Response(
      JSON.stringify({
        ok: true,
        product_id,
        thumbnail: thumbnailURL,
        db: dbResult
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
