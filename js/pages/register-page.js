import { renderNavbar } from "../components/Navbar.js";
import { renderFooter } from "../components/Footer.js";

export const handleRegisterPage = () => {
  renderNavbar({
    type: "main",
    activePage: "register.html",
    basePath: "../",
    breadcrumbs: [{ text: "Home", href: "index.html" }],
  });
  renderFooter();
};