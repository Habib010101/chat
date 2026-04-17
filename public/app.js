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

  // Loop through messages and display each one
  messages.forEach(message => {
    const m = document.createElement("p");

    // Display sender, text, and timestamp
    m.textContent = `${message.sender}: ${message.text} (${message.created_at})`;

    // Add message to DOM
    messageDiv.appendChild(m);
  });
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

  // Send POST request to backend API
  await fetch("/api/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(message)
  });

  // Clear input fields after sending
  text.value = "";
  sender.value = "";

  // Reload messages to render the new one
  await loadMessages();
});

// Initial load of messages when page opens
loadMessages();
