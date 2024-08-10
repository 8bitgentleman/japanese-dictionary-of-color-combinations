// components/PaletteGrid.js
import React, { useState, useRef } from "react";
import "./PaletteGrid.css";

const PaletteGrid = ({ paletteData, colorData }) => {
  const [hoveredColor, setHoveredColor] = useState(null);
  const [hoverTimer, setHoverTimer] = useState(null);
  const [popoverPosition, setPopoverPosition] = useState("top");
  const containerRef = useRef(null);

  const getColorStyle = (colorName) => {
    const color = colorData[colorName];
    if (!color) {
      console.warn(`Color data missing for: ${colorName}`);
      return { backgroundColor: "#CCCCCC" }; // Fallback color
    }

    if (color.CMYK) {
      // If CMYK is available, convert it to RGB
      const [c, m, y, k] = color.CMYK.map(Number);
      const r = 255 * (1 - c / 100) * (1 - k / 100);
      const g = 255 * (1 - m / 100) * (1 - k / 100);
      const b = 255 * (1 - y / 100) * (1 - k / 100);
      return {
        backgroundColor: `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`,
      };
    }

    if (color.RGB) {
      return { backgroundColor: `rgb(${color.RGB.join(",")})` };
    }

    if (color.hex) {
      return { backgroundColor: color.hex };
    }

    console.warn(`No valid color format found for: ${colorName}`);
    return { backgroundColor: "#CCCCCC" }; // Fallback color
  };

  const handleMouseEnter = (colorName, event) => {
    const swatchRect = event.target.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    const shouldShowBelow = swatchRect.top - containerRect.top < 40; // Adjust based on popover height

    setPopoverPosition(shouldShowBelow ? "bottom" : "top");

    setHoverTimer(
      setTimeout(() => {
        setHoveredColor(colorName);
      }, 400),
    );
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimer);
    setHoveredColor(null);
  };

  return (
    <div className="palette-grid" ref={containerRef}>
      {Object.entries(paletteData).map(([paletteName, palette]) => (
        <div key={paletteName} className="palette-card">
          <div className="palette-swatches">
            {palette.colors.map((colorName) => (
              <div
                key={colorName}
                className="palette-swatch"
                style={getColorStyle(colorName)}
                onMouseEnter={(e) => handleMouseEnter(colorName, e)}
                onMouseLeave={handleMouseLeave}
              >
                {hoveredColor === colorName && (
                  <div
                    className={`popover ${popoverPosition === "bottom" ? "popover-bottom" : ""}`}
                  >
                    {colorName}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="palette-name">{paletteName}</div>
        </div>
      ))}
    </div>
  );
};

export default PaletteGrid;
