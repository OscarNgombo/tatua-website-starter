const footerHTML = `
  <h3>Contact Information</h3>
  <span><a href="mailto:hello@tatua.com">hello@tatua.com</a></span> <br />
  <span><a href="tel:+15551234567">+1 (555) 123-4567</a></span>
  <span>
    <address>
      <strong>Tatua Solutions Inc.</strong>
      123 Innovation Drive, Suite 400
      San Francisco, CA 94105
    </address>
  </span>
  <p>&copy; 2025 Tatua Solutions Inc.</p>
`;

export const renderFooter = (options = {}) => {
  const { containerSelector = "#footer-placeholder" } = options;
  const footerContainer = document.querySelector(containerSelector);
  if (footerContainer) {
    footerContainer.innerHTML = footerHTML;
  }
};
