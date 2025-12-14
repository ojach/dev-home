//すべてのページにダークモードを付与するための.

// ===============================
//  ダークモードの読み込み時初期化
// ===============================
(function() {
  const saved = localStorage.getItem("ojapp_dark");

  if (saved === "1") {
    document.documentElement.classList.add("dark");
  }

  // ヘッダー挿入後にアイコン更新（少し遅延）
  setTimeout(updateThemeIcon, 10);
})();


// ===============================
//  ダークモード切り替え
// ===============================
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.toggle("dark");

  localStorage.setItem("ojapp_dark", isDark ? "1" : "0");

  updateThemeIcon();
}


// ===============================
//  ヘッダーのアイコンを更新する
// ===============================
function updateThemeIcon() {
  const button = document.querySelector(".switch");
  if (!button) return;

  if (document.documentElement.classList.contains("dark")) {
    button.textContent = "🌙";
  } else {
    button.textContent = "🤩";
  }
}
