const fs = require('fs');

// Function to convert a hex color to RGB
function hexToRgb(hex) {
  const parsedHex = hex.replace('#', '');
  const bigint = parseInt(parsedHex, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}

// Function to convert RGB to hex
function rgbToHex({ r, g, b }) {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

// Function to determine if a color is blue-dominant
function isBlue(b, r, g, minBlueValue = 0, blueDominanceRatio = 1.1) {
  return b > minBlueValue && b > blueDominanceRatio * r && b > blueDominanceRatio * g;
}

// Function to convert blue-dominant RGB to amber
function convertToOrange(b, g, a = 1) {
  let newR = Math.min(255, b);
  let newG = Math.min(165, g);
  return { r: newR, g: newG, b: 0, a };
}

// Recursive function to process JSON and convert hex colors
function processJsonColors(json) {
  for (let key in json) {
    if (typeof json[key] === 'object' && json[key] !== null) {
      // Recurse into nested objects or arrays
      processJsonColors(json[key]);
    } else if (typeof json[key] === 'string' && json[key].startsWith('#')) {
      const rgb = hexToRgb(json[key]);
      if (isBlue(rgb.b, rgb.r, rgb.g)) {
        const newColor = convertToOrange(rgb.b, rgb.g);
        json[key] = rgbToHex(newColor);
      }
    }
  }
}

// Function to read, process, and save JSON
function processFile(inputFile, outputFile) {
  try {
    // Read the JSON file
    const data = fs.readFileSync(inputFile, 'utf8');
    const json = JSON.parse(data);

    // Process colors in the JSON
    processJsonColors(json);

    // Write the updated JSON back to the file
    fs.writeFileSync(outputFile, JSON.stringify(json, null, 2), 'utf8');
    console.log(`Processed JSON saved to ${outputFile}`);
  } catch (err) {
    console.error('Error processing the file:', err.message);
  }
}

// Specify input and output files
const inputFile = './Orange Theme-color-theme.json';
const outputFile = './output.json';

// Process the JSON file
processFile(inputFile, outputFile);
