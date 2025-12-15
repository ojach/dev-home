document.getElementById("splitBtn").addEventListener("click", () => {

  console.clear();
  console.log("▶ Split start");

  const file = document.getElementById("imgInput").files[0];
  console.log("File:", file);
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  console.log("rows:", rows, "cols:", cols);

  const result = document.getElementById("result");
  result.innerHTML = "";

  const wrapWidth = document.querySelector(".main").clientWidth;
  console.log("wrapWidth:", wrapWidth);

  const cellSize = Math.floor(wrapWidth / cols);
  console.log("cellSize:", cellSize);

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {
    console.log("image loaded:", img.width, img.height);

    const blockSize = Math.min(
      img.width  / cols,
      img.height / rows
    );

    console.log("blockSize:", blockSize);

    if (blockSize <= 0) {
      console.log("❌ blockSize invalid → STOP");
      alert("blockSize が 0 です。rows/cols の設定を確認");
      return;
    }

    const cutWidth  = blockSize * cols;
    const cutHeight = blockSize * rows;

    const startX = (img.width  - cutWidth)  / 2;
    const startY = (img.height - cutHeight) / 2;

    console.log("startX:", startX, "startY:", startY);

    alert("ここまで到達 → JS は動いてる！");
  };
});
