// split.js ver.3.0（スマホ500px幅に完全対応）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

  // ---- ★ 表示幅（スマホ最大500px） ----
  const wrapWidth = document.querySelector(".main").clientWidth;  
  const gap = 6; // CSS と合わせる
  const cellSize = Math.floor((wrapWidth - (gap * (cols - 1))) / cols);

  // グリッド設定
  result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
  result.style.gap = gap + "px";

  // -----------------------------------------
  //     元画像読み込み
  // -----------------------------------------
  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    // 正方形切り出し（中央）
    const size = Math.min(img.width, img.height);
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    const piece = size / Math.max(rows, cols);

    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        // ★ Canvas は高画質のまま
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = piece;
        canvas.height = piece;

        ctx.drawImage(
          img,
          startX + c * piece,
          startY + r * piece,
          piece, piece,
          0, 0,
          piece, piece
        );

        const url = canvas.toDataURL("image/png");

        // ★ 表示だけ縮小
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
