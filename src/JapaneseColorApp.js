import React, { useState, useEffect } from 'react';
import './JapaneseColorApp.css';
import AddColorForm from './components/AddColorForm';
import AddPaletteForm from './components/AddPaletteForm';
import DownloadButton from './components/DownloadButton';
import ColorLookup from './components/ColorLookup';
import PaletteLookup from './components/PaletteLookup';


const FileUpload = ({ onDataLoaded }) => {
  const [error, setError] = useState('');

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setError('');
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          if (!jsonData || typeof jsonData !== 'object' || !jsonData.colors || !jsonData.palettes) {
            throw new Error('Invalid JSON structure. The file must contain "colors" and "palettes" objects.');
          }
          onDataLoaded(jsonData);
        } catch (error) {
          console.error('Error parsing JSON:', error);
          setError(`Error parsing JSON file: ${error.message}`);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="file-upload">
      <label htmlFor="file-upload" className="file-upload-label">
        <div className="file-upload-area">
          <div>
            <span className="upload-icon">📤</span>
            <p>Upload JSON file</p>
          </div>
        </div>
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          className="hidden-input"
          accept=".json"
          onChange={handleFileUpload}
        />
      </label>
      {error && (
        <div className="alert error">
          <h3>Error</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

const JapaneseColorApp = () => {
    const [data, setData] = useState(null);
  
    useEffect(() => {
      fetch('/colors.json')
        .then(response => response.json())
        .then(jsonData => setData(jsonData))
        .catch(error => console.error('Error loading colors.json:', error));
    }, []);
  
    const handleDataLoaded = (loadedData) => {
      setData(loadedData);
    };
  
    const handleAddColor = (newColor) => {
      setData(prevData => {
        const updatedData = {
          ...prevData,
          colors: {
            ...prevData.colors,
            [newColor.name]: {
              CMYK: newColor.CMYK,
              references: []
            }
          }
        };
        updateColorsFile(updatedData);
        return updatedData;
      });
    };
    
    const handleAddPalette = (newPalette) => {
      setData(prevData => {
        const updatedColors = { ...prevData.colors };
        const updatedPalettes = { ...prevData.palettes };
    
        newPalette.colors.forEach(colorName => {
          if (updatedColors[colorName]) {
            updatedColors[colorName] = {
              ...updatedColors[colorName],
              references: [...updatedColors[colorName].references, newPalette.name]
            };
          }
        });
    
        updatedPalettes[newPalette.name] = {
          section: newPalette.section,
          name: newPalette.name,
          colors: newPalette.colors
        };
    
        const updatedData = {
          ...prevData,
          colors: updatedColors,
          palettes: updatedPalettes
        };
        updateColorsFile(updatedData);
        return updatedData;
      });
    };
  
    const updateColorsFile = async (data) => {
      try {
        const response = await fetch('http://localhost:5050/update-colors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
    
        const result = await response.json();
        console.log('Colors updated successfully:', result);
      } catch (error) {
        console.error('Error updating colors.json:', error);
      }
    };
  
    return (
      <div className="app-container">
        <h1>Japanese Color Combinations</h1>
        <FileUpload onDataLoaded={handleDataLoaded} />
        {data ? (
          <>
            <div>
              <h2>Colors</h2>
              <ColorLookup colorData={data.colors} paletteData={data.palettes} />
            </div>
            <div>
              <h2>Palettes</h2>
              <PaletteLookup paletteData={data.palettes} colorData={data.colors} />
            </div>
            <AddColorForm onAddColor={handleAddColor} />
            <AddPaletteForm onAddPalette={handleAddPalette} colors={data.colors} />
            <DownloadButton data={data} />
          </>
        ) : (
          <p className="placeholder-text">Please upload a JSON file to start</p>
        )}
      </div>
    );
  };
  
  export default JapaneseColorApp;