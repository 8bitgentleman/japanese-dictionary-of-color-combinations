import React, { useState, useEffect } from "react";
import "./JapaneseColorApp.css";
import AddColorForm from "./components/AddColorForm";
import AddPaletteForm from "./components/AddPaletteForm";
import DownloadButton from "./components/DownloadButton";
import ColorLookup from "./components/ColorLookup";
import PaletteLookup from "./components/PaletteLookup";
import PaletteGrid from "./components/PaletteGrid";
import ImageColorExtractor from "./components/ImageColorExtractor";
import ColorGrid from "./components/ColorGrid";

const JapaneseColorApp = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("main");
  const [selectedPalette, setSelectedPalette] = useState(null);
  const isBrowseOnly = process.env.REACT_APP_BROWSE_ONLY === "true";

  const apiUrl =
    process.env.NODE_ENV === "production"
      ? "/api/update-colors"
      : "http://localhost:5050/api/update-colors";

  useEffect(() => {
    const baseUrl =
      process.env.NODE_ENV === "production"
        ? "/japanese-dictionary-of-color-combinations"
        : "http://localhost:3000/japanese-dictionary-of-color-combinations";

    fetch(`${baseUrl}/colors.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return response.text(); // Temporarily use text to log the response
      })
      .then((textData) => {
        const jsonData = JSON.parse(textData);
        setData(jsonData);
      })
      .catch((error) => console.error("Error loading colors.json:", error));
  }, []);

  const handleDataLoaded = (loadedData) => {
    setData(loadedData);
  };

  const handleAddColor = (newColor) => {
    setData((prevData) => {
      const updatedData = {
        ...prevData,
        colors: {
          ...prevData.colors,
          [newColor.name]: {
            CMYK: newColor.CMYK,
            references: [],
          },
        },
      };
      updateColorsFile(updatedData);
      return updatedData;
    });
  };

  const handleAddPalette = (newPalette) => {
    setData((prevData) => {
      const updatedColors = { ...prevData.colors };
      const updatedPalettes = { ...prevData.palettes };

      newPalette.colors.forEach((colorName) => {
        if (updatedColors[colorName]) {
          updatedColors[colorName] = {
            ...updatedColors[colorName],
            references: [
              ...updatedColors[colorName].references,
              newPalette.name,
            ],
          };
        }
      });

      updatedPalettes[newPalette.name] = {
        section: newPalette.section,
        name: newPalette.name,
        colors: newPalette.colors,
      };

      const updatedData = {
        ...prevData,
        colors: updatedColors,
        palettes: updatedPalettes,
      };
      updateColorsFile(updatedData);
      return updatedData;
    });
  };

  const updateColorsFile = async (data) => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.text();
      console.log("Colors updated successfully:", result);
    } catch (error) {
      console.error("Error updating colors.json:", error);
    }
  };

  const handlePaletteClick = (paletteName) => {
    setSelectedPalette(paletteName);
    setActiveTab("main");
  };

  const handleSectionClick = (section) => {
    setSelectedPalette(section);
    setActiveTab("main");
  };

  const renderActiveTab = () => {
    if (!data) return null;

    switch (activeTab) {
      case "main":
        return (
          <div className="main-content">
            <ColorLookup colorData={data.colors} paletteData={data.palettes} />
            <PaletteLookup
              paletteData={data.palettes}
              colorData={data.colors}
              selectedPalette={selectedPalette}
            />
            {!isBrowseOnly && (
              <>
                <AddPaletteForm
                  onAddPalette={handleAddPalette}
                  colors={data.colors}
                />
                <AddColorForm onAddColor={handleAddColor} />
              </>
            )}
            <DownloadButton data={data} />
          </div>
        );
      case "grid":
        return (
          <PaletteGrid
            paletteData={data.palettes}
            colorData={data.colors}
            onPaletteClick={handlePaletteClick}
          />
        );
      case "extractor":
        return (
          <ImageColorExtractor
            colorData={data.colors}
            paletteData={data.palettes}
          />
        );
      case "colors":
        return <ColorGrid colorData={data.colors} onSectionClick={handleSectionClick} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <h1>Japanese Color Combinations</h1>
      <div className="tabs">
        <button
          onClick={() => setActiveTab("main")}
          className={activeTab === "main" ? "active" : ""}
        >
          Main
        </button>
        <button
          onClick={() => setActiveTab("grid")}
          className={activeTab === "grid" ? "active" : ""}
        >
          Palette Grid
        </button>
        <button
          onClick={() => setActiveTab("colors")}
          className={activeTab === "colors" ? "active" : ""}
        >
          Color Grid
        </button>
        <button
          onClick={() => setActiveTab("extractor")}
          className={activeTab === "extractor" ? "active" : ""}
        >
          Color Extractor
        </button>
      </div>
      {data ? (
        renderActiveTab()
      ) : (
        <p className="placeholder-text">Loading data...</p>
      )}
      <footer className="app-footer">
        <p>
          Enjoyed this app? <span className="emoji">🎨</span> Tweet me at{" "}
          <a href="https://x.com/todayIwasbetter" target="_blank" rel="noopener noreferrer">
            @todayIwasbetter
          </a>
        </p>
        <p>
          <span className="emoji">🚀</span> Find the source code on{" "}
          <a href="https://github.com/8bitgentleman/japanese-dictionary-of-color-combinations" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
        <p>Found a bug? Embrace the wabi-sabi 侘寂</p>
      </footer>
    </div>
  );
};

export default JapaneseColorApp;