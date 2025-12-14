// split.js ver.1.3（PC正常 ＋ スマホ自動縮小）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  const wrap = document.getElementById("resultWrap");

  result.innerHTML = "";

  // PC・スマホ共通のグリッド基礎
  result.style.display = "grid";
  result.style.gridTemplateColumns = `repeat(${cols}, 120px)`;
  result.style.gap = "8px";
  result.style.justifyContent = "center";

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    const size = Math.min(img.width, img.height);
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    const piece = size / Math.max(rows, cols);

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

        result.appendChild(imgTag);
      }
    }

    // ------- スマホだけ縮小する --------
    const gridWidth = cols * 120 + (cols - 1) * 8;
    const maxWidth = wrap.clientWidth;

    let scale = maxWidth / gridWidth;
    
    // PC の場合は scale を必ず 1 にする（縮小禁止）
    if (window.innerWidth > 640) {
      scale = 1;
    } else {
      if (scale > 1) scale = 1;
    }

    result.style.transform = `scale(${scale})`;
    result.style.transformOrigin = "top center";
  };
});

