const loginForm = document.getElementById("login-form");
const usernameField = document.getElementById("username");
const passwordField = document.getElementById("password");
const errorField = document.getElementById("error");

loginForm.addEventListener("submit", async (event) => {

  event.preventDefault()

  const username = usernameField.value?.trim();
  const password = passwordField.value?.trim();

  if (!username || !password) {
    errorField.textContent = "Username and password are required.";
    return;
  }

  const loginData = {
    username: username,
    password: password
  }

  try {
    const response = await fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(loginData)
    })

    switch(response.status) {
      case 401:
        errorField.textContent = "Invalid credentials.";
        break;
      case 200:
        window.location.href = "/chat";
        break;
      default:
        window.location.href = "/error";
    }
  } catch (err) {
    window.location.href = "/error";
  }
});