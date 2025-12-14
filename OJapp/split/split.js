// split.js ver.3.0（中央から正しくトリミング + スマホ幅フィット）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

  // ====================================================================================
  // ★ 表示するセルサイズ（スマホ幅にフィットさせる）
  // ====================================================================================
  const wrapWidth = document.querySelector(".main").clientWidth;
  const cellSize = Math.floor(wrapWidth / cols);   // スマホ画面に確実に収めるためのサイズ

  // 表示グリッドを作成
  result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  result.style.gap = "8px";


  // ====================================================================================
  // ★ 元画像読み込み（ここから切り出し）
  // ====================================================================================
  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    // ★ ブロックの1つあたりのサイズ（元画像から切る時のピクセル数）
    const blockSize = Math.min(
      img.width  / cols,
      img.height / rows
    );

    // 切り取り領域の総サイズ（分割した全体）
    const cutWidth  = blockSize * cols;
    const cutHeight = blockSize * rows;

    // ★ 中央基準で切り始めるポイント（重要）
    const startX = (img.width  - cutWidth)  / 2;
    const startY = (img.height - cutHeight) / 2;

    // ====================================================================================
    // ★ 画像を行 × 列で切り出し
    // ====================================================================================

    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        // 高画質のまま保持するため、大きめ Canvas を使う
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width  = blockSize;
        canvas.height = blockSize;

        ctx.drawImage(
          img,
          startX + c * blockSize,   // 元画像の切り出し X
          startY + r * blockSize,   // 元画像の切り出し Y
          blockSize, blockSize,
          0, 0,
          blockSize, blockSize
        );

        const url = canvas.toDataURL("image/png");

        // 表示サイズは cellSize に縮小（スマホ幅に合わせる）
        const imgTag = document.createElement("img");
        imgTag.src = url;
        imgTag.className = "split-img";
        imgTag.style.width  = cellSize + "px";
        imgTag.style.height = cellSize + "px";
        imgTag.dataset.index = index++;

        result.appendChild(imgTag);
      }
    }
  };
});
