import React, { useState, useEffect } from 'react';
import ColorSwatchCard from './ColorSwatchCard';

const ColorLookup = ({ colorData, paletteData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchTerm === '') {
      setSearchResults([]);
      return;
    }
    
    const results = Object.entries(colorData)
      .filter(([colorName]) => colorName.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(([colorName, info]) => ({
        name: colorName,
        ...info,
        palettes: info.references.map(ref => {
          const palette = paletteData[ref];
          return palette ? `${ref} (${palette.section})` : ref;
        })
      }));
    setSearchResults(results);
  }, [searchTerm, colorData, paletteData]);

  return (
    <div className="card">
      <h2>Color Lookup</h2>
      <div className="search-container">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter color name"
        />
      </div>
      {searchResults.length === 0 && searchTerm && (
        <div className="alert">
          <h3>No Results</h3>
          <p>No colors found matching your search.</p>
        </div>
      )}
      <div className="color-grid">
        {searchResults.map((colorInfo, index) => (
          <div key={index} className="color-result">
            <ColorSwatchCard
              colorName={colorInfo.name}
              cmyk={colorInfo.CMYK}
            />
            <p className="palettes">Palettes: {colorInfo.palettes.join(', ')}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorLookup;