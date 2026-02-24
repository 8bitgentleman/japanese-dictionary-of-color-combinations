import React, { useState, useEffect, useCallback } from "react";
import "./JapaneseColorApp.css";
import AddColorForm from "./components/AddColorForm";
import AddPaletteForm from "./components/AddPaletteForm";
import DownloadButton from "./components/DownloadButton";
import ColorLookup from "./components/ColorLookup";
import PaletteLookup from "./components/PaletteLookup";
import PaletteGrid from "./components/PaletteGrid";
import ImageColorExtractor from "./components/ImageColorExtractor";
import ColorGrid from "./components/ColorGrid";
import ColorDetailPanel from "./components/ColorDetailPanel";
import PaletteDetailPanel from "./components/PaletteDetailPanel";

const JapaneseColorApp = () => {
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState("main");
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedGridPalette, setSelectedGridPalette] = useState(null);

  // Palette favorites — lifted from PaletteGrid so they can be shared with ColorDetailPanel
  const [favoritePalettes, setFavoritePalettes] = useState([]);
  const [paletteFavoritesLoaded, setPaletteFavoritesLoaded] = useState(false);

  // Color favorites — new
  const [favoriteColors, setFavoriteColors] = useState([]);

  const isBrowseOnly = process.env.REACT_APP_BROWSE_ONLY === "true";

  const apiUrl =
    process.env.NODE_ENV === "production"
      ? "/api/update-colors"
      : "http://localhost:5050/api/update-colors";

  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/colors.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((jsonData) => {
        setData(jsonData);
      })
      .catch((error) => console.error("Error loading colors.json:", error));
  }, []);

  // Load palette favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("favoritePalettes");
    if (stored) {
      try {
        setFavoritePalettes(JSON.parse(stored));
      } catch (e) {}
    }
    setPaletteFavoritesLoaded(true);
  }, []);

  // Save palette favorites to localStorage
  useEffect(() => {
    if (paletteFavoritesLoaded) {
      localStorage.setItem("favoritePalettes", JSON.stringify(favoritePalettes));
    }
  }, [favoritePalettes, paletteFavoritesLoaded]);

  // Load color favorites from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("favoriteColors");
    if (stored) {
      try {
        setFavoriteColors(JSON.parse(stored));
      } catch (e) {}
    }
  }, []);

  // Save color favorites to localStorage
  useEffect(() => {
    localStorage.setItem("favoriteColors", JSON.stringify(favoriteColors));
  }, [favoriteColors]);

  const togglePaletteFavorite = useCallback((paletteName) => {
    setFavoritePalettes((prev) =>
      prev.includes(paletteName)
        ? prev.filter((n) => n !== paletteName)
        : [...prev, paletteName]
    );
  }, []);

  const toggleColorFavorite = useCallback((colorName) => {
    setFavoriteColors((prev) =>
      prev.includes(colorName)
        ? prev.filter((n) => n !== colorName)
        : [...prev, colorName]
    );
  }, []);

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

  const handleColorClick = (colorName) => {
    setSelectedColor(colorName);
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
          <>
            <PaletteGrid
              paletteData={data.palettes}
              colorData={data.colors}
              onPaletteClick={setSelectedGridPalette}
              selectedPalette={selectedGridPalette}
              favorites={favoritePalettes}
              toggleFavorite={togglePaletteFavorite}
              isLoaded={paletteFavoritesLoaded}
            />
            {selectedGridPalette && (
              <PaletteDetailPanel
                paletteName={selectedGridPalette}
                paletteData={data.palettes}
                colorData={data.colors}
                onClose={() => setSelectedGridPalette(null)}
                favoritePalettes={favoritePalettes}
                togglePaletteFavorite={togglePaletteFavorite}
              />
            )}
          </>
        );
      case "extractor":
        return (
          <ImageColorExtractor
            colorData={data.colors}
            paletteData={data.palettes}
          />
        );
      case "colors":
        return (
          <>
            <ColorGrid
              colorData={data.colors}
              onSectionClick={handleSectionClick}
              onColorClick={handleColorClick}
              selectedColor={selectedColor}
              favoriteColors={favoriteColors}
              toggleColorFavorite={toggleColorFavorite}
            />
            {selectedColor && (
              <ColorDetailPanel
                colorName={selectedColor}
                colorData={data.colors}
                paletteData={data.palettes}
                onClose={() => setSelectedColor(null)}
                favoriteColors={favoriteColors}
                toggleColorFavorite={toggleColorFavorite}
                favoritePalettes={favoritePalettes}
                togglePaletteFavorite={togglePaletteFavorite}
              />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <div className="site-header">
        <div className="header-seal">色</div>
        <div className="title-jp">日本の配色辞典</div>
        <div className="title-en">Japanese Dictionary of Color Combinations</div>
        <div className="header-divider"><div className="header-divider-diamond"></div></div>
      </div>
      <div className="tabs">
        <button
          onClick={() => { setActiveTab("main"); setSelectedGridPalette(null); }}
          className={activeTab === "main" ? "active" : ""}
        >
          <span className="tab-jp">検索</span>
          <span className="tab-en">Main</span>
        </button>
        <button
          onClick={() => setActiveTab("grid")}
          className={activeTab === "grid" ? "active" : ""}
        >
          <span className="tab-jp">配色</span>
          <span className="tab-en">Palettes</span>
        </button>
        <button
          onClick={() => { setActiveTab("colors"); setSelectedGridPalette(null); }}
          className={activeTab === "colors" ? "active" : ""}
        >
          <span className="tab-jp">色</span>
          <span className="tab-en">Colors</span>
        </button>
        <button
          onClick={() => { setActiveTab("extractor"); setSelectedGridPalette(null); }}
          className={activeTab === "extractor" ? "active" : ""}
        >
          <span className="tab-jp">抽出</span>
          <span className="tab-en">Extract</span>
        </button>
      </div>
      {data ? (
        renderActiveTab()
      ) : (
        <p className="placeholder-text">Loading data...</p>
      )}
      <footer className="app-footer">
        <p>
          Enjoyed this app? Tweet me at{" "}
          <a href="https://x.com/todayIwasbetter" target="_blank" rel="noopener noreferrer">
            @todayIwasbetter
          </a>
        </p>
        <p>
          Find the source code on{" "}
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
