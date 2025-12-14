// split.js ver.1.0

document.getElementById("splitBtn").addEventListener("click", () => {

  const file = document.getElementById("imgInput").files[0];
  if (!file) return alert("画像を選んでね！");

  const rows = Number(document.getElementById("rows").value);
  const cols = Number(document.getElementById("cols").value);

  const img = new Image();
  const reader = new FileReader();

  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {

    const resultArea = document.getElementById("result");
    resultArea.innerHTML = ""; // クリア

    const size = Math.min(img.width, img.height);
    const startX = (img.width - size) / 2;
    const startY = (img.height - size) / 2;

    const piece = size / Math.max(rows, cols);
    // ※ 行列が違う場合でも最大値で正方形割りOK

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
          piece,
          piece,
          0, 0,
          piece,
          piece
        );

        // 出力画像
        const url = canvas.toDataURL("image/png");

        // 表示
        const imgTag = document.createElement("img");
        imgTag.src = url;
        imgTag.className = "split-img";

        // ⬇️ 将来 ZIP で使えるように ID 付けとく
        imgTag.dataset.index = index++;
        imgTag.dataset.blob = url;

        resultArea.appendChild(imgTag);
      }

      // 行ごとに改行
      resultArea.appendChild(document.createElement("br"));
    }
  };
});
