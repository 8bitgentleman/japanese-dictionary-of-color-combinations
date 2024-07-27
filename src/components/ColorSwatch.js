import React from 'react';

const cmykToRgb = (c, m, y, k) => {
    c /= 100; m /= 100; y /= 100; k /= 100;
    const r = 255 * (1 - c) * (1 - k);
    const g = 255 * (1 - m) * (1 - k);
    const b = 255 * (1 - y) * (1 - k);
    return [Math.round(r), Math.round(g), Math.round(b)];
  };

const ColorSwatch = React.memo(({ cmyk }) => {
    const [c, m, y, k] = cmyk;
    const [r, g, b] = cmykToRgb(c, m, y, k);
    return (
      <div 
        className="color-swatch" 
        style={{ backgroundColor: `rgb(${r},${g},${b})` }}
      />
    );
  });

export default ColorSwatch;