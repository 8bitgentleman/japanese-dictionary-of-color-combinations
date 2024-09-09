import React, { useState } from "react";
import "./ColorSwatchCard.css";

const cmykToRgb = (c, m, y, k) => {
  c /= 100;
  m /= 100;
  y /= 100;
  k /= 100;
  const r = 255 * (1 - c) * (1 - k);
  const g = 255 * (1 - m) * (1 - k);
  const b = 255 * (1 - y) * (1 - k);
  return [Math.round(r), Math.round(g), Math.round(b)];
};

const rgbToHex = (r, g, b) => {
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
};

const ColorSwatchCard = ({ colorName, cmyk, error }) => {
  const [copiedValue, setCopiedValue] = useState("");

  if (error) {
    return (
      <div className="color-swatch-card error">
        <h3>{colorName}</h3>
        <p>{error}</p>
      </div>
    );
  }

  const rgb = cmykToRgb(...cmyk);
  const hex = rgbToHex(...rgb);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(label);
    setTimeout(() => {
      setCopiedValue("");
    }, 2000);
  };

  const ColorValue = ({ label, value }) => (
    <button 
      className={`color-value ${copiedValue === label ? 'copied' : ''}`}
      onClick={() => handleCopy(value, label)}
      title={`Click to copy ${label}`}
    >
      <span className="color-value-label">{label}:</span>
      <span className="color-value-text">{value}</span>
    </button>
  );

  return (
    <div className="color-swatch-card">
      <div
        className="color-square"
        style={{ backgroundColor: `rgb(${rgb.join(",")})` }}
      />
      <h3>{colorName}</h3>
      <div className="color-values">
        <ColorValue label="HEX" value={hex} />
        <ColorValue label="CMYK" value={cmyk.join(", ")} />
        <ColorValue label="RGB" value={rgb.join(", ")} />
      </div>
    </div>
  );
};

export default ColorSwatchCard;