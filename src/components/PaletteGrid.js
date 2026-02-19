import React, { useState } from "react";
import { Star } from "lucide-react";
import "./PaletteGrid.css";

const PaletteGrid = ({ paletteData, colorData, onPaletteClick, favorites, toggleFavorite, isLoaded, selectedPalette }) => {
  const [hoveredPalette, setHoveredPalette] = useState(null);

  const getColorStyle = (colorName) => {
    const color = colorData[colorName];
    if (!color) {
      return { backgroundColor: "#CCCCCC" };
    }

    if (color.CMYK) {
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

    return { backgroundColor: "#CCCCCC" };
  };

  const handlePaletteClick = (paletteName) => {
    if (onPaletteClick) {
      onPaletteClick(paletteName);
    }
  };

  const renderPaletteCard = (paletteName, palette, isFavorite) => {
    const topColors = palette.colors.slice(0, -1);
    const bottomColor = palette.colors[palette.colors.length - 1];

    return (
    <div
      key={paletteName}
      className={`palette-card ${isFavorite ? "favorite" : ""} ${selectedPalette === paletteName ? "active" : ""}`}
      onClick={() => handlePaletteClick(paletteName)}
      onMouseEnter={() => setHoveredPalette(paletteName)}
      onMouseLeave={() => setHoveredPalette(null)}
    >
      <div className="palette-swatches">
        {topColors.length > 0 && (
          <div className="palette-swatches-top">
            {topColors.map((colorName) => (
              <div
                key={colorName}
                className="palette-swatch"
                style={getColorStyle(colorName)}
              >
                <div className="color-name">{colorName}</div>
              </div>
            ))}
          </div>
        )}
        <div
          className="palette-swatch palette-swatch-bottom"
          style={getColorStyle(bottomColor)}
        >
          <div className="color-name">{bottomColor}</div>
        </div>
      </div>
      {(isFavorite || hoveredPalette === paletteName) && (
        <button
          className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleFavorite(paletteName); }}
        >
          <Star size={20} fill={isFavorite ? "#A6882A" : "none"} color={isFavorite ? "#A6882A" : "#5C4E42"} />
        </button>
      )}
    </div>
    );
  };

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="palette-grid-container">
      {favorites.length > 0 && (
        <div className="favorites-section">
          <div className="section-divider">
            <span className="section-divider-text">Favorites</span>
            <span className="section-divider-count">· {favorites.length}</span>
          </div>
          <div className="palette-grid">
            {favorites.map((paletteName) =>
              paletteData[paletteName] ? renderPaletteCard(paletteName, paletteData[paletteName], true) : null
            )}
          </div>
        </div>
      )}
      <div className="all-palettes-section">
        <div className="section-divider">
          <span className="section-divider-text">All Palettes</span>
          <span className="section-divider-count">· {Object.keys(paletteData).length}</span>
        </div>
        <div className="palette-grid">
          {Object.entries(paletteData).map(([paletteName, palette]) =>
            renderPaletteCard(paletteName, palette, favorites.includes(paletteName))
          )}
        </div>
      </div>
    </div>
  );
};

export default PaletteGrid;
