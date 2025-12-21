// 商品登録
document.getElementById("submit-btn").addEventListener("click", async () => {

  const designer = localStorage.getItem("ojshop-admin-designer");
  if (!designer) {
    alert("ログイン情報がありません");
    return;
  }

  const author = designer;
  const author_key = base64url(author);

  const title = document.getElementById("title").value;
  const product_url = document.getElementById("product_url").value;
  const category = document.getElementById("category").value;
  const price = Number(document.getElementById("price").value || 0);

  // product_id は Worker側で生成してもいいが、今はフロントで生成している想定
  const product_id = crypto.randomUUID();

  // サムネのパス（R2 側に既にアップロード済みの前提）
  const thumbnail = `thumbs/${author_key}/${product_id}.png`;

  const payload = {
    product_id,
    title,
    author,
    author_key,
    category,
    product_url,
    price,
    thumbnail
  };

  console.log("送信JSON:", payload);

  const res = await fetch(`${API_BASE}/shop/admin/item`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const json = await res.json().catch(() => {
    console.error("JSONとして読み込み失敗", res);
    alert("登録失敗：サーバーがJSONを返しませんでした");
    return;
  });

  if (!json || !json.ok) {
    alert("商品登録に失敗しました（Worker側エラー）");
    console.error(json);
    return;
  }

  alert("登録完了！");
});
