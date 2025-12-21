// ★Routeを切ってるので、本番は ojach.com に投げるのが一番ラク
const API_ENDPOINT = "https://ojach.com/oneletter/api/create";

// === DOM取得 ===
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const textInput = document.getElementById("letterText");
const titleInput = document.getElementById("letterTitle");
const fromInput = document.getElementById("letterFrom");
const createBtn = document.getElementById("createBtn");
const count = document.getElementById("count");
const resultArea = document.getElementById("resultArea");

// === リアルタイムプレビュー DOM ===
const liveImage = document.getElementById("liveImage");
const liveText  = document.getElementById("liveText");
const liveFrom  = document.getElementById("liveFrom");

// === その他 ===
let imageBlob = null;


// ======================================================
// 文字入力イベント
// ======================================================
textInput.addEventListener("input", () => {
  count.textContent = textInput.value.length;
  liveText.textContent = textInput.value;  // ← リアルタイム反映
  validate();
});

fromInput.addEventListener("input", () => {
  liveFrom.textContent = fromInput.value ? `— ${fromInput.value}` : "";
});


// ======================================================
// 画像選択 → 中央トリム＆512pxに変換
// ======================================================
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => (img.src = e.target.result);
  reader.readAsDataURL(file);

  img.onload = () => {
    const side = Math.min(img.width, img.height);
    const sx = (img.width - side) / 2;
    const sy = (img.height - side) / 2;

    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, sx, sy, side, side, 0, 0, 512, 512);

    canvas.toBlob(blob => {
      imageBlob = blob;

      // プレビュー
      preview.src = URL.createObjectURL(blob);

      // リアルタイムプレビュー
      liveImage.src = URL.createObjectURL(blob);
      liveImage.style.display = "block";

      validate();
    }, "image/png");
  };
});


// ======================================================
// UI設定の取得
// ======================================================
function getSetting(name) {
  const el = document.querySelector(`[name="${name}"]:checked`);
  return el ? el.value : null;
}

function getValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : null;
}


// ======================================================
// 作成ボタンの有効化
// ======================================================
function validate() {
  createBtn.disabled = !(imageBlob && textInput.value.trim().length > 0);
}


// ======================================================
// OneLetter 作成本処理（POST）
// ======================================================
createBtn.addEventListener("click", async () => {
  const text = textInput.value.trim();
  const title = titleInput.value.trim();
  const from  = fromInput.value.trim();

  const fr = new FileReader();
  fr.onload = async () => {

    createBtn.disabled = true;
    createBtn.textContent = "作成中…";

    try {
      const payload = {
        image_base64: fr.result,
        text: text,
        title: title,
        from: from,

        // === 追加設定 ===
        template: getSetting("template"),
        font: getSetting("font"),
        bg: getValue("bg"),
        writing: getSetting("writing"),
        size: getSetting("size"),
      };

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
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

    } finally {
      createBtn.textContent = "One Letter を作る";
      validate();
    }
  };

  fr.readAsDataURL(imageBlob);
});


// ======================================================
// 結果表示
// ======================================================
function showResult(url) {
  resultArea.innerHTML = `
    <div class="result">
      <div class="label">✨ One Letter 完成 ✨</div>
      <div class="url">${url}</div>
      <div class="row">
        <button id="copyBtn">📋 コピー</button>
        <a class="openBtn" href="${url}" target="_blank" rel="noopener">開く</a>
      </div>
    </div>
  `;
  resultArea.scrollIntoView({ behavior: "smooth" });

  document.getElementById("copyBtn").onclick = async () => {
    await navigator.clipboard.writeText(url);
    alert("コピーしました");
  };
}
