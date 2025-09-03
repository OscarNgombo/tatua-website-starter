import { initThemeControls } from "../ui/theme.js";

const mainNavLinks = [
  { text: "Home", href: "index.html" },
  { text: "About Us", href: "pages/about.html" },
  { text: "Contact", href: "pages/contact.html" },
  { text: "Case Studies & Data Content", href: "pages/case_studies.html" },
];

const ticketingNavLinks = [
  { text: "Raise Ticket", href: "raise_ticket.html" },
  { text: "Tickets List", href: "tickets.html" },
  { text: "People Data", href: "people.html" },
];

const createMainNavbarHTML = ({ activePage, breadcrumbs, basePath }) => {
  const navLinksHTML = mainNavLinks
    .map(
      (link) => `
    <li><a href="${basePath}${link.href}" class="${
        link.href.includes(activePage) ? "active" : ""
      }">${link.text}</a></li>
  `
    )
    .join("");

  const breadcrumbsHTML = breadcrumbs
    ? `
    <div class="breadcrumb-container">
      <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <ol>
          ${breadcrumbs
            .map(
              (crumb) =>
                `<li><a href="${basePath}${crumb.href}">${crumb.text}</a></li>`
            )
            .join("")}
          <li aria-current="page">${
            activePage.charAt(0).toUpperCase() +
            activePage.slice(1).split(".")[0]
          }</li>
        </ol>
      </nav>
    </div>
  `
    : "";

  return `
    <div class="main-header-content">
      <a href="${basePath}index.html" class="nav-logo">
        <img src="${basePath}assets/images/tatua-logo.png" alt="Tatua Solutions Logo" />
      </a>
      <input type="checkbox" id="nav-toggle" class="nav-toggle" />
      <label for="nav-toggle" class="nav-toggle-label">
        <span></span>
        <span></span>
        <span></span>
      </label>
      <nav class="main-nav">
        <ul>
          ${navLinksHTML}
          <li class="nav-controls">
            <button id="theme-switcher" title="Toggle Theme"><i class="fas fa-palette"></i></button>
            <div id="font-control" title="Adjust Font Size">
              Aa
              <input type="range" id="font-slider" min="0.8" max="1.4" step="0.1" value="1" style="vertical-align: middle; width: 60px; margin-left: 0.5rem;" />
            </div>
          </li>
        </ul>
      </nav>
    </div>
    ${breadcrumbsHTML}
  `;
};

const createTicketingNavbarHTML = ({ activePage, basePath, isLoggedIn }) => {
  const navLinksHTML = ticketingNavLinks
    .map(
      (link) =>
        `<a href="${link.href}" class="${
          link.href.includes(activePage) ? "active" : ""
        }">${link.text}</a>`
    )
    .join("\n");

  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  const username = currentUser ? currentUser.fullName || currentUser.username : "Admin";

  const userProfileHTML = isLoggedIn
    ? `
      <div class="user-profile-menu">
        <button class="user-profile-trigger" aria-haspopup="true" aria-expanded="false">
          <span class="username">${username}</span>
          <svg class="user-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24"><path fill="currentColor" d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/></svg>
          <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="16" height="16"><path fill="currentColor" d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/></svg>
        </button>
        <div class="user-profile-dropdown">
          <a href="#" id="logout-link">Logout</a>
        </div>
      </div>
      `
    : "";

  return `
    <div class="logo-container">
      <a href="${basePath}index.html" class="nav-logo"></a><span>Tatua</span>
    </div>
    ${navLinksHTML}
    ${userProfileHTML}
  `;
};

export const renderNavbar = (options) => {
  const {
    containerSelector = "#header-placeholder",
    type,
    activePage,
    breadcrumbs,
    basePath = "",
  } = options;
  const headerContainer = document.querySelector(containerSelector);
  if (!headerContainer) return;

  const isLoggedIn = sessionStorage.getItem("loggedIn") === "true";

  let navbarHTML = "";
  if (type === "main") {
    navbarHTML = createMainNavbarHTML({
      activePage,
      breadcrumbs,
      basePath,
    });
  } else if (type === "ticketing") {
    navbarHTML = createTicketingNavbarHTML({
      activePage,
      basePath,
      isLoggedIn,
    });
  }

  headerContainer.innerHTML = navbarHTML;

  if (type === "main") {
    initThemeControls();
  }
};
