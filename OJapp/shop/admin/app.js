document.getElementById("submit").addEventListener("click", async () => {

  const file = document.getElementById("thumb").files[0];
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const category = document.getElementById("category").value;
  const price = document.getElementById("price").value;
  const visible = document.getElementById("visible").value;

  if (!file || !title) {
    alert("画像・タイトルは必須です！");
    return;
  }

  // ★ ここで product_id を1回生成して変数として保持
  const product_id = crypto.randomUUID();
  const author_key = encodeAuthorName(author);

  const payload = {
    product_id,
    title,
    author,
    author_key,
    category,
    product_url: "",
    price: Number(price),
    thumbnail: `thumbs/${author_key}/${product_id}.png`   // ★ ここで正しく使える
  };

  const res = await fetch(
    "https://ojshop-fav.trc-wasps.workers.dev/shop/admin/item",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }
  );

  const json = await res.json();
  const box = document.getElementById("result");
  box.style.display = "block";

  if (json.ok) {
    box.innerHTML = `登録完了！<br>product_id：<b>${json.product_id}</b>`;
  } else {
    box.innerHTML = "エラーが発生しました。";
  }
});
