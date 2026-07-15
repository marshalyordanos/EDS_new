import { useTheme } from "../../context/ThemeContext";

const ICONS = { light: "☀️", dark: "🌙" };
const LABELS = { light: "Light", dark: "Dark" };

const ThemeToggle = () => {
  const { theme, cycleTheme } = useTheme();

  return (
    <button
      onClick={cycleTheme}
      className="theme-toggle-btn"
      title={`Current: ${LABELS[theme]} Mode. Click to switch themes.`}
      aria-label={`Switch theme. Currently ${LABELS[theme]} Mode`}
    >
      <span style={{ fontSize: "16px", marginRight: "6px" }}>{ICONS[theme]}</span>
      <span style={{ fontSize: "12px", fontWeight: "600" }}>{LABELS[theme]}</span>
    </button>
  );
};

export default ThemeToggle;
