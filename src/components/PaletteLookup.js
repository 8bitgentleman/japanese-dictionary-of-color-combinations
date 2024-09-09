import React, { useState, useEffect } from "react";
import ColorSwatchCard from "./ColorSwatchCard";

const PaletteLookup = ({ paletteData, colorData, selectedPalette }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (selectedPalette) {
      setSearchTerm(selectedPalette);
    }
  }, [selectedPalette]);

  useEffect(() => {
    if (searchTerm === "") {
      setSearchResults([]);
      return;
    }

    const results = Object.entries(paletteData)
      .filter(
        ([id, palette]) =>
          id.toString().includes(searchTerm) ||
          palette.section.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .map(([id, palette]) => ({
        id,
        ...palette,
        colors: palette.colors.map((colorName) => {
          const colorInfo = Object.entries(colorData).find(
            ([key]) => key.toLowerCase() === colorName.toLowerCase(),
          );
          return colorInfo
            ? { name: colorInfo[0], ...colorInfo[1] }
            : { name: colorName, error: "Color not found" };
        }),
      }));
    setSearchResults(results);
  }, [searchTerm, paletteData, colorData]);

  return (
    <div className="card">
      <h2>Palette Lookup</h2>
      <div className="search-container">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter palette ID or section"
        />
      </div>
      {searchResults.length === 0 && searchTerm && (
        <div className="alert">
          <h3>No Results</h3>
          <p>No palettes found matching your search.</p>
        </div>
      )}
      {searchResults.map((paletteInfo, paletteIndex) => (
        <div key={paletteIndex} className="palette-result">
          <h3>
            Palette {paletteInfo.id}: {paletteInfo.section}
          </h3>
          <div className="color-grid">
            {paletteInfo.colors.map((colorInfo, colorIndex) => (
              <ColorSwatchCard
                key={colorIndex}
                colorName={colorInfo.name}
                cmyk={colorInfo.CMYK}
                error={colorInfo.error}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PaletteLookup;