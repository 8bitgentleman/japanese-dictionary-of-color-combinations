import React, { useState, useEffect } from 'react';
import ColorSwatch from './ColorSwatch';
import CopyButton from './CopyButton';

const PaletteLookup = ({ paletteData, colorData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    if (searchTerm === '') {
      setSearchResults([]);
      return;
    }

    const results = Object.entries(paletteData)
      .filter(([id, palette]) => 
        id.toString().includes(searchTerm) || 
        palette.section.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .map(([id, palette]) => ({
        id,
        ...palette,
        colors: palette.colors.map(colorName => {
          const colorInfo = Object.entries(colorData).find(([key]) => key.toLowerCase() === colorName.toLowerCase());
          return colorInfo ? { name: colorInfo[0], ...colorInfo[1] } : { name: colorName, error: 'Color not found' };
        })
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
        <div key={paletteIndex} className="result-item">
          <h3>Palette {paletteInfo.id}: {paletteInfo.section}</h3>
          {paletteInfo.colors.map((colorInfo, colorIndex) => (
            <div key={colorIndex} className="color-info">
              <h4>{colorInfo.name}</h4>
              {colorInfo.error ? (
                <p className="error">{colorInfo.error}</p>
              ) : (
                <>
                  <div className="flex-container">
                    <p><span style={{fontWeight: "bold"}}>CMYK: </span><i>{colorInfo.CMYK.join(', ')}</i></p>
                    <CopyButton text={colorInfo.CMYK.join(', ')} />
                  </div>
                  <ColorSwatch cmyk={colorInfo.CMYK} />
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PaletteLookup;