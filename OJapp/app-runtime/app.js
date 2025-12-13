// ===== OJapp runtime =====
(function () {
  const data = window.__OJAPP__;
  if (!data) return;

  const { token, name, url, icon } = data;

  const root = document.getElementById("root");
  const KEY = "ojapp_" + token + "_installed";
  const isFirst = !localStorage.getItem(KEY);

  // 2回目以降は即リダイレクト
  if (!isFirst) {
    location.href = url;
    return;
  }

  // 初回フラグ保存
  localStorage.setItem(KEY, "1");

  // ===== 完成証明書を生成 =====
  root.innerHTML = `
    <div id="certificate">

      <div id="ojapp-brand">
        <img src="https://github.ojach.com/OJapp/icon/ojapp-logo.png">
        <span>OJapp</span>
      </div>

      <div id="top-zone">
        <img id="app-icon" src="${icon}">
        <div id="app-name">${name}</div>
        <div id="app-url">${url}</div>

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

  // ===== QR生成 =====
  function waitQR() {
    if (!window.QRCode) return setTimeout(waitQR, 30);
    const canvas = document.getElementById("qr");
    QRCode.toCanvas(canvas, url, { width: 160, margin: 1 });
  }
  waitQR();

  // ===== カウントダウン =====
  let sec = 30;
  const cd = document.getElementById("countdown");

  const timer = setInterval(() => {
    sec--;
    cd.textContent = sec > 0 ? sec : "🚀";

    if (sec <= 0) {
      clearInterval(timer);
      setTimeout(() => location.href = url, 400);
    }
  }, 1000);
})();
