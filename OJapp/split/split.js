// split.js ver.3.5（スマホ幅完全フィット版）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

  // 💥 main の幅ではなく「実際の画面幅」を使う
  const screenWidth = window.innerWidth;

  // 少し余白（16px × 2）
  const usableWidth = screenWidth - 32;

  // 💥 1セルの表示サイズ（←これが足りてなかった）
  const cellSize = Math.floor(usableWidth / cols);

  // グリッド設定
  result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  result.style.gap = "6px";
  result.style.justifyContent = "center";

  // 元画像読み込み
  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    const size = Math.min(img.width, img.height);
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    const srcPiece = size / Math.max(rows, cols);

    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        // Canvas は高画質のまま
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

        // 表示だけ縮小（←これが超大事）
        const imgTag = document.createElement("img");
        imgTag.src = url;
        imgTag.className = "split-img";
        imgTag.style.width = cellSize + "px";
        imgTag.style.height = cellSize + "px";

        result.appendChild(imgTag);
      }
    }
  };
});
