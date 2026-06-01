let step = "email"; // Introducing step state: email|| login || signup
const submitBtn = document.getElementById("submit_btn");
const headerMessage = document.getElementById("header_message");
const passwordInputElement = document.getElementById("passwordInput_element");
const form = document.getElementById("loginForm");
const inputEmail = document.getElementById("email");
const errorMessage = document.getElementById("error_message");

// This function toggles the visibility of the password input field by changing its type between "password" and "text"
function togglePassword() {
  const passwordInput = document.getElementById("password"); // Accessing the password input field using its ID
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
  } else {
    passwordInput.type = "password";
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  //Sanitizing email input
  const emailInput = inputEmail.value.trim();

  // EMAIL step
  if (step === "email") {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailInput)) {
      errorMessage.textContent = "Please enter a valid email address.";
      errorMessage.style.display = "block";
      return;
    }

    errorMessage.style.display = "none";

    const userExists = emailInput === "kyngsliy1995@gmail.com";

    if (userExists) {
      step = "login";
      renderLogin();
    }
  }

  // Password step
  if (step === "login") {
    const passwordInput = document.getElementById("password"); //The id is dynamically created in renderLogin below
    const passwordValue = passwordInput.value.trim();

    //User typed nothing this prevents UI bug of reading invalid input check when form is submitted
    if (!passwordValue) {
      return;
    }

    //Invalid input check section
    if (passwordValue.length < 6) {
      errorMessage.textContent = "Password must be at least 6 characters.";
      errorMessage.style.display = "block";
      return;
    }

    if (passwordValue !== "123456") {
      errorMessage.textContent = "Incorrect password.";
      errorMessage.style.display = "block";
      return;
    }

    errorMessage.style.display = "none";
    window.location.href = "./board.html"; // Redirect to board page on successful login
    console.log("Welcome to Board");
  }
});

function renderLogin() {
  headerMessage.textContent = "Welcome back";
  passwordInputElement.innerHTML = "";

  // Div wrapper
  const div = document.createElement("div");
  div.classList.add("div_container");

  // Creating input
  const passwordInput = document.createElement("input");
  passwordInput.classList.add("password_input");
  passwordInput.placeholder = "Enter password...";
  passwordInput.type = "password";
  passwordInput.id = "password";

  // Creating button
  const togglePasswordBtn = document.createElement("button");
  togglePasswordBtn.type = "button";
  togglePasswordBtn.innerHTML = '<i class="fa-regular fa-eye"></i>';
  togglePasswordBtn.classList.add("togglePassword_btn");

  //toggle logic
  togglePasswordBtn.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePasswordBtn.innerHTML = togglePasswordBtn.innerHTML =
        '<i class="fa-regular fa-eye-slash"></i>';
    } else {
      passwordInput.type = "password";
      togglePasswordBtn.innerHTML =
        '<i class="fa-regular fa-eye" aria-hidden="true"></i>';
    }
  });

  //Attaching the dynamically created elements to the div containing element
  div.appendChild(passwordInput);
  div.appendChild(togglePasswordBtn);
  passwordInputElement.appendChild(div);

  //Changes the submit button text-content to login after email validation
  submitBtn.textContent = "Login";
}
