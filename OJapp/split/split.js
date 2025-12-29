// split.js ver.5.0.0
// square / ig_profile(3:4完成) / ig_post(9:16投稿・3:4基準)

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const mode = document.querySelector('input[name="mode"]:checked')?.value || "square";

  const result = document.getElementById("result");
  result.innerHTML = "";

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    const W = img.width;
    const H = img.height;

    const wrapWidth = document.querySelector(".main").clientWidth;
    const cellSize = Math.floor(wrapWidth / cols);

    result.style.display = "grid";
    result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    result.style.gap = "6px";
    result.style.justifyContent = "center";

    /* =====================================================
       共通：正方形モード用の変数
    ===================================================== */
    let pieceW, pieceH;
    let srcBaseX, srcBaseY;
    let srcStepH;

    /* =====================================================
       ■ 正方形（従来）
    ===================================================== */
    if (mode === "square") {

      const size = Math.min(W / cols, H / rows);
      pieceW = pieceH = size;

      srcBaseX = (W - size * cols) / 2;
      srcBaseY = (H - size * rows) / 2;

      srcStepH = pieceH; // 縦もそのまま
    }

    /* =====================================================
       ■ IG プロフ完成（3:4）
    ===================================================== */
    if (mode === "ig_profile" || mode === "ig_post") {

      // ① 元画像を 9:16 に正規化
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
      const safeH = postH * 0.75;      // ← 핵심
      const safeW = safeH * (3 / 4);

      const safeX = postX + (postW - safeW) / 2;
      const safeY = postY + (postH - safeH) / 2;

      pieceW = safeW / cols;
      pieceH = safeH / rows;

      srcBaseX = safeX;
      srcBaseY = safeY;

      // 投稿モードでは「1ピースの切り出し高さ」を 9:16 に拡張
      if (mode === "ig_post") {
        srcStepH = pieceW * 16 / 9;
      } else {
        srcStepH = pieceH;
      }
    }

    /* =====================================================
       ■ 分割描画
    ===================================================== */
    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width  = pieceW;
        canvas.height = srcStepH;

        // プロフ基準の分割線を「9:16ソース」に逆投影
        let srcX = srcBaseX + c * pieceW;
        let srcY = srcBaseY + r * pieceH;

        if (mode === "ig_post") {
       const IG_TRIM_BIAS_Y = Number(
  document.getElementById("biasY").value
);

          srcY -= overlap;
        }

        ctx.drawImage(
          img,
          srcX,
          srcY,
          pieceW,
          srcStepH,
          0,
          0,
          pieceW,
          srcStepH
        );

        const imgTag = document.createElement("img");
        imgTag.src = canvas.toDataURL("image/png");
        imgTag.style.width = cellSize + "px";
        imgTag.dataset.index = index++;

        result.appendChild(imgTag);
      }
    }
  };
});


