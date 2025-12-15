// =============================
//  split.js ver.3.0（完全版）
// =============================

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

  // main の実幅（スマホでの最大幅）
  const wrapWidth = document.querySelector(".main").clientWidth;

  // grid のセル表示サイズ
  const cellSize = Math.floor(wrapWidth / cols);

  result.style.display = "grid";
  result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  result.style.gap = "6px";
  result.style.justifyContent = "center";

  // --------------------------------------
  // 画像読み込み
  // --------------------------------------
  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    // 画像の短い方を基準に正方形切り出し
    const shortSide = Math.min(img.width, img.height);

    // 行数と列数に応じて切り出しサイズを決定
    const blockSize = Math.floor(shortSide / Math.max(rows, cols));

    // 上中央が基準
    const startX = (img.width - shortSide) / 2;
    const startY = 0;

    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        // Canvas（元解像度で切り出す → 高画質のまま保存可）
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = blockSize;
        canvas.height = blockSize;

        ctx.drawImage(
          img,
          startX + c * blockSize,
          startY + r * blockSize,
          blockSize, blockSize,
          0, 0,
          blockSize, blockSize
        );

        const url = canvas.toDataURL("image/png");

        // 表示用の小さいサイズ
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
