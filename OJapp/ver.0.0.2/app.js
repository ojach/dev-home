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

 if(!file||!name||!url){ alert("全部入力してな〜🔥"); return;}

 let reader=new FileReader();
 reader.onload=()=>{
 let iconData=reader.result;

 let html = `
<!DOCTYPE html>
<html><head>
<title>${name}</title>
<link rel="apple-touch-icon" href="${iconData}">
<link rel="manifest" href="manifest.json">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background:#e6f6ff;display:flex;justify-content:center;align-items:center;height:100vh;">
<div id="logo" style="background:white;padding:20px 28px;border-radius:22px;font-size:30px;font-weight:bold;color:#ff69b4;box-shadow:0 4px 10px rgba(0,0,0,.25);animation:pulse 1.2s infinite;">${name}</div>
<script>
setTimeout(()=>location.href='${url}',5000);
</script>
</body></html>`;

 const blob=new Blob([html],{type:"text/html"});
 window.open(URL.createObjectURL(blob),"_blank");
 alert("生成ページが開いたよ！ホーム追加や！🔥");
 };

 reader.readAsDataURL(file);
});
