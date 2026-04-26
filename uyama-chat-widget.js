(function () {

  // =========================
  // CSS 注入
  // =========================
  const style = document.createElement("style");
  style.innerHTML = `
  .uyama-chat-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: #333;
    color: #fff;
    padding: 14px 18px;
    border-radius: 30px;
    cursor: pointer;
    font-size: 14px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    z-index: 99999;
  }

  .uyama-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: none;
    z-index: 99998;
  }

  .uyama-modal {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 80vh;
    background: #fff;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    display: none;
    flex-direction: column;
    z-index: 99999;
    font-family: sans-serif;
  }

  .uyama-modal-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .uyama-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .uyama-header-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .uyama-close-btn {
    cursor: pointer;
    font-size: 20px;
  }

  .uyama-chat-body {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
  }

  .uyama-message {
    margin-bottom: 12px;
    max-width: 75%;
    padding: 10px 12px;
    border-radius: 12px;
    font-size: 14px;
  }

  .uyama-user {
    background: #dceeff;
    margin-left: auto;
  }

  .uyama-ai-row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
  }

  .uyama-ai-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
    margin-top: 4px;
  }

  .uyama-bubble {
    background: #f0f2f5;
    padding: 10px 14px;
    border-radius: 14px;
    max-width: 85%;
    font-size: 14px;
  }

  .uyama-chat-input {
    display: flex;
    border-top: 1px solid #eee;
    padding: 10px 10px 15px 10px;
    background: #fff;
  }

  .uyama-input-wrapper {
    position: relative;
    flex: 1;
  }

  .uyama-chat-input input {
    width: 100%;
    padding: 10px 40px 10px 10px;
    border-radius: 8px;
    border: 1px solid #ddd;
    font-size: 16px;
    box-sizing: border-box;
  }

  .uyama-voice-btn {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    opacity: 0.6;
  }

  .uyama-send-btn {
    margin-left: 8px;
    padding: 10px 16px;
    border: none;
    border-radius: 8px;
    background: #333;
    color: white;
    cursor: pointer;
  }
  `;
  document.head.appendChild(style);

  // =========================
  // HTML 注入
  // =========================
  const container = document.createElement("div");
  container.innerHTML = `
  <div class="uyama-chat-button">🗨 AI相談</div>

  <div class="uyama-modal-overlay"></div>

  <div class="uyama-modal">
    <div class="uyama-modal-header">
      <div class="uyama-header-left">
        <img src="https://github.ojach.com/icon/ai-icon2.png" class="uyama-header-icon">
        お墓のご相談窓口 AIチャット
      </div>
      <span class="uyama-close-btn">×</span>
    </div>

    <div class="uyama-chat-body">
      <div class="uyama-ai-row">
        <img src="https://github.ojach.com/icon/ai-icon2.png" class="uyama-ai-avatar">
        <div class="uyama-bubble">
          お墓に関するご相談をお受けしております。<br>
          なにかお困りのことはございますか？
        </div>
      </div>
    </div>

    <div class="uyama-chat-input">
      <div class="uyama-input-wrapper">
        <input type="text" placeholder="メッセージを入力…" />
        <button class="uyama-voice-btn">🎤</button>
      </div>
      <button class="uyama-send-btn">送信</button>
    </div>
  </div>
  `;
  document.body.appendChild(container);

  // =========================
  // JS ロジック
  // =========================
  const button = container.querySelector(".uyama-chat-button");
  const modal = container.querySelector(".uyama-modal");
  const overlay = container.querySelector(".uyama-modal-overlay");
  const closeBtn = container.querySelector(".uyama-close-btn");
  const chatBody = container.querySelector(".uyama-chat-body");
  const input = container.querySelector("input");
  const sendBtn = container.querySelector(".uyama-send-btn");

  let chatHistory = [];

  button.onclick = () => {
    modal.style.display = "flex";
    overlay.style.display = "block";
  };

  overlay.onclick = closeBtn.onclick = () => {
    modal.style.display = "none";
    overlay.style.display = "none";
  };

  async function sendMessage() {
    if (!input.value.trim()) return;

    const userText = input.value;

    chatBody.innerHTML += `<div class="uyama-message uyama-user">${userText}</div>`;
    input.value = "";

    const res = await fetch("https://aitest.trc-wasps.workers.dev", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        history: chatHistory.concat({ role: "user", content: userText })
      })
    });

    const data = await res.json();

    const formatted = data.reply.replace(/\n/g, "<br>");

    chatBody.innerHTML += `
      <div class="uyama-ai-row">
        <img src="https://github.ojach.com/icon/ai-icon2.png" class="uyama-ai-avatar">
        <div class="uyama-bubble">${formatted}</div>
      </div>
    `;

    chatHistory.push({ role: "user", content: userText });
    chatHistory.push({ role: "assistant", content: data.reply });
    chatHistory = chatHistory.slice(-8);

    chatBody.scrollTop = chatBody.scrollHeight;
  }

  sendBtn.onclick = sendMessage;
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

})();
