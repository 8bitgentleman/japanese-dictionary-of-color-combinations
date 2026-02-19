import React, { useState, useCallback, useEffect } from 'react';
import { Star, X, Clipboard, Check, ChevronDown } from 'lucide-react';
import './PaletteDetailPanel.css';

const cmykToRgb = (cmyk) => {
  const [c, m, y, k] = cmyk.map(Number);
  const r = Math.round(255 * (1 - c / 100) * (1 - k / 100));
  const g = Math.round(255 * (1 - m / 100) * (1 - k / 100));
  const b = Math.round(255 * (1 - y / 100) * (1 - k / 100));
  return [r, g, b];
};

const rgbToHex = ([r, g, b]) =>
  '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();

const getColorStyle = (cmyk) => {
  const [r, g, b] = cmykToRgb(cmyk);
  return { backgroundColor: `rgb(${r}, ${g}, ${b})` };
};

const PaletteDetailPanel = ({
  paletteName,
  paletteData,
  colorData,
  onClose,
  favoritePalettes,
  togglePaletteFavorite,
}) => {
  const [expandedColor, setExpandedColor] = useState(null);
  const [copiedValue, setCopiedValue] = useState('');

  const palette = paletteData[paletteName];
  const isFavorite = favoritePalettes.includes(paletteName);

  // Reset expanded row when palette changes
  useEffect(() => {
    setExpandedColor(null);
    setCopiedValue('');
  }, [paletteName]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (expandedColor) {
          setExpandedColor(null);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, expandedColor]);

  const handleCopy = useCallback((text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(''), 2000);
  }, []);

  const handleRowClick = (colorName) => {
    setExpandedColor((prev) => (prev === colorName ? null : colorName));
  };

  if (!palette) return null;

  return (
    <>
      <div className="pdp-backdrop" onClick={onClose} />
      <div className="pdp-panel">
        <div className="pdp-header">
          <button className="pdp-close" onClick={onClose} aria-label="Close panel">
            <X size={18} />
          </button>
          <h2 className="pdp-title">{paletteName}</h2>
          <button
            className={`pdp-star ${isFavorite ? 'is-favorite' : ''}`}
            onClick={(e) => { e.stopPropagation(); togglePaletteFavorite(paletteName); }}
            aria-label={isFavorite ? `Unfavorite ${paletteName}` : `Favorite ${paletteName}`}
          >
            <Star
              size={20}
              fill={isFavorite ? '#A6882A' : 'none'}
              color={isFavorite ? '#A6882A' : '#666'}
            />
          </button>
        </div>

        <div className="pdp-section-label">{palette.section}</div>

        <div className="pdp-swatches-strip">
          {palette.colors.map((colorName) => {
            const color = colorData[colorName];
            if (!color || !color.CMYK) return null;
            return (
              <div
                key={colorName}
                className="pdp-swatch-strip-item"
                style={getColorStyle(color.CMYK)}
                title={colorName}
              />
            );
          })}
        </div>

        <div className="pdp-color-list">
          {palette.colors.map((colorName) => {
            const color = colorData[colorName];
            if (!color || !color.CMYK) return null;

            const rgb = cmykToRgb(color.CMYK);
            const hex = rgbToHex(rgb);
            const cmykStr = color.CMYK.join(', ');
            const rgbStr = rgb.join(', ');
            const isExpanded = expandedColor === colorName;

            return (
              <div
                key={colorName}
                className={`pdp-color-row ${isExpanded ? 'expanded' : ''}`}
                onClick={() => handleRowClick(colorName)}
              >
                <div className="pdp-color-row-header">
                  <div
                    className="pdp-color-swatch"
                    style={getColorStyle(color.CMYK)}
                  />
                  <div className="pdp-color-info">
                    <span className="pdp-color-name">{colorName}</span>
                    <span className="pdp-color-hex">{hex}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`pdp-chevron ${isExpanded ? 'open' : ''}`}
                  />
                </div>

                {isExpanded && (
                  <div className="pdp-color-values" onClick={(e) => e.stopPropagation()}>
                    {[
                      { label: 'HEX',  value: hex },
                      { label: 'RGB',  value: rgbStr },
                      { label: 'CMYK', value: cmykStr },
                    ].map(({ label, value }) => (
                      <button
                        key={label}
                        className={`pdp-value-row ${copiedValue === value ? 'copied' : ''}`}
                        onClick={(e) => handleCopy(value, e)}
                        title={`Copy ${label}`}
                      >
                        <span className="pdp-value-label">{label}</span>
                        <span className="pdp-value-text">{value}</span>
                        {copiedValue === value
                          ? <Check size={13} className="pdp-copy-icon" />
                          : <Clipboard size={13} className="pdp-copy-icon" />
                        }
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default PaletteDetailPanel;
