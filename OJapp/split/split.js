// split.js ver.2.0（列数に応じてセルサイズ自動調整）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

  // ---- ★ セルの表示サイズを決定（ここが超重要） ----
  const wrapWidth = document.querySelector(".main").clientWidth;
  const cellSize = Math.floor(wrapWidth / cols);   // 列で割る → フィットする

  result.style.display = "grid";
  result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  result.style.gap = "8px";
  result.style.justifyContent = "center";

  // -----------------------------------------
  //     元画像読み込み
  // -----------------------------------------
  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    // 正方形切り出し用（中央から）
    const size = Math.min(img.width, img.height);
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    const srcPiece = size / Math.max(rows, cols); // 元画像の分割単位

    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        // ★ Canvas は大きいまま（高画質維持）
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

        // ★ 表示サイズだけ縮小する
        const imgTag = document.createElement("img");
        imgTag.src = url;
        imgTag.className = "split-img";
        imgTag.style.width = cellSize + "px";
        imgTag.style.height = cellSize + "px";
        imgTag.dataset.index = index++;

        result.appendChild(imgTag);
      }
    }
  };
});

