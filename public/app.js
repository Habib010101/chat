const messageDiv = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const text = document.getElementById("text");
const sender = document.getElementById("sender");


async function loadMessages() {
  const response = await fetch("/messages");
  const messages = await response.json();

  messageDiv.innerHTML = "";

  messages.forEach(message => {
    const m = document.createElement("p");
    m.textContent = `${message.sender}: ${message.text}`;
    messageDiv.appendChild(m);
  });
}

messageForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const message = {
    text: text.value,
    sender: sender.value
  };

  await fetch("/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  loadMessages();
});

loadMessages();