function base64url(input) {
  let utf8 = new TextEncoder().encode(input);
  let binary = "";
  utf8.forEach(b => binary += String.fromCharCode(b));

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export default {
  async fetch(req, env) {

    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const form = await req.formData();

    const product_id = crypto.randomUUID();
    const author = form.get("author");
    const authorKey = base64url(author);

    // ================================
    // サムネ画像 → R2へ保存
    // ================================
    const img = form.get("thumbnail");
    const key = `thumbs/${authorKey}/${product_id}.png`;

    await env.SHOP_IMAGES.put(key, img.stream(), {
      httpMetadata: { contentType: img.type }
    });

    const thumbnailURL =
      `https://ojshop-fav.trc-wasps.workers.dev/shop/r2/${key}`;

    // ================================
    // 商品登録APIへ送信
    // ================================
    const body = {
      product_id,
      title: form.get("title"),
      author,            // 生作者名
      author_key: authorKey,   // ← 必須！
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

