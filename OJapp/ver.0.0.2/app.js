function toggleA(){
 let box=document.getElementById("assistantBox");
 box.style.display = (box.style.display=="none")?"block":"none";
}

document.getElementById("iconInput").addEventListener("change",e=>{
 const file=e.target.files[0];
 if(!file)return;
 document.getElementById("preview").src = URL.createObjectURL(file);
});

document.getElementById("createBtn").addEventListener("click",()=>{

 let file=document.getElementById("iconInput").files[0];
 let name=document.getElementById("appName").value.trim();
 let url=document.getElementById("appURL").value.trim();

 if(!file||!name||!url){ alert("全部入力してな🔥"); return;}

 let reader=new FileReader();
 reader.onload=()=>{

 let base64 = reader.result;

 //=============================
 // ▼ index.html 生成
 //=============================
 let indexHTML = `
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="apple-touch-icon" href="./icon.png">
<link rel="manifest" href="./manifest.json">
<title>${name}</title>
<style>
body{
 margin:0;display:flex;justify-content:center;align-items:center;
 height:100vh;background:#e6f6ff;font-size:28px;font-weight:bold;
 font-family:-apple-system,BlinkMacSystemFont,"Segoe UI";
}
</style>
</head>
<body>
${name}
<script>
let first = !localStorage.getItem("${name}_installed");
if(first){
  localStorage.setItem("${name}_installed",1);
  let sec = 30;
  document.body.innerHTML="${name}<br><small>(${url})</small><br>あと <span id='t'></span> 秒で移動<br>ホーム追加してね🔥";
  let timer=setInterval(()=>{
    sec--; document.getElementById("t").textContent=sec;
    if(sec<=0){clearInterval(timer);location.href="${url}";}
  },1000);
}else{
 setTimeout(()=>location.href="${url}",3000);
}
</script>
</body>
</html>`;


 //=============================
 // ▼ manifest.json 生成
 //=============================
 let manifestJSON = `{
  "name": "${name}",
  "short_name": "${name}",
  "start_url": "./",
  "display": "standalone",
  "icons":[
    {"src":"./icon.png","sizes":"192x192","type":"image/png"}
  ]
 }`;


 //=============================
 // ▼ 出力HTMLに反映
 //=============================
 document.body.insertAdjacentHTML("beforeend", `
 <div style='padding:20px;background:#fff;margin:20px;border-radius:14px;'>
  <h3>📄 index.html</h3>
  <pre style="white-space:pre-wrap;background:#eee;padding:10px;border-radius:10px;">${indexHTML.replace(/</g,"&lt;")}</pre>

  <h3>📄 manifest.json</h3>
  <pre style="white-space:pre-wrap;background:#eee;padding:10px;border-radius:10px;">${manifestJSON.replace(/</g,"&lt;")}</pre>

  <h3>🖼 icon.png</h3>
  <p>↓これを右タップして保存</p>
  <img src="${base64}" style="width:140px;border-radius:22px;">
 </div>
 `);

 alert("👇 ページ下にファイル生成したよ！🔥 コピペして設置！");

 };
 reader.readAsDataURL(file);
});
