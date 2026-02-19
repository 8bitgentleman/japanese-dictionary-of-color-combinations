import React, { useState, useMemo } from 'react';
import { Star } from 'lucide-react';
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

const ColorGrid = ({
  colorData,
  onColorClick,
  selectedColor,
  favoriteColors = [],
  toggleColorFavorite = () => {},
}) => {
  const [sortOption, setSortOption] = useState('section');
  const [filterText, setFilterText] = useState('');

  const sortedAndFilteredColors = useMemo(() => {
    return Object.entries(colorData)
      .filter(([colorName]) =>
        colorName.toLowerCase().includes(filterText.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortOption) {
          case 'section': {
            const sectionA = a[1].references[0] || '';
            const sectionB = b[1].references[0] || '';
            return sectionA.localeCompare(sectionB) || a[0].localeCompare(b[0]);
          }
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

  const favoriteColorEntries = useMemo(() => {
    return favoriteColors
      .filter((name) => colorData[name])
      .map((name) => [name, colorData[name]]);
  }, [favoriteColors, colorData]);

  const handleColorClick = (colorName) => {
    if (onColorClick) {
      onColorClick(selectedColor === colorName ? null : colorName);
    }
  };

  const renderColorCard = (colorName, colorInfo) => {
    const isFavorite = favoriteColors.includes(colorName);
    const isSelected = selectedColor === colorName;
    return (
      <div
        key={colorName}
        className={`color-card ${isSelected ? 'active' : ''}`}
        style={getColorStyle(colorInfo.CMYK)}
        onClick={() => handleColorClick(colorName)}
        title={colorName}
      >
        <div className="color-card-hover">
          <span className="color-card-name">{colorName}</span>
        </div>
        <button
          className={`color-favorite-btn ${isFavorite ? 'is-favorite' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleColorFavorite(colorName); }}
          aria-label={isFavorite ? `Unfavorite ${colorName}` : `Favorite ${colorName}`}
        >
          <Star
            size={13}
            fill={isFavorite ? '#f5a623' : 'none'}
            color={isFavorite ? '#f5a623' : '#fff'}
          />
        </button>
      </div>
    );
  };

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

      {favoriteColorEntries.length > 0 && (
        <div className="favorite-colors-section">
          <h2>Favorite Colors</h2>
          <div className="color-grid">
            {favoriteColorEntries.map(([name, info]) => renderColorCard(name, info))}
          </div>
        </div>
      )}

      <div className={favoriteColorEntries.length > 0 ? 'all-colors-section' : ''}>
        {favoriteColorEntries.length > 0 && <h2>All Colors</h2>}
        <div className="color-grid">
          {sortedAndFilteredColors.map(([name, info]) => renderColorCard(name, info))}
        </div>
      </div>
    </div>
  );
};

export default ColorGrid;
