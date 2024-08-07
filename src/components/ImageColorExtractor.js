import React, { useState, useRef } from 'react';
import { Camera } from 'lucide-react';

const ImageColorExtractor = ({ onColorSelect, colorData, paletteData }) => {
  const [image, setImage] = useState(null);
  const [extractedColors, setExtractedColors] = useState([]);
  const [selectedColor, setSelectedColor] = useState(null);
  const [matchingColors, setMatchingColors] = useState([]);
  const [matchingPalettes, setMatchingPalettes] = useState([]);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        extractColors(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const capturedImage = new Image();
        capturedImage.src = canvas.toDataURL('image/jpeg');
        capturedImage.onload = () => {
          setImage(capturedImage);
          extractColors(capturedImage);
        };
        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const extractColors = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const colorCounts = {};

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const rgb = `rgb(${r},${g},${b})`;
      colorCounts[rgb] = (colorCounts[rgb] || 0) + 1;
    }

    const sortedColors = Object.entries(colorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([color]) => color);

    setExtractedColors(sortedColors);
  };

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    findMatchingColors(color);
  };

  const findMatchingColors = (selectedColor) => {
    const rgb = selectedColor.match(/\d+/g).map(Number);
    const matchingColors = Object.entries(colorData)
      .map(([name, data]) => {
        const cmyk = data.CMYK;
        const [c, m, y, k] = cmyk;
        const [r, g, b] = cmykToRgb(c, m, y, k);
        const distance = calculateColorDistance(rgb, [r, g, b]);
        return { name, distance };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5);

    setMatchingColors(matchingColors);

    const matchingPalettes = Object.entries(paletteData)
      .filter(([, palette]) =>
        palette.colors.some(color => matchingColors.some(match => match.name === color))
      )
      .map(([name, palette]) => ({ name, ...palette }));

    setMatchingPalettes(matchingPalettes);
  };

  const cmykToRgb = (c, m, y, k) => {
    const r = 255 * (1 - c / 100) * (1 - k / 100);
    const g = 255 * (1 - m / 100) * (1 - k / 100);
    const b = 255 * (1 - y / 100) * (1 - k / 100);
    return [Math.round(r), Math.round(g), Math.round(b)];
  };

  const calculateColorDistance = (rgb1, rgb2) => {
    return Math.sqrt(
      Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
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
        <button onClick={() => fileInputRef.current.click()} className="upload-btn">
          Upload Image
        </button>
        <button onClick={handleCameraCapture} className="camera-btn">
          <Camera size={24} />
          Capture Image
        </button>
      </div>
      {image && (
        <div className="image-preview">
          <img src={image.src} alt="Uploaded" className="preview-img" />
          <canvas ref={canvasRef} className="hidden" />
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
                style={{ backgroundColor: color }}
                onClick={() => handleColorSelect(color)}
              />
            ))}
          </div>
        </div>
      )}
      {selectedColor && (
        <div className="selected-color">
          <h3>Selected Color:</h3>
          <div
            className="color-preview"
            style={{ backgroundColor: selectedColor }}
          />
          <p>{selectedColor}</p>
        </div>
      )}
      {matchingColors.length > 0 && (
        <div className="matching-colors">
          <h3>Matching Colors:</h3>
          <ul>
            {matchingColors.map((color, index) => (
              <li key={index}>
                <span className="color-name">{color.name}</span>
                <span className="color-distance">(Distance: {color.distance.toFixed(2)})</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {matchingPalettes.length > 0 && (
        <div className="matching-palettes">
          <h3>Matching Palettes:</h3>
          <ul>
            {matchingPalettes.map((palette, index) => (
              <li key={index}>
                <span className="palette-name">{palette.name}</span>
                <span className="palette-section">({palette.section})</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ImageColorExtractor;
