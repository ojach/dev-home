const API_ENDPOINT = "https://ojapp-oneletter.trc-wasps.workers.dev/api/create";

const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const textInput = document.getElementById("letterText");
const titleInput = document.getElementById("letterTitle");
const createBtn = document.getElementById("createBtn");
const count = document.getElementById("count");
const resultArea = document.getElementById("resultArea");

let imageBlob = null;

/* ==========================
   文字数カウント
========================== */
textInput.addEventListener("input", () => {
  count.textContent = textInput.value.length;
  validate();
});

/* ==========================
   画像処理（中央トリム＋縮小）
========================== */
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const img = new Image();
  const reader = new FileReader();

  reader.onload = e => img.src = e.target.result;
  reader.readAsDataURL(file);

  img.onload = () => {
    const size = Math.min(img.width, img.height);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(
      img,
      (img.width - size) / 2,
      (img.height - size) / 2,
      size, size,
      0, 0,
      512, 512
    );

    canvas.toBlob(blob => {
      imageBlob = blob;
      preview.src = URL.createObjectURL(blob);
      validate();
    }, "image/png");
  };
});

/* ==========================
   バリデーション
========================== */
function validate() {
  createBtn.disabled = !(
    imageBlob &&
    textInput.value.trim().length > 0
  );
}

/* ==========================
   作成処理
========================== */
createBtn.addEventListener("click", async () => {

  const reader = new FileReader();
  reader.onload = async () => {

    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: reader.result,
          text: textInput.value.trim(),
          title: titleInput.value.trim()
        })
      });

      const json = await res.json();

      if (json.status === "ok") {
        showResult(json.access_url);
      } else {
        alert("作成に失敗しました");
      }

    } catch (e) {
      alert("通信エラー");
      console.error(e);
    }
  };

  reader.readAsDataURL(imageBlob);
});

/* ==========================
   結果表示
========================== */
function showResult(url) {
  resultArea.innerHTML = `
    <div class="result">
      <div class="label">✨ One Letter 完成 ✨</div>
      <div class="url">${url}</div>
      <button id="copyBtn">📋 コピー</button>
    </div>
  `;

  document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(url);
    alert("コピーしました");
  };
}
