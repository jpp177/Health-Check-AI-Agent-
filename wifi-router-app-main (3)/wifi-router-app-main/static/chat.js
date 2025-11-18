function addMsg(sender, text) {
  const box = document.getElementById("chatBox");
  const div = document.createElement("div");
  div.className = "msg " + (sender === "You" ? "user" : "bot");

  // Preserve bold headings in LLM answer
  div.innerHTML = `<b>${sender}:</b> ` + text;
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

async function runDiag() {
  await fetch("/run-diagnostics", {method:"POST"});
  addMsg("Bot", "✅ Diagnostics complete.\nAsk me about your Wi-Fi.");
}

async function sendChat() {
  const input = document.getElementById("chatInput");
  const msg = input.value.trim();
  if (!msg) return;
  addMsg("You", msg);
  input.value = "";

  const res = await fetch("/chat", {
    method:"POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ message: msg })
  }).then(r => r.json());

  addMsg("Bot", res.reply);

  if (res.ticket_created)
    addMsg("Bot", "📨 Ticket submitted to support ✅");
}

document.getElementById("runBtn").onclick = runDiag;
document.getElementById("sendBtn").onclick = sendChat;
document.getElementById("chatInput").addEventListener("keydown", e => {
  if (e.key === "Enter") sendChat();
});
