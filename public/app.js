const ws = new WebSocket(`ws://${window.location.host}`);

// Get references to DOM elements from index.html
const messageDiv = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const textField = document.getElementById("text");
const logoutButton = document.getElementById("logout-button");

function appendMessageToMessageDiv(message) {
  const e = document.createElement("p");
  e.textContent = `${message.username}: ${message.text} (${message.created_at})`;
  messageDiv.appendChild(e);
}

async function loadMessages() {
  const response = await fetch("/api/messages");
  const messages = await response.json();

  messageDiv.innerHTML = "";

  messages.forEach(message => appendMessageToMessageDiv(message));
}

ws.addEventListener("message", (messageEvent) => {
  try {
    const message = JSON.parse(messageEvent.data);
    appendMessageToMessageDiv(message);
  } catch (err) {
    window.location.href = "/error";
  }
});

// Handle form submission (sending a new message)
messageForm.addEventListener("submit", async (event) => {
  // Prevent page reload
  event.preventDefault();

  // Create message object from input values
  const newMessage = {
    text: textField.value,
  };

  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(newMessage));
  }

  messageForm.reset();
  
  // Load new message into chat
  /*
  appendMessageToMessageDiv(messageFromResponse);
  */
});

logoutButton.addEventListener("click", async () => {
  try {
    const response = await fetch("api/logout", {
      method: "POST"
    });

    if (!response.ok) {
      return window.location.href = "/error";
    }

    window.location.href = "/login";

  } catch (err) {
    window.location.href = "/error";
  }
});

// Initial load of messages when page opens
loadMessages();
