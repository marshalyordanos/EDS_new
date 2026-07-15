import { useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { useTheme } from "../../context/ThemeContext";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const markers = [
  { name: "Ethiopia",     coordinates: [40.0,   9.1]  },
  { name: "Kenya",        coordinates: [37.9,  -1.0]  },
  { name: "Nigeria",      coordinates: [8.7,    9.1]  },
  { name: "Uganda",       coordinates: [32.3,   1.4]  },
  { name: "Tanzania",     coordinates: [34.9,  -6.4]  },
  { name: "Rwanda",       coordinates: [29.9,  -2.0]  },
  { name: "Ghana",        coordinates: [-1.0,   7.9]  },
  { name: "South Africa", coordinates: [25.1, -29.0]  },
  { name: "Senegal",      coordinates: [-14.5, 14.5]  },
  { name: "Egypt",        coordinates: [30.8,  26.8]  },
];

const GeographicReach = () => {
  const [hovered, setHovered] = useState(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // SVG fills can't read CSS vars, so resolve map colors from the theme here.
  // Landmasses stay subtle in both modes; the red pins stay brand-red.
  const landFill = isDark ? "var(--color-gray-700)" : "var(--color-gray-200)";
  const landStroke = isDark ? "var(--color-gray-600)" : "var(--color-gray-50)";
  const labelFill = isDark ? "var(--color-gray-300)" : "var(--color-gray-900)";

  return (
    <section className="geo-section">
      <div className="geo-container">
        <div className="geo-layout">

          {/* Left: text + country list */}
          <div className="geo-text-side" data-aos="fade-right">
            <span className="geo-subtitle">Geographic Reach</span>
            <h2 className="geo-title">Operating across<br />10+ countries</h2>
            <p className="geo-description">
              A growing footprint across sub-Saharan Africa and North Africa,
              expanding into new markets every year.
            </p>

            <div className="geo-country-list">
              {markers.map((m) => (
                <div
                  key={m.name}
                  className={`geo-country-pill${hovered === m.name ? " active" : ""}`}
                  onMouseEnter={() => setHovered(m.name)}
                  onMouseLeave={() => setHovered(null)}
                >
                  <span className="geo-country-dot" />
                  {m.name}
                </div>
              ))}
            </div>
          </div>

          {/* Right: map */}
          <div className="geo-map-side" data-aos="fade-left">
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [20, 0], scale: 370 }}
              width={600}
              height={580}
              style={{ width: "100%", height: "auto" }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={landFill}
                      stroke={landStroke}
                      strokeWidth={0.7}
                      style={{
                        default: { outline: "none" },
                        hover:   { outline: "none", fill: landFill },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
                }
              </Geographies>

              {markers.map((marker) => {
                const isActive = hovered === marker.name;
                return (
                  <Marker
                    key={marker.name}
                    coordinates={marker.coordinates}
                    onMouseEnter={() => setHovered(marker.name)}
                    onMouseLeave={() => setHovered(null)}
                  >
                    {isActive && (
                      <text
                        textAnchor="middle"
                        y={-13}
                        style={{
                          fontSize: "6.5px",
                          fontWeight: "700",
                          fill: labelFill,
                          pointerEvents: "none",
                          fontFamily: "Raleway, sans-serif",
                        }}
                      >
                        {marker.name}
                      </text>
                    )}
                    {/* Pulse ring */}
                    <circle
                      r={isActive ? 9 : 7}
                      fill="none"
                      stroke="var(--color-primary)"
                      strokeWidth={1}
                      className="geo-pin-pulse"
                      style={{ opacity: isActive ? 0.5 : 0.35 }}
                    />
                    {/* Solid pin */}
                    <circle
                      r={isActive ? 6 : 5}
                      fill="var(--color-primary)"
                      stroke="var(--color-white)"
                      strokeWidth={1.5}
                      style={{
                        cursor: "pointer",
                        transition: "r 0.2s ease",
                        filter: isActive
                          ? "drop-shadow(0 0 4px rgba(174, 39, 45,0.6))"
                          : "none",
                      }}
                    />
                  </Marker>
                );
              })}
            </ComposableMap>
          </div>

        </div>
      </div>
    </section>
  );
};

export default GeographicReach;
