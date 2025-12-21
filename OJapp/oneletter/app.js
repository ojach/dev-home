// ========== 設定 ==========
const API_ENDPOINT = "https://ojach.com/oneletter/api/create";

// ========== DOM ==========
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const textInput = document.getElementById("letterText");
const titleInput = document.getElementById("letterTitle");
const fromInput = document.getElementById("letterFrom");
const createBtn = document.getElementById("createBtn");
const count = document.getElementById("count");
const resultArea = document.getElementById("resultArea");

// ▼ 全オプション
const optTemplate = document.querySelectorAll('input[name="template"]');
const optFont = document.querySelectorAll('input[name="font"]');
const optWriting = document.querySelectorAll('input[name="writing"]');
const optSize = document.querySelectorAll('input[name="size"]');
const bgInput = document.getElementById("bg");

// ▼ リアルタイムプレビュー要素
const liveImage = document.getElementById("liveImage");
const liveText  = document.getElementById("liveText");
const liveFrom  = document.getElementById("liveFrom");
const liveWrap  = document.getElementById("liveWrap");

let imageBlob = null;


// ==============================
// 画像処理（中央トリム512）
// ==============================
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

      // アップロードプレビュー
      preview.src = URL.createObjectURL(blob);

      // リアルタイム反映
      liveImage.src = URL.createObjectURL(blob);
      liveImage.style.display = "block";

      validate();
    }, "image/png");
  };
});


// ==============================
// 入力イベント（リアルタイム反映）
// ==============================
textInput.addEventListener("input", () => {
  count.textContent = textInput.value.length;
  liveText.textContent = textInput.value;
  validate();
});

titleInput.addEventListener("input", () => updateLive());
fromInput.addEventListener("input", () => updateLive());

// 全オプション変更時に更新
[optTemplate, optFont, optWriting, optSize].forEach(list => {
  list.forEach(el => el.addEventListener("change", updateLive));
});

bgInput.addEventListener("input", updateLive);


// ==============================
// UI設定取得
// ==============================
function getRadio(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

function updateLive() {
  // テンプレ変更
  const tpl = getRadio("template");
  liveWrap.setAttribute("data-template", tpl);

  // フォント
  const font = getRadio("font");
  liveWrap.style.fontFamily = font;

  // 背景色
  liveWrap.style.background = bgInput.value;

  // 縦横
  const writing = getRadio("writing");
  liveText.style.writingMode = writing === "vertical" ? "vertical-rl" : "horizontal-tb";
  liveText.style.textOrientation = writing === "vertical" ? "upright" : "mixed";

  // サイズ
  const size = getRadio("size");
  liveText.style.fontSize =
    size === "large" ? "22px" :
    size === "small" ? "14px" : "18px";

  // 差出人
  liveFrom.textContent = fromInput.value ? `— ${fromInput.value}` : "";
}


// ==============================
// バリデーション
// ==============================
function validate() {
  createBtn.disabled = !(imageBlob && textInput.value.trim().length > 0);
}


// ==============================
// 作成処理
// ==============================
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
        text,
        title,
        from,

        // === 追加設定（サーバー側へ） ===
        template: getRadio("template"),
        font: getRadio("font"),
        bg: bgInput.value,
        writing: getRadio("writing"),
        size: getRadio("size"),
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


// ==============================
// 完成URL表示
// ==============================
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
