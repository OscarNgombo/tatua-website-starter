// Theme switcher
const themeSwitcher = document.getElementById("theme-switcher");
let isPurple = true;
themeSwitcher.addEventListener("click", () => {
  document.documentElement.style.setProperty(
    "--primary-color",
    isPurple ? "var(--brown-500)" : "var(--purple-500)"
  );
  document.documentElement.style.setProperty(
    "--primary-600",
    isPurple ? "var(--brown-600)" : "var(--purple-600)"
  );
  document.documentElement.style.setProperty(
    "--primary-700",
    isPurple ? "var(--brown-700)" : "var(--purple-700)"
  );
  document.documentElement.style.setProperty(
    "--primary-900",
    isPurple ? "var(--brown-900)" : "var(--purple-900)"
  );
  document.documentElement.style.setProperty(
    "--orange-light",
    isPurple ? "var(--brown-200)" : "var(--orange-200)"
  );
  document.documentElement.style.setProperty(
    "--purple-50",
    isPurple ? "var(--brown-50)" : "var(--purple-50)"
  );
  document.documentElement.style.setProperty(
    "--primary-200",
    isPurple ? "var(--brown-200)" : "var(--primary-200)"
  );
  document.documentElement.style.setProperty(
    "--primary-400",
    isPurple ? "var(--brown-400)" : "var(--primary-400)"
  );
  document.documentElement.style.setProperty(
    "--primary-500",
    isPurple ? "var(--brown-500)" : "var(--primary-500)"
  );
  document.documentElement.style.setProperty(
    "--primary-100",
    isPurple ? "var(--brown-100)" : "var(--primary-100)"
  );

  isPurple = !isPurple;
});

// Font slider
const fontSlider = document.getElementById("font-slider");
const fontSizeValue = document.getElementById("font-size-value");

fontSlider.addEventListener("input", () => {
  const scale = fontSlider.value;
  document.documentElement.style.setProperty("--font-scale", scale);
  document.documentElement.style.setProperty(
    "--base-font-size",
    `${16 * scale}px`
  );
  fontSizeValue.textContent = `${Math.round(16 * scale)}px`;
});
