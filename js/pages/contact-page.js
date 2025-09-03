import { renderNavbar } from "../components/Navbar.js";
import { renderFooter } from "../components/Footer.js";

export const handleContactPage = () => {
  renderNavbar({
    type: "main",
    activePage: "contact.html",
    basePath: "../",
    breadcrumbs: [{ text: "Home", href: "index.html" }],
  });
  renderFooter();
};