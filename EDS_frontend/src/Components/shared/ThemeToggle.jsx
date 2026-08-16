import { FiSun, FiMoon } from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";

const ICONS = { light: FiSun, dark: FiMoon };
const LABELS = { light: "Light", dark: "Dark" };

const ThemeToggle = () => {
  const { theme, cycleTheme } = useTheme();
  const Icon = ICONS[theme];

  return (
    <button
      onClick={cycleTheme}
      className="theme-toggle-btn"
      title={`Current: ${LABELS[theme]} Mode. Click to switch themes.`}
      aria-label={`Switch theme. Currently ${LABELS[theme]} Mode`}
    >
      <Icon size={16} style={{ marginRight: "6px" }} />
      <span style={{ fontSize: "12px", fontWeight: "600" }}>{LABELS[theme]}</span>
    </button>
  );
};

export default ThemeToggle;
