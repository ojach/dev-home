// split.js ver.2.3
document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

  // ✅ main の実幅を使う
  const main = document.querySelector(".main");
  const usableWidth = main.clientWidth;

  // gap 分を引く（6px × (cols - 1)）
  const gap = 6;
  const cellSize = Math.floor(
    (usableWidth - gap * (cols - 1)) / cols
  );

  result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  result.style.gap = gap + "px";

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    const size = Math.min(img.width, img.height);
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    const srcPiece = size / Math.max(rows, cols);

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

        const imgTag = document.createElement("img");
        imgTag.src = canvas.toDataURL("image/png");
        imgTag.className = "split-img";
        imgTag.style.width = cellSize + "px";
        imgTag.style.height = cellSize + "px";

        result.appendChild(imgTag);
      }
    }
  };
});

