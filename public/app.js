// Get references to DOM elements from index.html
const messageDiv = document.getElementById("messages");
const messageForm = document.getElementById("message-form");
const text = document.getElementById("text");
const sender = document.getElementById("sender");

function appendMessageToMessageDiv(message) {
  const e = document.createElement("p");
  e.textContent = `${message.sender}: ${message.text} (${message.created_at})`;
  messageDiv.appendChild(e);
}

async function loadMessages() {
  // Send GET request to API
  const response = await fetch("/api/messages");

  // Parse JSON response into JavaScript array
  const messages = await response.json();

  // Clear current messages before re-rendering
  messageDiv.innerHTML = "";

  messages.forEach(message => appendMessageToMessageDiv(message));
}

// Handle form submission (sending a new message)
messageForm.addEventListener("submit", async (event) => {
  // Prevent page reload
  event.preventDefault();

  // Create message object from input values
  const message = {
    text: text.value,
    sender: sender.value
  };
  
  // Insert message into messages table
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(newMessage)
  });

  const messageFromResponse = await response.json();
  messageForm.reset();

  // Load new message into chat
  appendMessageToMessageDiv(messageFromResponse);
});

// Initial load of messages when page opens
loadMessages();
