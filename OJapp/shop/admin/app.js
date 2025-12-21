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
