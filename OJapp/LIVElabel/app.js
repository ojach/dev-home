<script>
const input = document.getElementById("iconInput");
const canvasNormal = document.getElementById("canvasNormal");
const canvasLive   = document.getElementById("canvasLive");

const ctxNormal = canvasNormal.getContext("2d");
const ctxLive   = canvasLive.getContext("2d");

const btnGenerate = document.getElementById("generateBtn");
const dlNormal = document.getElementById("downloadNormal");
const dlLive   = document.getElementById("downloadLive");

let img = new Image();

input.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    img.onload = () => {
      drawNormal();
      drawLive();
      updateDownload();
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
});

btnGenerate.addEventListener("click", () => {
  if (!img.src) {
    alert("先に画像を選んでください");
    return;
  }
  drawNormal();
  drawLive();
  updateDownload();
});

/* ===== 通常アイコン ===== */
function drawNormal() {
  ctxNormal.clearRect(0, 0, 512, 512);
  ctxNormal.drawImage(img, 0, 0, 512, 512);
}

/* ===== LIVE帯付き ===== */
function drawLive() {
  ctxLive.clearRect(0, 0, 512, 512);

  // 元画像
  ctxLive.drawImage(img, 0, 0, 512, 512);

  // LIVE帯（下15%）
  const bandHeight = 512 * 0.15;

  ctxLive.fillStyle = "rgba(255, 59, 59, 0.6)";
  ctxLive.fillRect(0, 512 - bandHeight, 512, bandHeight);

  // LIVE文字
  ctxLive.fillStyle = "#ffffff";
  ctxLive.font = "bold 64px system-ui, -apple-system, BlinkMacSystemFont";
  ctxLive.textAlign = "center";
  ctxLive.textBaseline = "middle";

  ctxLive.fillText(
    "LIVE",
    256,
    512 - bandHeight / 2
  );
}

/* ===== ダウンロード更新 ===== */
function updateDownload() {
  dlNormal.href = canvasNormal.toDataURL("image/png");
  dlLive.href   = canvasLive.toDataURL("image/png");
}
</script>
