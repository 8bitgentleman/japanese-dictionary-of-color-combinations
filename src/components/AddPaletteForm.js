import React, { useState } from 'react';

const AddPaletteForm = ({ onAddPalette, colors }) => {
  const [section, setSection] = useState('');
  const [name, setName] = useState('');
  const [colorInput, setColorInput] = useState('');
  const [paletteColors, setPaletteColors] = useState([]);

  const handleAddColorToPalette = () => {
    if (colorInput.trim() !== '' && !paletteColors.includes(colorInput.trim())) {
      setPaletteColors([...paletteColors, colorInput.trim()]);
      setColorInput('');
    }
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

  const filteredColors = Object.keys(colors).filter(colorName =>
    colorName.toLowerCase().includes(colorInput.toLowerCase())
  );

  const ColorChip = ({ color }) => (
    <span className="color-chip">
      <span 
        className="color-square" 
        style={{ backgroundColor: colors[color] || 'transparent' }}
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
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />
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