const sharp = require('sharp');
const path = require('path');

// Clean text-based icon (1024x1024)
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="white"/>
  <text x="512" y="480" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="280" font-weight="400" fill="#1a1a1a">Tenor</text>
  <text x="512" y="600" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="64" fill="#666666">Your AI Influence Trainer</text>
</svg>
`;

// Splash (200x200)
const splashSvg = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="white"/>
  <text x="100" y="95" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="56" font-weight="400" fill="#1a1a1a">Tenor</text>
  <text x="100" y="125" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="13" fill="#666666">Your AI Influence Trainer</text>
</svg>
`;

// OG Image (1200x630)
const ogImageSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="white"/>
  <text x="600" y="300" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="180" font-weight="700" fill="#1a1a1a">Tenor</text>
  <text x="600" y="400" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="500" fill="#555555">Your AI Influence Trainer</text>
</svg>
`;

async function generate() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Generate icon (1024x1024 for app store)
  await sharp(Buffer.from(iconSvg))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(publicDir, 'icon.png'));

  console.log('Created icon.png (1024x1024)');

  // Generate splash (200x200 per spec)
  await sharp(Buffer.from(splashSvg))
    .resize(200, 200)
    .png()
    .toFile(path.join(publicDir, 'splash.png'));

  console.log('Created splash.png (200x200)');

  // Generate OG image (1200x630 for social sharing)
  await sharp(Buffer.from(ogImageSvg))
    .resize(1200, 630)
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  console.log('Created og-image.png (1200x630)');
}

generate().catch(console.error);
