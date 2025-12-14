// split.js ver.3.0（完全版）

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const result = document.getElementById("result");
  result.innerHTML = "";

  // =====================================
  // ① 表示幅を取得（スマホ基準）
  // =====================================
  const displayWidth = document.querySelector(".main").clientWidth;

  // gap 4px * (cols-1) を引いた分を割る
  const totalGap = 4 * (cols - 1);
  const cellSize = Math.floor((displayWidth - totalGap) / cols);

  // グリッド設定
  result.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;

  // 画像読込
  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  function toggleTheme() {
  document.documentElement.classList.toggle("dark");
  const sw = document.querySelector(".switch");
  sw.textContent = document.documentElement.classList.contains("dark") ? "🌙" : "🤩";
}
  img.onload = () => {

    // =====================================
    // ② 正方形切り出し（中央）
    // =====================================
  // 最終的な1ブロックのサイズ
const blockSize = Math.min(
  img.width  / cols,
  img.height / rows
);

// 切り出す全体サイズ（正方形ではなく分割全体の縦横）
const cutWidth  = blockSize * cols;
const cutHeight = blockSize * rows;

// 中央から開始
const startX = (img.width  - cutWidth ) / 2;
const startY = (img.height - cutHeight) / 2;


    // =====================================
    // ③ 各ピース切り出し → セルへ入れる
    // =====================================
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {

        // 元画像は高画質のまま切る
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = srcPiece;
        canvas.height = srcPiece;

       ctx.drawImage(
  img,
  startX + c * blockSize,
  startY + r * blockSize,
  blockSize, blockSize,
  0, 0,
  blockSize, blockSize
);

        const url = canvas.toDataURL("image/png");

        // 表示枠（サイズはCSSではなく JS で固定）
        const cell = document.createElement("div");
        cell.className = "split-cell";
        cell.style.width = cellSize + "px";
        cell.style.height = cellSize + "px";

        const imgTag = document.createElement("img");
        imgTag.src = url;

        cell.appendChild(imgTag);
        result.appendChild(cell);

        index++;
      }
    }
  };
});
