// split.js ver.1.2（スマホ完全対応・正方形グリッド）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  const wrap = document.getElementById("resultWrap");

  // まず消す
  result.innerHTML = "";

  // グリッド基本設定
  result.style.display = "grid";
  result.style.gridTemplateColumns = `repeat(${cols}, 120px)`;
  result.style.gap = "8px";
  result.style.justifyContent = "center";

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    // ■ 正方形トリミング開始位置
    const size = Math.min(img.width, img.height);
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    // ■ 1ピースの長さ（元画像から切り出す用）
    const piece = size / Math.max(rows, cols);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = piece;
        canvas.height = piece;

        // 元画像 → キャンバスに切り出し
        ctx.drawImage(
          img,
          startX + c * piece,
          startY + r * piece,
          piece, piece,
          0, 0,
          piece, piece
        );

        const url = canvas.toDataURL("image/png");

        const imgTag = document.createElement("img");
        imgTag.src = url;
        imgTag.className = "split-img";

        result.appendChild(imgTag);
      }
    }

    // ======== ▼ スマホ用スケール処理（ここが重要） ▼ ========

    // グリッド全体の本来の幅
    const gridWidth = cols * 120 + (cols - 1) * 8;

    // スマホ画面に収まる最大幅
    const maxWidth = wrap.clientWidth;

    // スケール計算
    let scale = maxWidth / gridWidth;
    if (scale > 1) scale = 1;

    // transformで縮小（見た目は小さいけど画像自体は高画質）
    result.style.transform = `scale(${scale})`;
    result.style.transformOrigin = "top center";

    // 縮小後の高さを wrap に反映（ずれ防止）
    result.style.height = "auto";
  };
});

