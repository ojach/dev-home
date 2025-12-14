// split.js ver.1.1（grid対応）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const resultArea = document.getElementById("result");
  resultArea.innerHTML = "";

  // ★ グリッド化（ここが超重要）
  resultArea.style.display = "grid";
  resultArea.style.gridTemplateColumns = `repeat(${cols}, 120px)`;
  resultArea.style.gap = "8px";
  resultArea.style.justifyContent = "center";

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    const size = Math.min(img.width, img.height);
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    const piece = size / Math.max(rows, cols);

    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

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

        const imgTag = document.createElement("img");
        imgTag.src = url;
        imgTag.className = "split-img";
        imgTag.dataset.index = index++;

        resultArea.appendChild(imgTag);

        const wrap = document.getElementById("resultWrap");
        const result = document.getElementById("result");

        result.style.gridTemplateColumns = `repeat(${cols}, 120px)`;

        // グリッドの本来の幅
        const gridWidth = cols * 120 + (cols - 1) * 6;

        // スマホ画面幅
        const maxWidth = wrap.clientWidth;

        // 収まるスケールを計算（最大1）
        let scale = maxWidth / gridWidth;
        if (scale > 1) scale = 1;

        result.style.transform = `scale(${scale})`;

      }
    }
  };
});

