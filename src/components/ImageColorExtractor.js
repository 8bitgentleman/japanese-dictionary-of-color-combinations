import React, { useState, useRef, useEffect } from "react";
import { Camera } from "lucide-react";
import ColorThief from "colorthief";
import ColorSwatchCard from "./ColorSwatchCard";
import "./ImageColorExtractor.css";

const ImageColorExtractor = ({ colorData, paletteData }) => {
  const [image, setImage] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [matchingColors, setMatchingColors] = useState([]);
  const [matchingPalettes, setMatchingPalettes] = useState([]);
  const [optionalColor, setOptionalColor] = useState(null);
  const fileInputRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (image) {
      extractColors(image);
    }
  }, [image]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      const capturedImage = canvas.toDataURL("image/jpeg");
      setImage(capturedImage);

      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const extractColors = async (imageSource) => {
    const colorThief = new ColorThief();
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageSource;

    img.onload = () => {
      const palette = colorThief.getPalette(img, 5);
      setExtractedColors(palette.map((rgb) => ({ rgb, hex: rgbToHex(rgb) })));
    };
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    findMatchingColors(color.rgb);
  };

  const findMatchingColors = (selectedRgb) => {
    if (!colorData) {
      console.error("Color data is undefined");
      return;
    }

    const matchingColors = Object.entries(colorData)
      .map(([name, data]) => {
        if (!data || !data.CMYK) {
          console.error(`Invalid color data for ${name}:`, data);
          return null;
        }
        const cmyk = data.CMYK;
        const [c, m, y, k] = cmyk;
        const rgb = cmykToRgb(c, m, y, k);
        const distance = calculateColorDistance(selectedRgb, rgb);
        return { name, cmyk, rgb, distance };
      })
      .filter((color) => color !== null)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    setMatchingColors(matchingColors);

    const matchingPalettes = Object.entries(paletteData)
      .filter(([, palette]) =>
        palette.colors.some((color) =>
          matchingColors.some((match) => match.name === color),
        ),
      )
      .map(([name, palette]) => ({
        name: palette.name,
        section: palette.section,
        colors: palette.colors,
      }));

    setMatchingPalettes(matchingPalettes);
  };

  const handleOptionalColorSelect = (color) => {
    setOptionalColor(color);
    updateMatchingPalettes(color);
  };

  const updateMatchingPalettes = (newColor) => {
    const updatedPalettes = Object.entries(paletteData)
      .filter(([, palette]) =>
        palette.colors.some(
          (color) =>
            matchingColors.some((match) => match.name === color) ||
            color === newColor.name,
        ),
      )
      .map(([name, palette]) => ({
        name: palette.name,
        section: palette.section,
        colors: palette.colors,
      }));

    setMatchingPalettes(updatedPalettes);
  };

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

  const rgbToHex = ([r, g, b]) => {
    return (
      "#" +
      ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
    );
  };

  const calculateColorDistance = (rgb1, rgb2) => {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
        Math.pow(rgb1[1] - rgb2[1], 2) +
        Math.pow(rgb1[2] - rgb2[2], 2),
    );
  };

  return (
    <div className="image-color-extractor">
      <h2>Image Color Extractor</h2>
      <div className="upload-section">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current.click()}
          className="upload-btn"
        >
          Upload Image
        </button>
        <button onClick={handleCameraCapture} className="camera-btn">
          <Camera size={24} />
          Capture Image
        </button>
      </div>
      {image && (
        <div className="image-preview">
          <img
            src={image}
            alt="Uploaded"
            className="preview-img"
            ref={imageRef}
          />
        </div>
      )}
      {extractedColors.length > 0 && (
        <div className="extracted-colors">
          <h3>Extracted Colors:</h3>
          <div className="color-list">
            {extractedColors.map((color, index) => (
              <div
                key={index}
                className="color-item"
                style={{ backgroundColor: color.hex }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
        </div>
      )}
      {selectedColor && (
        <div className="selected-color">
          <h3>Selected Color:</h3>
          <ColorSwatchCard
            colorName="Selected Color"
            cmyk={rgbToCmyk(...selectedColor.rgb)}
          />
        </div>
      )}
      {matchingColors.length > 0 && (
        <div className="matching-colors">
          <h3>Matching Colors:</h3>
          <div className="color-swatch-list">
            {matchingColors.map((color, index) => (
              <ColorSwatchCard
                key={index}
                colorName={color.name}
                cmyk={color.cmyk}
              />
            ))}
          </div>
        </div>
      )}
      <div className="optional-color-section">
        <h3>Select Optional Color:</h3>
        <select
          onChange={(e) => handleOptionalColorSelect({ name: e.target.value })}
        >
          <option value="">Select a color</option>
          {Object.keys(colorData).map((colorName) => (
            <option key={colorName} value={colorName}>
              {colorName}
            </option>
          ))}
        </select>
      </div>
      {matchingPalettes.length > 0 && (
        <div className="matching-palettes">
          <h3>Matching Palettes:</h3>
          <div className="palette-list">
            {matchingPalettes.map((palette, index) => (
              <div key={index} className="palette-card">
                <h4>
                  {palette.name} ({palette.section})
                </h4>
                <div className="palette-swatches">
                  {palette.colors.map((colorName, colorIndex) => (
                    <div
                      key={colorIndex}
                      className="palette-swatch"
                      style={{
                        backgroundColor: `rgb(${cmykToRgb(...colorData[colorName].CMYK).join(",")})`,
                      }}
                      title={colorName}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const rgbToCmyk = (r, g, b) => {
  let c = 1 - r / 255;
  let m = 1 - g / 255;
  let y = 1 - b / 255;
  let k = Math.min(c, m, y);

  c = (c - k) / (1 - k);
  m = (m - k) / (1 - k);
  y = (y - k) / (1 - k);

  return [
    Math.round(c * 100),
    Math.round(m * 100),
    Math.round(y * 100),
    Math.round(k * 100),
  ];
};

export default ImageColorExtractor;
