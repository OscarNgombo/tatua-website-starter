import { showAlert } from "./utils/ui.js";

const updateNav = () => {
  const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";
  const loginNavItem = document.getElementById("login-nav-item");
  const logoutNavItem = document.getElementById("logout-nav-item");

  if (loginNavItem && logoutNavItem) {
    if (isLoggedIn) {
      loginNavItem.style.display = "none";
      logoutNavItem.style.display = "list-item";
    } else {
      loginNavItem.style.display = "list-item";
      logoutNavItem.style.display = "none";
    }
  }
};

const handleLogout = () => {
  const logoutLink = document.getElementById("logout-link");
  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      sessionStorage.removeItem("loggedIn");
      showAlert("You have been logged out.");
      window.location.href = "/index.html";
    });
  }
};

const handleLogin = () => {
  const loginForm = document.querySelector(".login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      if (email === "admin" && password === "password") {
        sessionStorage.setItem("loggedIn", "true");
        window.location.href = "/pages/ticketing_system/raise_ticket.html";
      } else {
        showAlert(
          "Invalid credentials. Please use 'admin' and 'password'.",
          "error"
        );
      }
    });
  }
};

export const initAuth = () => {
  updateNav();
  handleLogout();
  handleLogin();
};
