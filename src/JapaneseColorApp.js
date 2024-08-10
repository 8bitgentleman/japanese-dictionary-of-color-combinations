import React, { useState, useEffect } from "react";
import "./JapaneseColorApp.css";
import AddColorForm from "./components/AddColorForm";
import AddPaletteForm from "./components/AddPaletteForm";
import DownloadButton from "./components/DownloadButton";
import ColorLookup from "./components/ColorLookup";
import PaletteLookup from "./components/PaletteLookup";
import PaletteGrid from "./components/PaletteGrid";
import ImageColorExtractor from "./components/ImageColorExtractor";

const JapaneseColorApp = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("main");

  const apiUrl =
    process.env.NODE_ENV === "production"
      ? "/api/update-colors"
      : "http://localhost:5050/api/update-colors";

  useEffect(() => {
    fetch("/colors.json")
      .then((response) => response.json())
      .then((jsonData) => setData(jsonData))
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
            />
            <AddPaletteForm
              onAddPalette={handleAddPalette}
              colors={data.colors}
            />
            <AddColorForm onAddColor={handleAddColor} />
            <DownloadButton data={data} />
          </div>
        );
      case "grid":
        return (
          <PaletteGrid paletteData={data.palettes} colorData={data.colors} />
        );
      case "extractor":
        return (
          <ImageColorExtractor
            colorData={data.colors}
            paletteData={data.palettes}
          />
        );
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
    </div>
  );
};

export default JapaneseColorApp;
