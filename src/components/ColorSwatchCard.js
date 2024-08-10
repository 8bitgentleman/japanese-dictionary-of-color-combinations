import React, { useState } from "react";
import { Clipboard, Check } from "lucide-react";
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
  const [copied, setCopied] = useState(false);
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

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setCopiedValue(text);
    setTimeout(() => {
      setCopied(false);
      setCopiedValue("");
    }, 2000);
  };

  return (
    <div className="color-swatch-card">
      <div
        className="color-square"
        style={{ backgroundColor: `rgb(${rgb.join(",")})` }}
      />
      <h3>{colorName}</h3>
      <div className="color-values">
        <p>
          HEX: {hex}
          <button className="copy-button" onClick={() => handleCopy(hex)}>
            {copied && copiedValue === hex ? (
              <Check size={16} className="copy-icon" />
            ) : (
              <Clipboard size={16} className="copy-icon" />
            )}
          </button>
        </p>
        <p>
          CMYK: {cmyk.join(", ")}
          <button
            className="copy-button"
            onClick={() => handleCopy(cmyk.join(", "))}
          >
            {copied && copiedValue === cmyk.join(", ") ? (
              <Check size={16} className="copy-icon" />
            ) : (
              <Clipboard size={16} className="copy-icon" />
            )}
          </button>
        </p>
        <p>
          RGB: {rgb.join(", ")}
          <button
            className="copy-button"
            onClick={() => handleCopy(rgb.join(", "))}
          >
            {copied && copiedValue === rgb.join(", ") ? (
              <Check size={16} className="copy-icon" />
            ) : (
              <Clipboard size={16} className="copy-icon" />
            )}
          </button>
        </p>
      </div>
    </div>
  );
};

export default ColorSwatchCard;
