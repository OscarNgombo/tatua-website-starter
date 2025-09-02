document.addEventListener("DOMContentLoaded", () => {
  let fName = document.getElementById("full-name");

  if (fName) {
    fName.addEventListener("blur", () => {
      if (fName.value.trim() !== "") {
        fName.style.borderColor = "var(--default-input-border-color)";
      } else {
        fName.style.borderColor = "var(--error-border-color)";
      }
    });
  }
});
