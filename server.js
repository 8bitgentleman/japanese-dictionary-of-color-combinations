const express = require("express");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5050;
const COLORS_FILE_PATH = path.join(__dirname, "public", "colors.json");

app.use(bodyParser.json());
app.use(cors());

// API routes
app.post("/api/update-colors", (req, res) => {
  const newData = req.body;

  // Read the existing colors.json file
  fs.readFile(COLORS_FILE_PATH, "utf8", (readErr, data) => {
    if (readErr) {
      console.error("Error reading colors.json:", readErr);
      return res.status(500).send("Error reading colors.json");
    }

    let colorsData;
    try {
      colorsData = JSON.parse(data);
    } catch (parseErr) {
      console.error("Error parsing colors.json:", parseErr);
      return res.status(500).send("Error parsing colors.json");
    }

    // Merge new data with existing data
    colorsData = {
      ...colorsData,
      colors: {
        ...colorsData.colors,
        ...newData.colors,
      },
      palettes: {
        ...colorsData.palettes,
        ...newData.palettes,
      },
    };

    // Write the updated data back to colors.json
    fs.writeFile(
      COLORS_FILE_PATH,
      JSON.stringify(colorsData, null, 2),
      (writeErr) => {
        if (writeErr) {
          console.error("Error writing to colors.json:", writeErr);
          return res.status(500).send("Error updating colors.json");
        }
        res.send("colors.json updated successfully");
      },
    );
  });
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));

if (process.env.NODE_ENV === "production") {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, "build")));

  // For any other route, serve the React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
