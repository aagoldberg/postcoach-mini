const sharp = require('sharp');
const path = require('path');

// Helm/ship wheel icon - purple theme
const iconSvg = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#5b21b6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="200" height="200" rx="40" fill="url(#bg)"/>

  <!-- Helm wheel -->
  <g transform="translate(100, 100)">
    <!-- Outer ring -->
    <circle cx="0" cy="0" r="55" fill="none" stroke="white" stroke-width="8"/>

    <!-- Inner circle -->
    <circle cx="0" cy="0" r="18" fill="white"/>

    <!-- Spokes (8 of them) -->
    <g stroke="white" stroke-width="8" stroke-linecap="round">
      <line x1="0" y1="-18" x2="0" y2="-55"/>
      <line x1="0" y1="18" x2="0" y2="55"/>
      <line x1="-18" y1="0" x2="-55" y2="0"/>
      <line x1="18" y1="0" x2="55" y2="0"/>
      <line x1="-13" y1="-13" x2="-39" y2="-39"/>
      <line x1="13" y1="13" x2="39" y2="39"/>
      <line x1="-13" y1="13" x2="-39" y2="39"/>
      <line x1="13" y1="-13" x2="39" y2="-39"/>
    </g>

    <!-- Handle knobs on outer ring -->
    <g fill="white">
      <circle cx="0" cy="-55" r="8"/>
      <circle cx="0" cy="55" r="8"/>
      <circle cx="-55" cy="0" r="8"/>
      <circle cx="55" cy="0" r="8"/>
      <circle cx="-39" cy="-39" r="8"/>
      <circle cx="39" cy="39" r="8"/>
      <circle cx="-39" cy="39" r="8"/>
      <circle cx="39" cy="-39" r="8"/>
    </g>
  </g>
</svg>
`;

// Splash - simpler, just logo and name
const splashSvg = `
<svg width="200" height="200" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#5b21b6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="200" height="200" fill="url(#bg2)"/>

  <!-- Smaller helm wheel -->
  <g transform="translate(100, 85) scale(0.6)">
    <circle cx="0" cy="0" r="55" fill="none" stroke="white" stroke-width="8"/>
    <circle cx="0" cy="0" r="18" fill="white"/>
    <g stroke="white" stroke-width="8" stroke-linecap="round">
      <line x1="0" y1="-18" x2="0" y2="-55"/>
      <line x1="0" y1="18" x2="0" y2="55"/>
      <line x1="-18" y1="0" x2="-55" y2="0"/>
      <line x1="18" y1="0" x2="55" y2="0"/>
      <line x1="-13" y1="-13" x2="-39" y2="-39"/>
      <line x1="13" y1="13" x2="39" y2="39"/>
      <line x1="-13" y1="13" x2="-39" y2="39"/>
      <line x1="13" y1="-13" x2="39" y2="-39"/>
    </g>
    <g fill="white">
      <circle cx="0" cy="-55" r="8"/>
      <circle cx="0" cy="55" r="8"/>
      <circle cx="-55" cy="0" r="8"/>
      <circle cx="55" cy="0" r="8"/>
      <circle cx="-39" cy="-39" r="8"/>
      <circle cx="39" cy="39" r="8"/>
      <circle cx="-39" cy="39" r="8"/>
      <circle cx="39" cy="-39" r="8"/>
    </g>
  </g>

  <!-- Text -->
  <text x="100" y="160" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="600" fill="white">tenor</text>
</svg>
`;

async function generate() {
  const publicDir = path.join(__dirname, '..', 'public');

  // Generate icon
  await sharp(Buffer.from(iconSvg))
    .resize(200, 200)
    .png()
    .toFile(path.join(publicDir, 'icon.png'));

  console.log('Created icon.png');

  // Generate splash
  await sharp(Buffer.from(splashSvg))
    .resize(200, 200)
    .png()
    .toFile(path.join(publicDir, 'splash.png'));

  console.log('Created splash.png');
}

generate().catch(console.error);
