export const initRefreshButton = ({ buttonSelector, onRefresh }) => {
  const button = document.querySelector(buttonSelector);
  if (!button) {
    return;
  }

  const icon = button.querySelector("svg");

  button.addEventListener("click", () => {
    if (icon) {
      icon.style.transition = "transform 0.5s ease";
      icon.style.transform = "rotate(360deg)";
      icon.addEventListener(
        "transitionend",
        () => {
          icon.style.transition = "none";
          icon.style.transform = "rotate(0deg)";
        },
        { once: true }
      );
    }

    if (onRefresh) onRefresh();
  });
};
