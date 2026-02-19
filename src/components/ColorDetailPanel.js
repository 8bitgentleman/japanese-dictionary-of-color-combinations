import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Star, Clipboard, Check, X } from 'lucide-react';
import './ColorDetailPanel.css';

const getColorStyle = (cmyk) => {
  const [c, m, y, k] = cmyk.map(Number);
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  return { backgroundColor: `rgb(${r}, ${g}, ${b})` };
};

const getRgbString = (cmyk) => {
  const [c, m, y, k] = cmyk.map(Number);
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  return `${r}, ${g}, ${b}`;
};

const ColorDetailPanel = ({
  colorName,
  colorData,
  paletteData,
  onClose,
  favoriteColors,
  toggleColorFavorite,
  favoritePalettes,
  togglePaletteFavorite,
}) => {
  const [copiedValue, setCopiedValue] = useState('');

  const colorInfo = colorData[colorName];
  const isColorFavorite = favoriteColors.includes(colorName);

  const colorPalettes = useMemo(() => {
    return (colorInfo?.references || [])
      .filter(ref => paletteData[ref])
      .map(ref => [ref, paletteData[ref]]);
  }, [colorInfo, paletteData]);

  const handleCopy = useCallback((text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(''), 2000);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!colorInfo) return null;

  const cmykString = colorInfo.CMYK.join(', ');
  const rgbString = getRgbString(colorInfo.CMYK);

  const CopyButton = ({ text }) => (
    <button className="cdp-copy-button" onClick={(e) => handleCopy(text, e)}>
      {copiedValue === text ? <Check size={14} /> : <Clipboard size={14} />}
    </button>
  );

  const getPaletteSwatchStyle = (name) => {
    const color = colorData[name];
    if (!color || !color.CMYK) return { backgroundColor: '#ccc' };
    return getColorStyle(color.CMYK);
  };

  return (
    <>
      <div className="cdp-backdrop" onClick={onClose} />
      <div className="cdp-panel">
        <div className="cdp-header">
          <button className="cdp-close" onClick={onClose} aria-label="Close panel">
            <X size={18} />
          </button>
          <h2 className="cdp-title">{colorName}</h2>
          <button
            className={`cdp-star ${isColorFavorite ? 'is-favorite' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleColorFavorite(colorName); }}
            aria-label={isColorFavorite ? `Unfavorite ${colorName}` : `Favorite ${colorName}`}
          >
            <Star
              size={20}
              fill={isColorFavorite ? '#f5a623' : 'none'}
              color={isColorFavorite ? '#f5a623' : '#666'}
            />
          </button>
        </div>

        <div className="cdp-swatch" style={getColorStyle(colorInfo.CMYK)} />

        <div className="cdp-values">
          <div className="cdp-value-row">
            <span className="cdp-value-label">CMYK</span>
            <span className="cdp-value-text">{cmykString}</span>
            <CopyButton text={cmykString} />
          </div>
          <div className="cdp-value-row">
            <span className="cdp-value-label">RGB</span>
            <span className="cdp-value-text">{rgbString}</span>
            <CopyButton text={rgbString} />
          </div>
        </div>

        {colorPalettes.length > 0 && (
          <div className="cdp-palettes">
            <h3 className="cdp-palettes-heading">
              In {colorPalettes.length} palette{colorPalettes.length !== 1 ? 's' : ''}
            </h3>
            <div className="cdp-palette-list">
              {colorPalettes.map(([paletteName, palette]) => {
                const isFav = favoritePalettes.includes(paletteName);
                return (
                  <div key={paletteName} className={`cdp-palette-card ${isFav ? 'favorite' : ''}`}>
                    <div className="cdp-palette-swatches">
                      {palette.colors.map((cName) => (
                        <div
                          key={cName}
                          className="cdp-palette-swatch"
                          style={getPaletteSwatchStyle(cName)}
                          title={cName}
                        />
                      ))}
                    </div>
                    <div className="cdp-palette-footer">
                      <span className="cdp-palette-name">{paletteName}</span>
                      <button
                        className={`cdp-palette-star ${isFav ? 'is-favorite' : ''}`}
                        onClick={(e) => { e.stopPropagation(); togglePaletteFavorite(paletteName); }}
                        aria-label={isFav ? `Unfavorite ${paletteName}` : `Favorite ${paletteName}`}
                      >
                        <Star
                          size={16}
                          fill={isFav ? '#f5a623' : 'none'}
                          color={isFav ? '#f5a623' : '#999'}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {colorPalettes.length === 0 && (
          <div className="cdp-palettes">
            <p className="cdp-no-palettes">Not used in any palettes</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ColorDetailPanel;
