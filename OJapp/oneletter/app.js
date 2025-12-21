/***************************************************
 * OJapp OneLetter — app.js 完全版
 * すべての設定をリアルタイムプレビュー ＆ API 送信に反映
 ***************************************************/

const API_ENDPOINT = "https://ojach.com/oneletter/api/create";

// 主要DOM
const imageInput = document.getElementById("imageInput");
const preview = document.getElementById("preview");
const textInput = document.getElementById("letterText");
const fromInput = document.getElementById("letterFrom");
const createBtn = document.getElementById("createBtn");
const count = document.getElementById("count");
const resultArea = document.getElementById("resultArea");

// オプションDOM
const bgInput = document.getElementById("bg");

// ラジオグループ
function getRadio(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? el.value : null;
}

// プレビューDOM
const liveWrap = document.getElementById("liveWrap");
const liveImage = document.getElementById("liveImage");
const liveText = document.getElementById("liveText");
const liveFrom = document.getElementById("liveFrom");

let imageBlob = null;


/***************************************************
 * 画像処理：512px 正方形にトリム
 ***************************************************/
imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const img = new Image();
  const reader = new FileReader();
  reader.onload = e => img.src = e.target.result;
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
      preview.src = URL.createObjectURL(blob);

      // リアルタイムプレビュー
      liveImage.src = URL.createObjectURL(blob);
      liveImage.style.display = "block";

      validate();
      updatePreview();
    }, "image/png");
  };
});


/***************************************************
 * 入力イベント → リアルタイム反映
 ***************************************************/
textInput.addEventListener("input", () => {
  count.textContent = textInput.value.length;
  liveText.textContent = textInput.value;
  validate();
  updatePreview();
});

fromInput.addEventListener("input", () => {
  liveFrom.textContent = fromInput.value ? `— ${fromInput.value}` : "";
  updatePreview();
});

// すべてのオプションにイベントをつける
["template","font","writing","size"].forEach(name => {
  document.querySelectorAll(`input[name="${name}"]`)
    .forEach(r => r.addEventListener("change", updatePreview));
});

bgInput.addEventListener("input", updatePreview);


/***************************************************
 * プレビュー全反映
 ***************************************************/
function updatePreview() {

  // テンプレート適用
  const tpl = getRadio("template");
  liveWrap.setAttribute("data-template", tpl);

  // 背景色
  liveWrap.style.background = bgInput.value;

  // フォント
  const font = getRadio("font");
  liveWrap.style.fontFamily =
    font === "serif" ? "serif" :
    font === "round" ? "'Zen Maru Gothic', sans-serif" :
    "sans-serif";

  // 書字方向
  const writing = getRadio("writing");
  if (writing === "vertical") {
    liveText.style.writingMode = "vertical-rl";
    liveText.style.textOrientation = "upright";
  } else {
    liveText.style.writingMode = "horizontal-tb";
    liveText.style.textOrientation = "mixed";
  }

  // 文字サイズ
  const size = getRadio("size");
  liveText.style.fontSize =
    size === "large" ? "22px" :
    size === "small" ? "14px" :
    "18px";

  // 画像表示 ON/OFF（テンプレに応じて）
  liveImage.style.display =
    tpl === "text_only" ? "none" : "block";

  // img_overlay の場合は full style 化
  if (tpl === "img_overlay") {
    liveWrap.style.position = "relative";
    liveImage.style.width = "100%";
    liveImage.style.maxWidth = "100%";
    liveText.style.position = "absolute";
    liveText.style.bottom = "30px";
    liveText.style.left = "20px";
    liveText.style.right = "20px";
    liveText.style.color = "white";
    liveText.style.textShadow = "0 2px 6px rgba(0,0,0,0.4)";
  } else {
    // 通常レイアウトに戻す
    liveText.style.position = "static";
    liveText.style.color = "#444";
    liveText.style.textShadow = "none";
  }
}


/***************************************************
 * バリデーション
 ***************************************************/
function validate() {
  createBtn.disabled = !(imageBlob && textInput.value.trim().length > 0);
}


/***************************************************
 * POST: OneLetter 作成処理
 ***************************************************/
createBtn.addEventListener("click", async () => {
  const fr = new FileReader();
  fr.onload = async () => {
    createBtn.disabled = true;
    createBtn.textContent = "作成中…";

    try {
      const payload = {
        image_base64: fr.result,
        text: textInput.value.trim(),
        from: fromInput.value.trim(),

        template: getRadio("template"),
        font: getRadio("font"),
        bg: bgInput.value,
        writing: getRadio("writing"),
        size: getRadio("size")
      };

      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(payload)
      });

      const json = await res.json();
      if (json.status === "ok") showResult(json.access_url);
      else alert("作成に失敗しました");

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


/***************************************************
 * 結果表示
 ***************************************************/
function showResult(url) {
  resultArea.innerHTML = `
    <div class="result">
      <div class="label">✨ One Letter 完成 ✨</div>
      <div class="url">${url}</div>
      <div class="row">
        <button id="copyBtn">📋 コピー</button>
        <a class="openBtn" href="${url}" target="_blank">開く</a>
      </div>
    </div>
  `;

  document.getElementById("copyBtn").onclick = () => {
    navigator.clipboard.writeText(url);
    alert("コピーしました");
  };

  resultArea.scrollIntoView({behavior: "smooth"});
}
