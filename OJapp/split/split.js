// split.js ver.2.1（スケール対応版）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

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
        canvas.width = piece;
        canvas.height = piece;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(
          img,
          startX + c * piece, startY + r * piece,
          piece, piece,
          0, 0,
          piece, piece
        );

        const imgTag = document.createElement("img");
        imgTag.src = canvas.toDataURL("image/png");
        imgTag.className = "split-img";

        result.appendChild(imgTag);
      }
    }

    // ▼▼ ここからスケール調整 ▼▼
    const wrapWidth = document.querySelector(".main").clientWidth;
    const baseSize = cols * 120 + (cols - 1) * 12;
    let scale = wrapWidth / baseSize;
    if (scale > 1) scale = 1;

    result.style.setProperty('--scale', scale);

    // 列数に応じてグリッドを設定
result.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

// 本来の幅（120px * 列数）
const baseWidth = cols * 120 + (cols - 1) * 6;

// 実際の表示領域
const containerWidth = document.querySelector(".main").clientWidth;

// 縮小比率
let scale = containerWidth / baseWidth;
if (scale > 1) scale = 1;

// CSS に反映
result.style.setProperty("--scale", scale);

    // ▲▲ スケール調整ここまで ▲▲
  };
});
