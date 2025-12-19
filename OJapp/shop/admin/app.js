export default {
  async fetch(req, env) {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const form = await req.formData();

    const product_id = crypto.randomUUID();

    const image = form.get("thumbnail");
    const key = `thumb/${product_id}.jpg`;

    await env.SHOP_R2.put(key, image.stream(), {
      httpMetadata: { contentType: image.type }
    });

    const thumbnail = `https://your-r2-domain/${key}`;

    await env.DB.prepare(`
      INSERT INTO items
      (product_id, title, author, category, price, visible, thumbnail)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      product_id,
      form.get("title"),
      form.get("author"),
      form.get("category"),
      Number(form.get("price")),
      form.get("visible") ? 1 : 0,
      thumbnail
    ).run();

    return new Response(JSON.stringify({ ok: true, product_id }), {
      headers: { "Content-Type": "application/json" }
    });
  }
};
