// split.js ver.FINAL
document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);
  const mode = document.querySelector('input[name="mode"]:checked')?.value || "square";

  const biasY = Number(document.getElementById("biasY")?.value || 0);
  const biasX = Number(document.getElementById("biasX")?.value || 0);

  const result = document.getElementById("result");
  result.innerHTML = "";

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    const W = img.width;
    const H = img.height;

    const wrapWidth = document.querySelector(".main").clientWidth || 300;
    const cellSize = Math.floor(wrapWidth / cols);

    result.style.display = "grid";
    result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    result.style.gap = "6px";

    let pieceW, pieceH;
    let baseX, baseY;
    let drawH;

    /* ---------- 正方形 ---------- */
    if (mode === "square") {
      const size = Math.min(W / cols, H / rows);
      pieceW = pieceH = size;
      baseX = (W - size * cols) / 2;
      baseY = (H - size * rows) / 2;
      drawH = pieceH;
    }

    /* ---------- IG系共通（9:16正規化→3:4基準） ---------- */
    if (mode === "ig_profile" || mode === "ig_post") {
      // 9:16 正規化
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

      // 3:4 セーフエリア
      const safeH = postH * 0.75;
      const safeW = safeH * (3 / 4);

      baseX = postX + (postW - safeW) / 2;
      baseY = postY + (postH - safeH) / 2;

      pieceW = safeW / cols;
      pieceH = safeH / rows;

      drawH = (mode === "ig_post") ? (pieceW * 16 / 9) : pieceH;
    }

    /* ---------- 分割描画 ---------- */
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width  = pieceW;
        canvas.height = drawH;

        let sx = Math.round(baseX + c * pieceW) + biasX;
        let sy = Math.round(baseY + r * pieceH);

        if (mode === "ig_post") {
          const overlap = (drawH - pieceH) / 2;
          sy = sy - overlap + biasY;
        }

        ctx.drawImage(
          img,
          sx, sy,
          pieceW, drawH,
          0, 0,
          pieceW, drawH
        );

        const out = document.createElement("img");
        out.src = canvas.toDataURL("image/png");
        out.style.width = cellSize + "px";
        result.appendChild(out);
      }
    }
  };
});


