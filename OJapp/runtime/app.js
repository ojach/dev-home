/// /OJapp/runtime/app.js
(function () {
  const data = window.__OJAPP__;
  if (!data) {
    console.error("OJAPP data not found");
    return;
  }

  const { token, name, url, icon } = data;
  const root = document.getElementById("root");

  const KEY = "ojapp_" + token + "_installed";
  const isFirst = !localStorage.getItem(KEY);

  // 2回目以降は即アプリ
  if (!isFirst) {
    location.href = url;
    return;
  }

  // 初回フラグ保存
  localStorage.setItem(KEY, "1");

  // ===== 完成証明書 画面 =====
  root.innerHTML = `
  <div id="certificate">

    <!-- 左上 OJapp ブランド -->
    <div id="ojapp-brand">
      <img src="https://github.ojach.com/OJapp/icon/ojapp-logo.png" alt="OJapp">
      <span>OJapp</span>
    </div>

    <!-- 上ゾーン（共有・安心） -->
    <div id="top-zone">
      <img id="app-icon" alt="App Icon">
      <div id="app-name"></div>
      <div id="app-url"></div>

      <div id="qr-wrap">
        <canvas id="qr"></canvas>
      </div>
    </div>

    <!-- カットライン -->
    <div id="cut-line"></div>

    <!-- 下ゾーン（名刺・説明） -->
    <div id="bottom-zone">
      <p>
        この画面は初回限定で表示されます。<br>
        ブックマークやホーム画面への追加は<br>
        この画面で行ってください。
      </p>

      <div class="count-label">URLに自動で切り替わるまで</div>
      <div id="countdown">30</div>
    </div>

  </div>
  `;

  // ===== データ反映 =====
  const iconEl = document.getElementById("app-icon");
  const nameEl = document.getElementById("app-name");
  const urlEl  = document.getElementById("app-url");

  iconEl.src = icon;
  nameEl.textContent = name;
  urlEl.textContent = url;

 // ===== QR生成（本実装）=====
try{
  const qrCanvas = document.getElementById("qr");

QRCode.toCanvas(qrCanvas, url, {
  width: 160,
  margin: 1,
  color: {
    dark: "#222222",
    light: "#ffffff"
  }
}, function (error) {
  if (error) console.error(error);
});
}

  // ===== カウントダウン =====
  let sec = 30;
  const cd = document.getElementById("countdown");
if (!cd) {
  console.error("countdown element not found");
  return;
}
  const timer = setInterval(() => {
    sec--;
    if (sec > 0) {
      cd.textContent = sec;
      return;
    }

    // 0秒演出 → 🚀
    clearInterval(timer);
    cd.textContent = "🚀";

    // 少し見せてから遷移
    setTimeout(() => {
      location.href = url;
    }, 400);
  }, 1000);


})();
