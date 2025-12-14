// split.js ver.3.0（本物のタイル切り出し）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

  // 出力する表示領域の幅（スマホは最大500px）
  const displayWidth = document.querySelector(".main").clientWidth;

  // 各ピースの表示サイズ（画面にぴったり収める）
  const viewSize = Math.floor(displayWidth / cols);

  result.style.display = "grid";
  result.style.gridTemplateColumns = `repeat(${cols}, ${viewSize}px)`;
  result.style.gap = "8px";


  // ------------------------------
  //   画像読み込み
  // ------------------------------
  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);


  img.onload = () => {

    // 元画像サイズ
    const W = img.width;
    const H = img.height;

    // 列・行で割ったサイズ
    const pieceW = W / cols;
    const pieceH = H / rows;

    // 正方形ピースの基準
    const piece = Math.min(pieceW, pieceH);

    // 実際に切り取る全体サイズ
    const cropWidth  = piece * cols;
    const cropHeight = piece * rows;

    // 中央から開始
    const startX = (W - cropWidth) / 2;
    const startY = (H - cropHeight) / 2;

    let index = 1;

    // ------------------------------
    //   各ピースを切り出し
    // ------------------------------
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = piece;
        canvas.height = piece;

        ctx.drawImage(
          img,
          startX + c * piece,      // 元画像内X
          startY + r * piece,      // 元画像内Y
          piece, piece,            // 切り取りサイズ
          0, 0,
          piece, piece             // 出力サイズ
        );

        // PNGに変換
        const url = canvas.toDataURL("image/png");

        // 表示画像として追加（viewSize に縮小）
        const out = document.createElement("img");
        out.src = url;
        out.className = "split-img";
        out.style.width = viewSize + "px";
        out.style.height = viewSize + "px";
        out.dataset.index = index++;

        result.appendChild(out);
      }
    }
  };
});
