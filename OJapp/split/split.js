// split.js ver.3.0（完全フィット版）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

  // 📌 スマホの画面幅をそのまま使う（UI の幅ではない）
  const screenWidth = window.innerWidth;

  // 📌 パディングなどを考慮して少し余白
  const usableWidth = screenWidth - 32; // 16px * 2 くらいの余白

  // 📌 列数に応じて自動でセルの大きさが決まる
  const cellSize = Math.floor(usableWidth / cols);

  result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  result.style.gap = "6px";
  result.style.justifyContent = "center";

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    // 正方形切り出し
    const size = Math.min(img.width, img.height);
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    const srcPiece = size / Math.max(rows, cols);

    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = srcPiece;
        canvas.height = srcPiece;

        ctx.drawImage(
          img,
          startX + c * srcPiece,
          startY + r * srcPiece,
          srcPiece, srcPiece,
          0, 0,
          srcPiece, srcPiece
        );

        const url = canvas.toDataURL("image/png");

        const imgTag = document.createElement("img");
        imgTag.src = url;
        imgTag.className = "split-img";

        // 🔥 表示だけ縮小（高解像度は維持）
        imgTag.style.width = cellSize + "px";
        imgTag.style.height = cellSize + "px";

        result.appendChild(imgTag);
      }
    }
  };
});

