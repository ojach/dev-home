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

   // ============================================
// ② 商品登録（完全修正版）
// POST /shop/admin/item
// ============================================
if (url.pathname === "/shop/admin/item" && request.method === "POST") {

  const body = await request.json();

  const {
    product_id,
    title,
    author,
    author_key,
    category,
    price,
    visible,
    thumbnail
  } = body;

  await db.prepare(`
    INSERT INTO items (
      product_id,
      title,
      author,
      category,
      product_url,
      price,
      visible,
      thumbnail,
      created_at,
      author_icon,
      updated_at,
      favorite_count,
      view_count,
      author_key
    )
    VALUES (?, ?, ?, ?, NULL, ?, ?, ?, CURRENT_TIMESTAMP, NULL, NULL, 0, 0, ?)
  `)
  .bind(
    product_id,
    title,
    author,
    category,
    Number(price || 0),
    Number(visible ?? 1),
    thumbnail,
    author_key
  )
  .run();

  return new Response(JSON.stringify({
    ok: true,
    product_id,
    author_key
  }), {
    headers: { "Content-Type": "application/json", ...cors },
  });
}

  }
};

