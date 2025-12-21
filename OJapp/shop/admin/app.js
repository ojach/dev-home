// ============================================
// Base64URL 変換（作者名 → URL安全）
// ============================================
function base64url(input) {
  const utf8 = new TextEncoder().encode(input);
  let binary = "";
  utf8.forEach(b => binary += String.fromCharCode(b));

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export default {
  async fetch(req, env) {

    // POST 以外は禁止
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const form = await req.formData();

    // --------------------------------------------
    // 作者名（ログイン名）を取得
    // --------------------------------------------
    let author = form.get("author");
    if (!author) {
      return new Response(
        JSON.stringify({ ok: false, error: "author missing" }),
        { status: 400 }
      );
    }

    const authorKey = base64url(author);

    // --------------------------------------------
    // 商品ID生成
    // --------------------------------------------
    const product_id = crypto.randomUUID();

    // --------------------------------------------
    // サムネ画像 → R2 保存
    // --------------------------------------------
    const img = form.get("thumbnail");
    if (!img) {
      return new Response(
        JSON.stringify({ ok: false, error: "thumbnail missing" }),
        { status: 400 }
      );
    }

    const key = `thumbs/${authorKey}/${product_id}.png`;

    await env.SHOP_IMAGES.put(key, img.stream(), {
      httpMetadata: { contentType: img.type }
    });

    const thumbnailURL =
      `https://ojshop-fav.trc-wasps.workers.dev/shop/r2/${key}`;

    // --------------------------------------------
    // Workers 本体の /shop/admin/item へ登録
    // --------------------------------------------
    const body = {
      product_id,
      title: form.get("title"),
      author,
      author_key: authorKey,
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

    let dbResult = {};
    try {
      dbResult = await apiRes.json();
    } catch (e) {
      dbResult = { ok: false, error: "Invalid JSON from worker" };
    }

    // --------------------------------------------
    // 登録結果を返す
    // --------------------------------------------
    return new Response(
      JSON.stringify({
        ok: true,
        product_id,
        thumbnail: thumbnailURL,
        db: dbResult
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
};

