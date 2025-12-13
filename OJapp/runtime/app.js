// /OJapp/runtime/app.js

(function () {
  const data = window.__OJAPP__;
  if (!data) {
    console.error("OJAPP data not found");
    return;
  }

  const { token, name, url, icon } = data;
  const root = document.getElementById("root");

  const key = "ojapp_" + token + "_installed";
  const isFirst = !localStorage.getItem(key);

  if (!isFirst) {
    // 2回目以降は即アプリへ
    location.href = url;
    return;
  }

  // 初回フラグ保存
  localStorage.setItem(key, "1");

  // 仮表示（あとで完成証明書に置き換える）
  root.textContent = "Loading OJapp…";

  // 仮カウントダウン（30秒）
  let sec = 30;
  const timer = setInterval(() => {
    sec--;
    if (sec <= 0) {
      clearInterval(timer);
      location.href = url;
    }
  }, 1000);
})();
