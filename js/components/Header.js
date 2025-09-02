const mainNavLinks = [
  { text: "Home", href: "index.html" },
  { text: "About Us", href: "about.html" },
  { text: "Contact", href: "contact.html" },
  { text: "Case Studies & Data Content", href: "case_studies.html" },
];

const ticketingNavLinks = [
  { text: "Raise Ticket", href: "raise_ticket.html" },
  { text: "Tickets List", href: "tickets.html" },
  { text: "People Data", href: "people.html" },
];

const createMainHeaderHTML = ({
  activePage,
  breadcrumbs,
  basePath,
  isLoggedIn,
}) => {
  const navLinksHTML = mainNavLinks
    .map(
      (link) => `
    <li><a href="${basePath}${link.href}" class="${
        link.text === activePage ? "active" : ""
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
          <li aria-current="page">${activePage}</li>
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
          <li id="login-nav-item" style="display: ${
            isLoggedIn ? "none" : "list-item"
          };"><a href="${basePath}pages/login.html">Login</a></li>
          <li id="logout-nav-item" style="display: ${
            isLoggedIn ? "list-item" : "none"
          };"><a href="#" id="logout-link">Logout</a></li>
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

const createTicketingHeaderHTML = ({ activePage, basePath }) => {
  const navLinksHTML = ticketingNavLinks
    .map(
      (link) =>
        `<a href="${link.href}" class="${
          link.text === activePage ? "active" : ""
        }">${link.text}</a>`
    )
    .join("\n");

  return `
    <div class="logo-container">
      <a href="${basePath}index.html" class="nav-logo"></a><span>Tatua</span>
    </div>
    ${navLinksHTML}
  `;
};

export const renderHeader = (options) => {
  const {
    containerSelector = "#header-placeholder",
    type,
    activePage,
    breadcrumbs,
    basePath = "",
  } = options;
  const headerContainer = document.querySelector(containerSelector);
  if (!headerContainer) return;

  const isLoggedIn = !!localStorage.getItem("authToken");

  let headerHTML = "";
  if (type === "main") {
    headerHTML = createMainHeaderHTML({
      activePage,
      breadcrumbs,
      basePath,
      isLoggedIn,
    });
  } else if (type === "ticketing") {
    headerHTML = createTicketingHeaderHTML({ activePage, basePath });
  }

  headerContainer.innerHTML = headerHTML;
};