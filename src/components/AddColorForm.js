import React, { useState } from "react";

const AddColorForm = ({ onAddColor }) => {
  const [colorName, setColorName] = useState("");
  const [cmyk, setCmyk] = useState({ c: 0, m: 0, y: 0, k: 0 });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newColor = {
      name: colorName,
      CMYK: [cmyk.c, cmyk.m, cmyk.y, cmyk.k],
      references: [], // This will be computed when adding to palettes
    };
    onAddColor(newColor);
    // Reset form
    setColorName("");
    setCmyk({ c: 0, m: 0, y: 0, k: 0 });
  };

  return (
    <div className="card">
      <h2>Add New Color</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={colorName}
          onChange={(e) => setColorName(e.target.value)}
          placeholder="Color Name"
          required
        />
        {["c", "m", "y", "k"].map((channel) => (
          <input
            key={channel}
            type="number"
            value={cmyk[channel]}
            onChange={(e) =>
              setCmyk({ ...cmyk, [channel]: Number(e.target.value) })
            }
            placeholder={channel.toUpperCase()}
            min="0"
            max="100"
            required
          />
        ))}
        <button type="submit">Add Color</button>
      </form>
    </div>
  );
};

export default AddColorForm;
