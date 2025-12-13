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

  // ===== 2回目以降は即遷移 =====
  if (!isFirst) {
    location.replace(url);
    return;
  }

  // ===== 完成証明書 画面（先に描画）=====
  root.innerHTML = `
    <div id="certificate">
      <div id="ojapp-brand">
        <img src="https://github.ojach.com/OJapp/icon/ojapp-logo.png">
        <span>OJapp</span>
      </div>

      <div id="top-zone">
        <img id="app-icon">
        <div id="app-name"></div>
        <div id="app-url"></div>
        <div id="qr-wrap"><canvas id="qr"></canvas></div>
      </div>

      <div id="cut-line"></div>

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

  // ===== 描画後に初回フラグ確定（重要）=====
  localStorage.setItem(KEY, "1");

  // ===== データ反映 =====
  document.getElementById("app-icon").src = icon;
  document.getElementById("app-name").textContent = name;
  document.getElementById("app-url").textContent = url;

  // ===== QR生成 =====
  if (window.QRCode) {
    QRCode.toCanvas(document.getElementById("qr"), url, {
      width: 160,
      margin: 1,
      color: { dark: "#222", light: "#fff" }
    });
  }

  // ===== カウントダウン =====
  let sec = 30;
  const cd = document.getElementById("countdown");

  const timer = setInterval(() => {
    sec--;
    if (sec > 0) {
      cd.textContent = sec;
      return;
    }
    clearInterval(timer);
    cd.textContent = "🚀";
    setTimeout(() => location.href = url, 400);
  }, 1000);

})();
