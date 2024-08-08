import React, { useState, useMemo } from 'react';

const AddPaletteForm = ({ onAddPalette, colors }) => {
  const [section, setSection] = useState('');
  const [name, setName] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [paletteColors, setPaletteColors] = useState([]);
  const [sectionInput, setSectionInput] = useState('');
  
  // Extract existing sections from colors object
  const existingSections = useMemo(() => {
    const sections = new Set();
    Object.values(colors).forEach(color => {
      if (color.references) {
        color.references.forEach(ref => {
          if (typeof ref === 'string' && ref.trim() !== '') {
            sections.add(ref.trim());
          }
        });
      }
    });
    return Array.from(sections);
  }, [colors]);

  const handleAddColorToPalette = () => {
    if (colorInput.trim() !== '' && !paletteColors.includes(colorInput.trim())) {
      setPaletteColors([...paletteColors, colorInput.trim()]);
      setColorInput('');
    }
  };
  const getColorBackground = (colorName) => {
    // Convert color name to lowercase for case-insensitive search
    const searchName = colorName.toLowerCase();
    
    // Find the color in the colorData object
    const colorEntry = Object.entries(colors).find(([name]) => 
      name.toLowerCase() === searchName
    );

    if (!colorEntry) {
      return 'transparent';
    }

    const [, colorInfo] = colorEntry;
    const [c, m, y, k] = colorInfo.CMYK;

    // Convert CMYK to RGB
    const cmykToRgb = (c, m, y, k) => {
      c /= 100; m /= 100; y /= 100; k /= 100;
      const r = 255 * (1 - c) * (1 - k);
      const g = 255 * (1 - m) * (1 - k);
      const b = 255 * (1 - y) * (1 - k);
      return [Math.round(r), Math.round(g), Math.round(b)];
    };

    const [r, g, b] = cmykToRgb(c, m, y, k);

    return `rgb(${r}, ${g}, ${b})`;
  };
  const handleRemoveColor = (colorToRemove) => {
    setPaletteColors(paletteColors.filter(color => color !== colorToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (section.trim() === '' || name.trim() === '' || paletteColors.length === 0) {
      return;
    }
    onAddPalette({ section: section.trim(), name: name.trim(), colors: paletteColors });
    setSection('');
    setName('');
    setPaletteColors([]);
  };

  const handleColorInputChange = (e) => {
    setColorInput(e.target.value);
  };

  const handleSectionInputChange = (e) => {
    setSectionInput(e.target.value);
    setSection(e.target.value);
  };

  const filteredColors = Object.keys(colors).filter(colorName =>
    colorName.toLowerCase().includes(colorInput.toLowerCase())
  );

  const filteredSections = existingSections.filter(sectionName =>
    sectionName.toLowerCase().includes(sectionInput.toLowerCase())
  );

  const ColorChip = ({ color }) => (
    <span className="color-chip">
      <span
        className="color-square"
        style={{ backgroundColor: getColorBackground(color) }}
      ></span>
      {color}
      <button
        type="button"
        className="remove-color"
        onClick={() => handleRemoveColor(color)}
      >
        &times;
      </button>
    </span>
  );

  return (
    <div className="card">
      <h2>Add Palette</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="section">Section</label>
          <input
            id="section"
            value={sectionInput}
            onChange={handleSectionInputChange}
            list="section-suggestions"
          />
          <datalist id="section-suggestions">
            {filteredSections.map((sectionName, index) => (
              <option key={index} value={sectionName} />
            ))}
          </datalist>
        </div>
        <div className="form-group">
          <label htmlFor="name">Palette Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="color">Add Color</label>
          <input
            id="color"
            value={colorInput}
            onChange={handleColorInputChange}
            list="color-suggestions"
          />
          <datalist id="color-suggestions">
            {filteredColors.map((colorName, index) => (
              <option key={index} value={colorName} />
            ))}
          </datalist>
          <button type="button" onClick={handleAddColorToPalette}>
            Add Color
          </button>
        </div>
        <div className="palette-colors">
          {paletteColors.map((color, index) => (
            <ColorChip key={index} color={color} />
          ))}
        </div>
        <button type="submit">Add Palette</button>
      </form>
    </div>
  );
};

export default AddPaletteForm;