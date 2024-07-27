import React, { useState, useEffect } from 'react';
import ColorSwatch from './ColorSwatch';
import CopyButton from './CopyButton';

// Conversion functions
const cmykToRgb = (c, m, y, k) => {
  let r = 255 * (1 - c / 100) * (1 - k / 100);
  let g = 255 * (1 - m / 100) * (1 - k / 100);
  let b = 255 * (1 - y / 100) * (1 - k / 100);
  return [Math.round(r), Math.round(g), Math.round(b)];
};

const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
};

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
      .map(([colorName, info]) => {
        const rgb = cmykToRgb(...info.CMYK);
        const hex = rgbToHex(...rgb);
        return {
          name: colorName,
          ...info,
          RGB: rgb,
          HEX: hex,
          palettes: info.references.map(ref => {
            const palette = paletteData[ref];
            return palette ? `${ref} (${palette.section})` : ref;
          })
        };
      });
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
      {searchResults.map((colorInfo, index) => (
        <div key={index} className="result-item">
          <h3>{colorInfo.name}</h3>
          <div className="flex-container">
            <p><span style={{fontWeight: "bold"}}>CMYK: </span><i>{colorInfo.CMYK.join(', ')}</i></p>
            <CopyButton text={colorInfo.CMYK.join(', ')} />
          </div>
          <div className="flex-container">
            <p><span style={{fontWeight: "bold"}}>RGB: </span><i>{colorInfo.RGB.join(', ')}</i></p>
            <CopyButton text={colorInfo.RGB.join(', ')} />
          </div>
          <div className="flex-container">
            <p><span style={{fontWeight: "bold"}}>HEX: </span><i>{colorInfo.HEX}</i></p>
            <CopyButton text={colorInfo.HEX} />
          </div>
          <ColorSwatch cmyk={colorInfo.CMYK} />
          <p>Palettes: {colorInfo.palettes.join(', ')}</p>
        </div>
      ))}
    </div>
  );
};

export default ColorLookup;