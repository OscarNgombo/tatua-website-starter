const applySavedSettings = () => {
  const savedTheme = localStorage.getItem("theme");
  setTheme(savedTheme !== "brown");
  const savedFontScale = localStorage.getItem("fontScale");
  if (savedFontScale) {
    document.documentElement.style.setProperty("--font-scale", savedFontScale);
    const fontSlider = document.getElementById("font-slider");
    if (fontSlider) {
      fontSlider.value = savedFontScale;
    }
  }
};

let isPurple = localStorage.getItem("theme") !== "brown";

const setTheme = (purple) => {
  const theme = purple ? "purple" : "brown";
  const colors = {
    purple: {
      "--primary-color": "var(--purple-500)",
      "--primary-hover": "var(--purple-600)",
      "--primary-50": "var(--purple-50)",
      "--primary-100": "var(--purple-100)",
      "--primary-200": "var(--purple-200)",
      "--primary-300": "var(--purple-300)",
      "--primary-400": "var(--purple-400)",
      "--primary-500": "var(--purple-500)",
      "--primary-600": "var(--purple-600)",
      "--primary-700": "var(--purple-700)",
      "--primary-800": "var(--purple-800)",
      "--primary-900": "var(--purple-900)",
      "--orange-light": "var(--orange-200)",
    },
    brown: {
      "--primary-color": "var(--brown-500)",
      "--primary-hover": "var(--brown-600)",
      "--primary-50": "var(--brown-50)",
      "--primary-100": "var(--brown-100)",
      "--primary-200": "var(--brown-200)",
      "--primary-300": "var(--brown-300)",
      "--primary-400": "var(--brown-400)",
      "--primary-500": "var(--brown-500)",
      "--primary-600": "var(--brown-600)",
      "--primary-700": "var(--brown-700)",
      "--primary-800": "var(--brown-800)",
      "--primary-900": "var(--brown-900)",
      "--orange-light": "var(--brown-200)",
    },
  };

  const selectedColors = colors[theme];
  for (const [key, value] of Object.entries(selectedColors)) {
    document.documentElement.style.setProperty(key, value);
  }
  localStorage.setItem("theme", theme);
  isPurple = purple;
};

export const initThemeControls = () => {
  applySavedSettings();

  const themeSwitcher = document.getElementById("theme-switcher");
  if (themeSwitcher) {
    themeSwitcher.addEventListener("click", () => {
      setTheme(!isPurple);
    });
  }

  const fontSlider = document.getElementById("font-slider");
  if (fontSlider) {
    fontSlider.addEventListener("input", () => {
      const scale = fontSlider.value;
      document.documentElement.style.setProperty("--font-scale", scale);
      localStorage.setItem("fontScale", scale);
    });
  }
};
