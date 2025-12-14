// split.js ver.2.0（安定版・スマホ対応）

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
  };
});
