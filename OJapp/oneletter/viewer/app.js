// ========== One Letter Viewer Script ==========

// Workers API
const API = "https://ojapp-oneletter.trc-wasps.workers.dev";

// 手紙のIDをURLから取得
const segments = location.pathname.split("/").filter(s => s !== "");
const id = segments[segments.length - 1];


const letterView = document.getElementById("letterView");
const firstOverlay = document.getElementById("firstOverlay");

// メイン処理
init();

async function init() {
  const res = await fetch(`${API}/api/oneletter/${id}`);
  const data = await res.json();

  renderLetter(data);
  showOverlay(id);
}

// 読み込みレンダリング
function renderLetter(d) {
  const writing = d.writing === "vertical" ? "tategaki" : "";
  let html = "";

  if (d.layout === "top") {
    html = `
      <div class="layout-top" style="background:${d.bgColor}">
        ${d.imageURL ? `<img src="${d.imageURL}" class="img-top">` : ""}
        <p class="letter-text ${writing}" style="font-size:${d.fontSize}px; font-family:${d.font}">
          ${escape(d.text)}
        </p>
      </div>
    `;
  }

  if (d.layout === "overlay") {
    html = `
      <div class="layout-overlay">
        ${d.imageURL ? `<img src="${d.imageURL}" class="img-overlay">` : ""}
        <p class="letter-text overlay ${writing}" style="font-size:${d.fontSize}px; font-family:${d.font}">
          ${escape(d.text)}
        </p>
      </div>
    `;
  }

  if (d.layout === "text") {
    html = `
      <div class="layout-text" style="background:${d.bgColor}">
        <p class="letter-text ${writing}" style="font-size:${d.fontSize}px; font-family:${d.font}">
          ${escape(d.text)}
        </p>
      </div>
    `;
  }

  if (d.layout === "diary") {
    html = `
      <div class="layout-diary" style="background:${d.bgColor}">
        <div class="frame">${d.imageURL ? `<img src="${d.imageURL}">` : ""}</div>
        <p class="letter-text ${writing}" style="font-size:${d.fontSize}px; font-family:${d.font}">
          ${escape(d.text)}
        </p>
      </div>
    `;
  }

  letterView.innerHTML = html;
}

// HTMLエスケープ
function escape(str) {
  return str.replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[m]));
}

// 初回だけ 30秒オーバーレイ
function showOverlay(id) {
  const key = "oneletter_opened_" + id;

  if (!localStorage.getItem(key)) {
    firstOverlay.classList.remove("hidden");

    let sec = 30;
    const timer = setInterval(() => {
      document.querySelector(".count").textContent = sec;
      sec--;
      if (sec < 0) {
        clearInterval(timer);
        firstOverlay.style.display = "none";
      }
    }, 1000);

    localStorage.setItem(key, "1");
  }
}
