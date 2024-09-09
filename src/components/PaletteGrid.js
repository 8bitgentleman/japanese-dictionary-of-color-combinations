import React, { useState, useEffect, useCallback } from "react";
import { Star } from "lucide-react";
import "./PaletteGrid.css";

const PaletteGrid = ({ paletteData, colorData, onPaletteClick }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredPalette, setHoveredPalette] = useState(null);

  const loadFavorites = useCallback(() => {
    const storedFavorites = localStorage.getItem("favoritePalettes");
    if (storedFavorites) {
      try {
        const parsedFavorites = JSON.parse(storedFavorites);
        setFavorites(parsedFavorites);
      } catch (error) {
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    loadFavorites();
    window.addEventListener('storage', loadFavorites);
    return () => {
      window.removeEventListener('storage', loadFavorites);
    };
  }, [loadFavorites]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("favoritePalettes", JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const getColorStyle = (colorName) => {
    const color = colorData[colorName];
    if (!color) {
      return { backgroundColor: "#CCCCCC" }; // Fallback color
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

    return { backgroundColor: "#CCCCCC" }; // Fallback color
  };

  const handlePaletteClick = (paletteName) => {
    if (onPaletteClick) {
      onPaletteClick(paletteName);
    }
  };

  const toggleFavorite = (paletteName, event) => {
    event.stopPropagation();
    setFavorites((prevFavorites) => {
      const newFavorites = prevFavorites.includes(paletteName)
        ? prevFavorites.filter((name) => name !== paletteName)
        : [...prevFavorites, paletteName];
      
      return newFavorites;
    });
  };

  const renderPaletteCard = (paletteName, palette, isFavorite) => (
    <div
      key={paletteName}
      className={`palette-card ${isFavorite ? "favorite" : ""}`}
      onClick={() => handlePaletteClick(paletteName)}
      onMouseEnter={() => setHoveredPalette(paletteName)}
      onMouseLeave={() => setHoveredPalette(null)}
    >
      <div className="palette-swatches">
        {palette.colors.map((colorName) => (
          <div
            key={colorName}
            className="palette-swatch"
            style={getColorStyle(colorName)}
          >
            <div className="color-name">{colorName}</div>
          </div>
        ))}
      </div>
      <div className="palette-name">{paletteName}</div>
      {(isFavorite || hoveredPalette === paletteName) && (
        <button
          className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
          onClick={(e) => toggleFavorite(paletteName, e)}
        >
          <Star size={20} fill={isFavorite ? "#333333" : "none"} color="#333333" />
        </button>
      )}
    </div>
  );


  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="palette-grid-container">
      {favorites.length > 0 && (
        <div className="favorites-section">
          <h2>Favorites</h2>
          <div className="palette-grid">
            {favorites.map((paletteName) =>
              paletteData[paletteName] ? renderPaletteCard(paletteName, paletteData[paletteName], true) : null
            )}
          </div>
        </div>
      )}
      <div className="all-palettes-section">
        <h2>All Palettes</h2>
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