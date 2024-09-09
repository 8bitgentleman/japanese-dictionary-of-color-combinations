import React, { useState, useMemo } from 'react';
import { Clipboard, Check } from 'lucide-react';
import './ColorGrid.css';

const getColorStyle = (cmyk) => {
  const [c, m, y, k] = cmyk.map(Number);
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  return { backgroundColor: `rgb(${r}, ${g}, ${b})` };
};

const calculateHue = (cmyk) => {
  const [c, m, y] = cmyk.map(Number);
  return Math.atan2(Math.sqrt(3) * (y - m), 2 * c - m - y);
};

const calculateBrightness = (cmyk) => {
  const [c, m, y, k] = cmyk.map(Number);
  return 1 - Math.max(c, m, y, k) / 100;
};

const ColorGrid = ({ colorData }) => {
  const [hoveredColor, setHoveredColor] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [sortOption, setSortOption] = useState('section');
  const [filterText, setFilterText] = useState('');
  const [copiedValue, setCopiedValue] = useState('');

  const sortedAndFilteredColors = useMemo(() => {
    return Object.entries(colorData)
      .filter(([colorName]) => 
        colorName.toLowerCase().includes(filterText.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortOption) {
          case 'section':
            const sectionA = a[1].references[0] || '';
            const sectionB = b[1].references[0] || '';
            return sectionA.localeCompare(sectionB) || a[0].localeCompare(b[0]);
          case 'name':
            return a[0].localeCompare(b[0]);
          case 'hue':
            return calculateHue(a[1].CMYK) - calculateHue(b[1].CMYK);
          case 'brightness':
            return calculateBrightness(b[1].CMYK) - calculateBrightness(a[1].CMYK);
          default:
            return 0;
        }
      });
  }, [colorData, sortOption, filterText]);

  const handleColorClick = (colorName) => {
    setSelectedColor(selectedColor === colorName ? null : colorName);
  };

  const handleCopy = (text, event) => {
    event.stopPropagation(); // Stop the event from propagating to parent elements
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => {
      setCopiedValue('');
    }, 2000);
  };

  const CopyButton = ({ text }) => (
    <button className="copy-button" onClick={(e) => handleCopy(text, e)}>
      {copiedValue === text ? (
        <Check size={16} className="copy-icon" />
      ) : (
        <Clipboard size={16} className="copy-icon" />
      )}
    </button>
  );

  return (
    <div className="color-grid-container">
      <div className="color-grid-controls">
        <select 
          value={sortOption} 
          onChange={(e) => setSortOption(e.target.value)}
          className="sort-select"
        >
          <option value="section">Sort by Section</option>
          <option value="name">Sort by Name</option>
          <option value="hue">Sort by Hue</option>
          <option value="brightness">Sort by Brightness</option>
        </select>
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter colors..."
          className="filter-input"
        />
      </div>
      <div className="color-grid">
        {sortedAndFilteredColors.map(([colorName, colorInfo]) => (
          <div
            key={colorName}
            className={`color-card ${selectedColor === colorName ? 'expanded' : ''}`}
            style={getColorStyle(colorInfo.CMYK)}
            onMouseEnter={() => setHoveredColor(colorName)}
            onMouseLeave={() => setHoveredColor(null)}
            onClick={() => handleColorClick(colorName)}
          >
           
            {selectedColor === colorName && (
              <div className="color-details" onClick={(e) => e.stopPropagation()}>
                <h3>{colorName}</h3>
                <p>
                  CMYK: {colorInfo.CMYK.join(', ')}
                  <CopyButton text={colorInfo.CMYK.join(', ')} />
                </p>
                <p>
                  RGB: {Object.values(getColorStyle(colorInfo.CMYK).backgroundColor.match(/\d+/g)).join(', ')}
                  <CopyButton text={Object.values(getColorStyle(colorInfo.CMYK).backgroundColor.match(/\d+/g)).join(', ')} />
                </p>
                {colorInfo.references && (
                  <p>
                    Used in sections: {colorInfo.references.join(', ')}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ColorGrid;