import { renderNavbar } from "../components/Navbar.js";
import { renderFooter } from "../components/Footer.js";

export const handleLoginPage = () => {
  renderNavbar({
    type: "main",
    activePage: "login.html",
    basePath: "../",
    breadcrumbs: [{ text: "Home", href: "index.html" }],
  });
  renderFooter();
};