const sharp = require('sharp');
const path = require('path');

// Icon - just "T" (1024x1024)
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" fill="white"/>
  <text x="512" y="680" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="600" font-weight="400" fill="#1a1a1a">T</text>
</svg>
`;

// Splash - just "T" (200x200)
const splashSvg = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <rect width="200" height="200" fill="white"/>
  <text x="100" y="140" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="120" font-weight="400" fill="#1a1a1a">T</text>
</svg>
`;

// OG Image (1200x630)
const ogImageSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#f8f8f8"/>
  <text x="600" y="280" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="140" font-weight="400" fill="#111111">PostCoach</text>
  <text x="600" y="370" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="36" font-weight="500" letter-spacing="0.05em" fill="#444444">Post better. Faster.</text>
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
    .toFile(path.join(publicDir, 'og-image-v2.png'));

  console.log('Created og-image-v2.png (1200x630)');
}

generate().catch(console.error);
