function toggleTheme() {
  document.documentElement.classList.toggle("dark");

  // ついでに絵文字も変える
  const sw = document.querySelector(".switch");
  if (document.documentElement.classList.contains("dark")) {
    sw.textContent = "🌙";
  } else {
    sw.textContent = "🤩";
  }
}
