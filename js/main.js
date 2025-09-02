import { initThemeControls } from "./ui/theme.js";
import { initAuth } from "./auth.js";
import { handleTicketFormSubmission } from "./pages/ticket-form.js";
import { handleMyTicketsPage } from "./pages/tickets-page.js";
import { handlePeoplePage } from "./pages/people-page.js";

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

  initThemeControls();
  initAuth();

  if (document.querySelector(".form-grid")) {
    handleTicketFormSubmission(currentTicketStorage);
  }

  if (document.getElementById("ticket-section")) {
    handleMyTicketsPage(currentTicketStorage);
  }

  if (document.getElementById("people-section")) {
    handlePeoplePage();
  }
});
