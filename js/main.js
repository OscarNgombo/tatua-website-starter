import { initAuth } from "./auth.js";
import { handleTicketFormSubmission } from "./pages/ticket-form.js";
import { handleMyTicketsPage } from "./pages/tickets-page.js";
import { handlePeoplePage } from "./pages/people-page.js";
import { handleAboutPage } from "./pages/about-page.js";
import { handleContactPage } from "./pages/contact-page.js";
import { handleCaseStudiesPage } from "./pages/case-studies-page.js";
import { handleLoginPage } from "./pages/login-page.js";
import { handleHomePage } from "./pages/home-page.js";
import { handleRegisterPage } from "./pages/register-page.js";

document.addEventListener("DOMContentLoaded", () => {
  // Determine which storage to use based on URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const storageType = urlParams.get("storage");
  let currentTicketStorage = localStorage;

  if (storageType === "session") {
    currentTicketStorage = sessionStorage;
    console.log(
      "Ticket data will be stored in sessionStorage. Updating nav links."
    );
    const headerLinks = document.querySelectorAll(".site-header a");
    headerLinks.forEach((link) => {
      if (
        link.href.includes("raise_ticket.html") ||
        link.href.includes("tickets.html")
      ) {
        const url = new URL(link.href);
        url.searchParams.set("storage", "session");
        link.href = url.toString();
      }
    });
  } else {
    console.log("Ticket data will be stored in localStorage (default).");
  }

  initAuth();

  // Page-specific initializations
  if (document.querySelector(".home-container")) {
    handleHomePage();
  } else if (document.querySelector(".about-main")) {
    handleAboutPage();
  } else if (document.querySelector(".contact-page-layout")) {
    handleContactPage();
  } else if (document.querySelector(".case-studies-page")) {
    handleCaseStudiesPage();
  } else if (document.querySelector(".login-main")) {
    handleLoginPage();
  } else if (document.querySelector(".register-main")) {
    handleRegisterPage();
  } else if (document.querySelector(".form-grid")) {
    handleTicketFormSubmission(currentTicketStorage);
  } else if (document.getElementById("ticket-section")) {
    handleMyTicketsPage(currentTicketStorage);
  } else if (document.getElementById("people-section")) {
    handlePeoplePage();
  }
});
