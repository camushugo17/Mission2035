/**
 * Script pour convertir une image de carte en base64
 * Utilisation : node map-converter.js chemin/vers/image.png
 */

const fs = require('fs');
const path = require('path');

const imagePath = process.argv[2];

if (!imagePath) {
  console.error('Usage: node map-converter.js <image-path>');
  process.exit(1);
}

const fullPath = path.resolve(imagePath);

if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}

const imageBuffer = fs.readFileSync(fullPath);
const base64 = imageBuffer.toString('base64');
const ext = path.extname(imagePath).toLowerCase().slice(1);
const mimeType = `image/${ext === 'jpg' ? 'jpeg' : ext}`;

console.log(`data:${mimeType};base64,${base64}`);
