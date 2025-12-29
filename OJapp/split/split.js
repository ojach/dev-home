// split.js ver.3.0.1（中央クロップ & スマホ幅フィット版）

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

  const mode = document.querySelector('input[name="mode"]:checked').value;


  img.onload = () => {

    const W = img.width;
    const H = img.height;


// 1) 9:16 正規化（最大中央クロップ）
const targetPostRatio = 9 / 16;

let postW, postH;
if (W / H > targetPostRatio) {
  postH = H;
  postW = H * targetPostRatio;
} else {
  postW = W;
  postH = W / targetPostRatio;
}
const postX = (W - postW) / 2;
const postY = (H - postH) / 2;

// 2) プロフで見える 3:4 セーフエリア
const safeRatio = 3 / 4;
const safeH = postH * 0.75;          // ← ここがキモ
const safeW = safeH * safeRatio;
const safeX = postX + (postW - safeW) / 2;
const safeY = postY + (postH - safeH) / 2;

// 3) 分割は「safeW / safeH」を基準に
const pieceW = safeW / cols;
const pieceH = safeH / rows;




    // ③ 中央基準の開始位置（上下左右どこも整合）
    const startX = (W - cropW) / 2;
    const startY = (H - cropH) / 2;

    // ④ スマホ表示用の1マス表示サイズ
    const wrapWidth = document.querySelector(".main").clientWidth;
    const cellSize = Math.floor(wrapWidth / cols);

    // ⑤ グリッド設定（絶対に収まる）
    result.style.display = "grid";
    result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;
    result.style.gap = "6px";
    result.style.justifyContent = "center";

    let index = 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

      canvas.width  = pieceW;
canvas.height = pieceH;

ctx.drawImage(
  img,
  safeX + c * pieceW,
  safeY + r * pieceH,
  pieceW, pieceH,
  0, 0,
  canvas.width, canvas.height
);



        const url = canvas.toDataURL("image/png");

        const imgTag = document.createElement("img");
        imgTag.src = url;
        imgTag.className = "split-img";
        imgTag.dataset.index = index++;
        imgTag.style.width = cellSize + "px";

        result.appendChild(imgTag);
      }
    }

  };
});
