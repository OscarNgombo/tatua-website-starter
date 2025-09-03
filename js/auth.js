import { showAlert } from "./utils/ui.js";
import { encryptData, decryptData } from "./utils/crypto.js";

const handleLogout = () => {
  document.body.addEventListener("click", (e) => {
    if (e.target && e.target.id === "logout-link") {
      e.preventDefault();
      sessionStorage.removeItem("loggedIn");
      showAlert("You have been logged out.");
      window.location.href = "/index.html";
    }
  });
};

const handleLogin = () => {
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailOrUsername = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      const encryptedUsers = localStorage.getItem("users");
      const users = encryptedUsers ? decryptData(encryptedUsers) : [];
      const user = users.find(
        (u) =>
          (u.email === emailOrUsername || u.username === emailOrUsername) &&
          u.password === password
      );

      if (user) {
        sessionStorage.setItem("loggedIn", "true");
        sessionStorage.setItem(
          "currentUser",
          JSON.stringify({
            username: user.username,
            fullName: user.fullName,
          })
        );
        window.location.href = "/pages/ticketing_system/raise_ticket.html";
      } else {
        showAlert(
          "Invalid credentials. Please check your username/email and password.",
          "error"
        );
      }
    });
  }
};

const handleRegister = () => {
  const registerForm = document.querySelector(".register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const fullName = document.getElementById("full-name").value;
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const repeatPassword = document.getElementById("re-password").value;

      if (!fullName || !username || !email || !password || !repeatPassword) {
        showAlert("All fields are required.", "error");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showAlert("Please enter a valid email address.", "error");
        return;
      }

      const checks = {
        length: (p) => p.length >= 8,
        lowercase: (p) => /[a-z]/.test(p),
        uppercase: (p) => /[A-Z]/.test(p),
        number: (p) => /[0-9]/.test(p),
        special: (p) => /[!@#$%^&*]/.test(p),
      };
      const isStrong = Object.values(checks).every((check) => check(password));

      if (!isStrong) {
        showAlert(
          "Password does not meet all the strength requirements.",
          "error"
        );
        return;
      }

      if (password !== repeatPassword) {
        showAlert("Passwords do not match. Please try again.", "error");
        return;
      }

      const encryptedUsers = localStorage.getItem("users");
      const users = encryptedUsers ? decryptData(encryptedUsers) : [];

      const userExists = users.some(
        (u) => u.username === username || u.email === email
      );
      if (userExists) {
        showAlert(
          "A user with this username or email already exists.",
          "error"
        );
        return;
      }

      const newUser = { fullName, username, email, password };
      users.push(newUser);
      localStorage.setItem("users", encryptData(users));

      showAlert("Account created successfully! You can now log in.", "success");
      window.location.href = "login.html";
    });
  }
};

const handleEmailValidation = () => {
  const emailInput = document.getElementById("email");
  if (!emailInput) return;

  const errorContainer = emailInput.nextElementSibling;
  if (!errorContainer || !errorContainer.classList.contains("error-message")) {
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateEmail = () => {
    const email = emailInput.value;
    if (email.length > 0 && !emailRegex.test(email)) {
      emailInput.classList.add("invalid");
      errorContainer.textContent = "Please enter a valid email format.";
      errorContainer.style.display = "block";
    } else {
      emailInput.classList.remove("invalid");
      errorContainer.style.display = "none";
    }
  };

  emailInput.addEventListener("input", validateEmail);

  emailInput.addEventListener("blur", () => {
    if (emailInput.value.length === 0) {
      emailInput.classList.add("invalid");
      errorContainer.textContent = "Email address is required.";
      errorContainer.style.display = "block";
    } else {
      validateEmail();
    }
  });
};

const handlePasswordValidation = () => {
  const passwordInput = document.getElementById("password");
  const feedbackContainer = document.getElementById(
    "password-strength-feedback"
  );
  if (!passwordInput || !feedbackContainer) return;

  const strengthBar = document.getElementById("password-strength-bar");
  const strengthText = document.getElementById("password-strength-text");
  const criteriaList = {
    length: document.getElementById("length"),
    lowercase: document.getElementById("lowercase"),
    uppercase: document.getElementById("uppercase"),
    number: document.getElementById("number"),
    special: document.getElementById("special"),
  };
  const submitButton = document.querySelector(
    ".register-form button[type='submit']"
  );

  const checks = {
    length: (p) => p.length >= 8,
    lowercase: (p) => /[a-z]/.test(p),
    uppercase: (p) => /[A-Z]/.test(p),
    number: (p) => /[0-9]/.test(p),
    special: (p) => /[!@#$%^&*]/.test(p),
  };

  passwordInput.addEventListener("focus", () => {
    feedbackContainer.style.display = "block";
  });

  passwordInput.addEventListener("input", () => {
    const password = passwordInput.value;
    let score = 0;

    for (const key in checks) {
      if (checks[key](password)) {
        criteriaList[key].classList.add("valid");
        score++;
      } else {
        criteriaList[key].classList.remove("valid");
      }
    }

    strengthBar.style.width = `${(score / 5) * 100}%`;

    if (score < 3) {
      strengthText.textContent = "Weak";
      strengthBar.className = "weak";
    } else if (score < 5) {
      strengthText.textContent = "Medium";
      strengthBar.className = "medium";
    } else {
      strengthText.textContent = "Strong";
      strengthBar.className = "strong";
    }

    submitButton.disabled = score < 5;
  });

  if (document.querySelector(".register-form")) {
    submitButton.disabled = true;
  }
};

const handleUserProfileDropdown = () => {
  document.body.addEventListener("click", (e) => {
    const trigger = e.target.closest(".user-profile-trigger");
    const dropdown = document.querySelector(".user-profile-dropdown");

    if (!dropdown) return;

    if (trigger) {
      const isExpanded = trigger.getAttribute("aria-expanded") === "true";
      trigger.setAttribute("aria-expanded", !isExpanded);
      dropdown.classList.toggle("show");
    } else if (!e.target.closest(".user-profile-dropdown")) {
      const triggerButton = document.querySelector(".user-profile-trigger");
      if (triggerButton) {
        triggerButton.setAttribute("aria-expanded", "false");
      }
      dropdown.classList.remove("show");
    }
  });
};

export const initAuth = () => {
  handleLogout();
  handleLogin();
  handleRegister();
  handlePasswordValidation();
  handleEmailValidation();
  handleUserProfileDropdown();
};
