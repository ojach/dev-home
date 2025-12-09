// ====== OJapp Base Script ======

// GitHubログイン（後で使う今は温存）
const GITHUB_CLIENT_ID = "Ov23liIEkTxlETFdaNE5";
console.log("OJapp script loaded");

// ---------------------------------
// 🔓 GitHub Login
// ---------------------------------
const loginBtn = document.getElementById("loginGithub");
if(loginBtn){
  loginBtn.addEventListener("click",()=>{
    const redirect_uri = encodeURIComponent("https://ojach.com/callback");
    location.href =
      `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=read:user`;
  });
}

// ---------------------------------
// 🌞 Header読込
// ---------------------------------
async function loadHeader() {
  const cached = localStorage.getItem("header_html");
  if (cached) document.getElementById("header").innerHTML = cached;

  const res = await fetch("/OJapp/header.html");
  const html = await res.text();
  document.getElementById("header").innerHTML = html;
  localStorage.setItem("header_html", html);
}
loadHeader();

// ---------------------------------
// 🖼 アイコンプレビュー
// ---------------------------------
const iconInput = document.getElementById("iconInput");
const preview   = document.getElementById("preview");

if(iconInput){
  iconInput.addEventListener("change", () => {
    const file = iconInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => preview.src = e.target.result;
    reader.readAsDataURL(file);
  });
}

// ---------------------------------
// 🚀 Create App → DB登録
// ---------------------------------
async function createApp(){
  const name = document.getElementById("appName").value;
  const url  = document.getElementById("appURL").value;
  const icon = preview.src || "";

  if(!name || !url || !icon){
    alert("全部入力してな〜👀");
    return;
  }

  const iconName = icon.startsWith("data:") ? Date.now()+".png" : "";

  const send = {
    user_id:"guest",     // ← 今は固定で良い
    name:name,
    app_url:url,
    icon_url:iconName
  };

  const res = await fetch("https://ojapp-auth.trc-wasps.workers.dev/api/create",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(send)
  });

  let result;
  try{ result = await res.json(); }
  catch(e){
    alert("⚠ DBレスポンス取得失敗");
    return;
  }

  if(result.status === "ok"){
    alert("保存成功🎉\nURL発行: "+result.access_url);
  }else{
    console.error(result);
    alert("保存失敗💥");
  }
}

// ボタン発火
const createBtn = document.getElementById("createBtn");
if(createBtn) createBtn.onclick = createApp;

console.log("OJapp loaded OK🚀");
