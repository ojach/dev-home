// =======================================
// OJapp Runtime v1.0
// 初回：完成証明書 UI を生成
// 2回目以降：即リダイレクト
// =======================================

(function () {

  const data = window.__OJAPP__;
  if (!data) {
    console.error("OJAPP data missing");
    return;
  }

  const { token, name, url, icon_url } = data;
  const KEY = "ojapp_" + token + "_installed";
  const root = document.getElementById("root");

  // =======================================
  // 2回目以降 → 即遷移
  // =======================================
  const isFirst = !localStorage.getItem(KEY);
  if (!isFirst) {
    location.replace(url); // Safari の履歴汚染を避ける
    return;
  }

  // 初回フラグ保存
  localStorage.setItem(KEY, "1");

  // =======================================
  // 完成証明書 UI 生成
  // =======================================
  root.innerHTML = `
    <div id="certificate">

      <!-- 左上 OJapp ブランド -->
      <div id="ojapp-brand">
        <img src="https://github.ojach.com/OJapp/icon/ojapp-logo.png" alt="OJapp">
        <span>OJapp</span>
      </div>

      <!-- 上ゾーン -->
      <div id="top-zone">
        <img id="app-icon" src="${icon_url}" alt="icon">
        <div id="app-name">${name}</div>
        <div id="app-url">${url}</div>

        <div id="qr-wrap">
          <canvas id="qr"></canvas>
        </div>
      </div>

      <!-- カットライン -->
      <div id="cut-line"></div>

      <!-- 下ゾーン -->
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

  // =======================================
  // QR生成（QRライブラリ読み込み待ち）
  // =======================================
  function generateQR() {
    const canvas = document.getElementById("qr");

    if (!window.QRCode) {
      // まだ読み込まれていなければリトライ
      return setTimeout(generateQR, 50);
    }

    QRCode.toCanvas(canvas, url, {
      width: 160,
      margin: 1
    });
  }
  generateQR();

  // =======================================
  // カウントダウン
  // =======================================
  let sec = 30;
  const cd = document.getElementById("countdown");

  const timer = setInterval(() => {
    sec--;
    cd.textContent = sec > 0 ? sec : "🚀";

    if (sec <= 0) {
      clearInterval(timer);
      setTimeout(() => {
        location.replace(url);
      }, 400);
    }
  }, 1000);

})();
