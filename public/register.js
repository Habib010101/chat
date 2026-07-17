const registerForm = document.getElementById("register-form");
const usernameField = document.getElementById("username");
const usernameError = document.getElementById("username-error");
const passwordField = document.getElementById("password");
const passwordError = document.getElementById("password-error");
const createAccountButton = document.getElementById("submit");

const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
const passwordRegex = /^\S{8,30}$/;

function updateButtonState() {
  const username = usernameField.value;
  const password = passwordField.value;

  const isUsernameValid = usernameRegex.test(username);
  const isPasswordValid = passwordRegex.test(password);

  createAccountButton.disabled = !(isUsernameValid && isPasswordValid);
}

usernameField.addEventListener("input", () => {
  console.log("input");
  const usernameValue = usernameField.value;
  updateButtonState();

  if (!usernameValue.trim()) {
    usernameError.textContent = "";
    return;
  }

  if (!usernameRegex.test(usernameValue)) {
    usernameError.textContent =
    "Username must be 3-20 characters long containing only letters, numbers, and underscore.";
    return;
  }

  usernameError.textContent = "";
});

passwordField.addEventListener("input", () => {
  const passwordValue = passwordField.value;
  updateButtonState();

  if (!passwordValue.trim()) {
    passwordError.textContent = "";
    return;
  }

  if (!passwordRegex.test(passwordValue)) {
    passwordError.textContent =
    "Password must be 8-30 characters long.";
    return;
  }

  passwordError.textContent = "";
});

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const registerData = {
    username: usernameField.value.trim(),
    password: passwordField.value.trim()
  };

  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
      "Content-Type": "application/json"
      },
      body: JSON.stringify(registerData)
    });

    switch(response.status) {
      case 409:
        usernameError.textContent = "Username taken.";
        break;
      case 201:
        window.location.href = "/login";
        break;
      default:
        windows.location.href = "/error";
    }
  } catch (err) {
    window.location.href = "/error";
  }
});
