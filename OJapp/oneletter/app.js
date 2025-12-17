const id = location.pathname.split("/").pop();

// 仮データ（あとでWorkers接続）
const letter = {
  image: "sample.jpg",
  text: "あの日の空は、ちゃんと覚えてる"
};

document.getElementById("letterImage").src = letter.image;
document.getElementById("letterText").innerText = letter.text;
