import { renderNavbar } from "../components/Navbar.js";
import { renderFooter } from "../components/Footer.js";

export const handleCaseStudiesPage = () => {
  renderNavbar({
    type: "main",
    activePage: "case_studies.html",
    basePath: "../",
    breadcrumbs: [{ text: "Home", href: "index.html" }],
  });
  renderFooter();
};