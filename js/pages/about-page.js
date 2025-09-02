import { renderHeader } from "../components/Header.js";

export const handleAboutPage = () => {
  renderHeader({
    type: "main",
    activePage: "About Us",
    basePath: "../",
    breadcrumbs: [{ text: "Home", href: "index.html" }],
  });
};