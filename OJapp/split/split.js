// split.js ver.4.0.0
// square（従来） + ig_profile_complete（9:16投稿 / 3:4グリッド完成）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const modeInput = document.querySelector('input[name="mode"]:checked');
  const mode = modeInput ? modeInput.value : "square";

  const result = document.getElementById("result");
  result.innerHTML = "";

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    const W = img.width;
    const H = img.height;

    // 表示サイズ
    const wrapWidth = document.querySelector(".main").clientWidth;
    const cellSize = Math.floor(wrapWidth / cols);

    result.style.display = "grid";
    result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    result.style.gap = "6px";
    result.style.justifyContent = "center";

    let pieceW, pieceH;
    let baseX, baseY;

    /* =====================================================
       ■ 正方形モード（従来どおり・完全互換）
    ===================================================== */
    if (mode === "square") {

      const pieceSize = Math.min(W / cols, H / rows);
      const cropW = pieceSize * cols;
      const cropH = pieceSize * rows;

      baseX = (W - cropW) / 2;
      baseY = (H - cropH) / 2;

      pieceW = pieceSize;
      pieceH = pieceSize;
    }

    /* =====================================================
       ■ Instagram プロフ完成モード
       投稿：9:16 / グリッド表示：3:4
    ===================================================== */
    if (mode === "ig_profile_complete") {

      // ① 9:16 に正規化
      const postRatio = 9 / 16;
      let postW, postH, postX, postY;

      if (W / H > postRatio) {
        postH = H;
        postW = H * postRatio;
      } else {
        postW = W;
        postH = W / postRatio;
      }

      postX = (W - postW) / 2;
      postY = (H - postH) / 2;

      // ② プロフで見える 3:4 セーフエリア
      // 9:16 → 3:4 になると高さの 75% が見える
      const safeH = postH * 0.75;
      const safeW = safeH * (3 / 4);

      baseX = postX + (postW - safeW) / 2;
      baseY = postY + (postH - safeH) / 2;

      // ③ 分割サイズ（3:4 が完成する基準）
      pieceW = safeW / cols;
      pieceH = safeH / rows;
    }

    /* =====================================================
       ■ 分割描画（共通）
    ===================================================== */
    let index = 1;

   for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {

    /* =========================
       ■ 3:4 プロフ完成プレビュー
    ========================= */
    const previewCanvas = document.createElement("canvas");
    const pctx = previewCanvas.getContext("2d");

    previewCanvas.width  = pieceW;
    previewCanvas.height = pieceH;

    pctx.drawImage(
      img,
      baseX + c * pieceW,
      baseY + r * pieceH,
      pieceW,
      pieceH,
      0,
      0,
      pieceW,
      pieceH
    );

    /* =========================
       ■ 9:16 実投稿用（重なり込み）
    ========================= */
    const postCanvas = document.createElement("canvas");
    const postCtx = postCanvas.getContext("2d");

    const postH = pieceW * 16 / 9;   // 9:16
    postCanvas.width  = pieceW;
    postCanvas.height = postH;

    const offsetY = (postH - pieceH) / 2;

    postCtx.drawImage(
      img,
      baseX + c * pieceW,
      baseY + r * pieceH,
      pieceW,
      pieceH,
      0,
      offsetY,
      pieceW,
      pieceH
    );

    /* =========================
       ■ 表示（両方）
    ========================= */
    const wrap = document.createElement("div");
    wrap.style.display = "flex";
    wrap.style.flexDirection = "column";
    wrap.style.gap = "6px";

    const imgPreview = document.createElement("img");
    imgPreview.src = previewCanvas.toDataURL("image/png");
    imgPreview.style.width = cellSize + "px";

    const imgPost = document.createElement("img");
    imgPost.src = postCanvas.toDataURL("image/png");
    imgPost.style.width = cellSize + "px";

    wrap.appendChild(imgPreview);
    wrap.appendChild(imgPost);
    result.appendChild(wrap);
  }
}

  };
});

