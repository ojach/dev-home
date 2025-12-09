// ★ GitHub OAuth Client ID（GitHubが発行したやつ）
const GITHUB_CLIENT_ID = "Ov23liIEkTxlETFdaNE5";

const loginBtn = document.getElementById("loginGithub");
if(loginBtn){
  loginBtn.addEventListener("click",()=>{
    const redirect_uri = encodeURIComponent("https://ojach.com/callback"); 
    const scope = "read:user"; // まずはユーザ情報のみ

    const url =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${redirect_uri}` +
      `&scope=${scope}`;

    location.href = url; // 👈 GitHubへ飛ぶ！
  });
}
function toggleA(){
 let box=document.getElementById("assistantBox");
 box.style.display = (box.style.display=="none")?"block":"none";
}

async function loadHeader() {
  const cached = localStorage.getItem("header_html");
  if (cached) {
    document.getElementById("header").innerHTML = cached;
  }
  const res = await fetch("/OJapp/header.html");
  const html = await res.text();
  document.getElementById("header").innerHTML = html;
  localStorage.setItem("header_html", html);
}
loadHeader();


// アイコン画像プレビュー
const iconInput = document.getElementById("iconInput");
const preview = document.getElementById("preview");

iconInput.addEventListener("change", () => {
  const file = iconInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    preview.src = e.target.result; // ← innerHTMLじゃなくsrc
  };
  reader.readAsDataURL(file);
});
// ==============================
// ▼ Create App
// ==============================
// --- Create App ---
async function createApp(){
  const name = document.getElementById("appName").value;
  const url  = document.getElementById("appURL").value;

  const icon = document.getElementById("preview").src || "";
  const iconName = icon.startsWith("data:") ? Date.now()+".png" : "";

  const send = {
    user_id:"guest",
    name:name,
    app_url:url,
    icon_url:iconName
  };

  const res = await fetch("https://ojapp-auth.trc-wasps.workers.dev/api/create",{
    method:"POST",
    headers:{ "Content-Type":"application/json" },
    body:JSON.stringify(send)
  });

  const result = await res.json();
  if(result.status==="ok"){
    alert("保存成功🎉 URL: "+result.access_url);
  } else {
    console.error(result);
    alert("保存失敗💥");
  }
}

// ボタン紐付け ※ createApp定義の後に置く！
document.getElementById("createBtn").onclick = createApp;

 // ===== index.html =====
 let indexHTML = `
<!DOCTYPE html><html lang="ja"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="apple-touch-icon" href="./${fileName}">
<link rel="manifest" href="./manifest.json">
<title>${name}</title>
<style>
body{margin:0;display:flex;justify-content:center;align-items:center;flex-direction:column;
height:100vh;background:#e6f6ff;font-size:28px;font-weight:bold;
font-family:-apple-system,BlinkMacSystemFont,"Segoe UI";text-align:center;}
small{font-size:14px;color:#555;}#t{font-size:32px;color:#ff006a;}
#sub{font-size:14px;color:#444;margin-top:8px;opacity:.75;}
</style></head><body>
<script>
let first=!localStorage.getItem("${name}_installed");
if(first){
 localStorage.setItem("${name}_installed",1);
 let sec=30;
 document.body.innerHTML=\`${name}<br><small>(${url})</small><br>
 あと <span id="t">\${sec}</span> 秒で移動<br>ホーム追加してね🔥\`;
 let timer=setInterval(()=>{sec--;document.getElementById("t").textContent=sec;
 if(sec<=0){clearInterval(timer);location.href="${url}";}},1000);
}else{
 document.body.innerHTML=\`${name}<div id="sub">presented by OJapp</div>\`;
 setTimeout(()=>location.href="${url}",2000);
}
</script>
</body></html>`;


 // ===== manifest.json =====
 let manifestJSON = `{
 "name":"${name}",
 "short_name":"${name}",
 "start_url":"./",
 "display":"standalone",
 "icons":[{"src":"./${fileName}","sizes":"192x192","type":"image/png"}]
 }`;

 // ===== 画面に貼り付け =====
// document.getElementById("output").innerHTML = `
 <h3>📄 index.html</h3>
 <pre id="indexBox">${indexHTML.replace(/</g,"&lt;")}</pre>
 <button onclick="copyText('indexBox')">📋 コピー</button>

 <h3>📄 manifest.json</h3>
 <pre id="manifestBox">${manifestJSON.replace(/</g,"&lt;")}</pre>
 <button onclick="copyText('manifestBox')">📋 コピー</button>

 <h3>🖼 ${fileName}</h3>
 <p>↓右タップで保存</p>
 <img src="${base64}" style="width:150px;border-radius:22px;">
 `;

 alert("👇 ページ下に生成されたよ！🔥");
 
}
 reader.readAsDataURL(file);
});

// ▼ クリップボードコピー機能
function copyText(id){
 const text=document.getElementById(id).innerText;
 navigator.clipboard.writeText(text);
 alert("コピーしたで✌");
}

