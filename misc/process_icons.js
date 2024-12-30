const fs = require('fs');
const path = require('path');

function hexToRgba(hex) {
  const parsedHex = hex.replace('#', '');
  let r = 0, g = 0, b = 0, a = 1;
  if (parsedHex.length === 6) {
    const bigint = parseInt(parsedHex, 16);
    r = (bigint >> 16) & 255;
    g = (bigint >> 8) & 255;
    b = bigint & 255;
  } else if (parsedHex.length === 8) {
    const bigint = parseInt(parsedHex, 16);
    r = (bigint >> 24) & 255;
    g = (bigint >> 16) & 255;
    b = (bigint >> 8) & 255;
    a = (bigint & 255) / 255;
  }
  return { r, g, b, a };
}

function rgbaToHex({ r, g, b, a = 1 }) {
  const alpha = (Math.round(a * 255) & 255).toString(16).padStart(2, '0');
  const hex = ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  return `#${hex}${alpha !== 'ff' ? alpha : ''}`;
}

function isBlue(b, r, g, minBlueValue = 0, blueDominanceRatio = 1.1) {
  return b > minBlueValue && b > blueDominanceRatio * r && b > blueDominanceRatio * g;
}

function convertToOrange(b, g, a = 1) {
  let newR = Math.min(255, b);
  let newG = Math.min(165, g);
  return { r: newR, g: newG, b: 0, a };
}

function processSvgContent(svgContent) {
  return svgContent.replace(/#[0-9A-Fa-f]{3,8}/g, (match) => {
    const rgba = hexToRgba(match);
    if (isBlue(rgba.b, rgba.r, rgba.g)) {
      const newColor = convertToOrange(rgba.b, rgba.g, rgba.a);
      return rgbaToHex(newColor);
    }
    return match;
  });
}

function processSvgs(dirPath) {
  fs.readdirSync(dirPath).forEach(file => {
    if (path.extname(file).toLowerCase() === '.svg') {
      const svgPath = path.join(dirPath, file);
      const svgContent = fs.readFileSync(svgPath, 'utf8');
      const updatedContent = processSvgContent(svgContent);
      fs.writeFileSync(svgPath, updatedContent, 'utf8');
      console.log(`Processed ${file}`);
    }
  });
}

processSvgs('./vscode-icons/icons');
