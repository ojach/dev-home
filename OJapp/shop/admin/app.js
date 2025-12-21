document.getElementById("submit").addEventListener("click", async () => {

  const file = document.getElementById("thumb").files[0];
  const title = document.getElementById("title").value;
  const author = document.getElementById("author").value;
  const category = document.getElementById("category").value;
  const price = document.getElementById("price").value;

  if (!file || !title) {
    alert("画像・タイトルは必須です！");
    return;
  }

  const product_id = crypto.randomUUID();
  const author_key = encodeAuthorName(author);

  // ---------------------------
  // ① 先にサムネだけ R2 にアップロード
  // ---------------------------
  const uploadRes = await fetch(
    `https://ojshop-fav.trc-wasps.workers.dev/shop/admin/thumb?product_id=${product_id}&author_key=${author_key}`,
    {
      method: "POST",
      body: file
    }
  );

  const uploadJson = await uploadRes.json();

  if (!uploadJson.ok) {
    alert("サムネ画像のアップロードに失敗しました");
    return;
  }

  // ---------------------------
  // ② R2 保存パスを使って D1 に登録
  // ---------------------------
  const payload = {
    product_id,
    title,
    author,
    author_key,
    category,
    product_url: "",
    price: Number(price),
    thumbnail: `thumbs/${author_key}/${product_id}.png`
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

