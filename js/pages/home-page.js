import { renderNavbar } from "../components/Navbar.js";
import { renderFooter } from "../components/Footer.js";

export const handleHomePage = () => {
  renderNavbar({
    type: "main",
    activePage: "index.html",
    basePath: "./",
  });
  renderFooter();
};