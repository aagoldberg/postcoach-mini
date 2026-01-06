const sharp = require('sharp');
const path = require('path');

// Helm/ship wheel icon - purple theme (1024x1024 for app store)
const iconSvg = `
<svg width="1024" height="1024" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
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

// OG Image for social sharing (1200x630, 3:2 ratio)
const ogImageSvg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgOg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7c3aed"/>
      <stop offset="100%" style="stop-color:#5b21b6"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bgOg)"/>

  <!-- Helm wheel (smaller, on left side) -->
  <g transform="translate(250, 315) scale(1.5)">
    <circle cx="0" cy="0" r="55" fill="none" stroke="white" stroke-width="6" opacity="0.9"/>
    <circle cx="0" cy="0" r="18" fill="white" opacity="0.9"/>
    <g stroke="white" stroke-width="6" stroke-linecap="round" opacity="0.9">
      <line x1="0" y1="-18" x2="0" y2="-55"/>
      <line x1="0" y1="18" x2="0" y2="55"/>
      <line x1="-18" y1="0" x2="-55" y2="0"/>
      <line x1="18" y1="0" x2="55" y2="0"/>
      <line x1="-13" y1="-13" x2="-39" y2="-39"/>
      <line x1="13" y1="13" x2="39" y2="39"/>
      <line x1="-13" y1="13" x2="-39" y2="39"/>
      <line x1="13" y1="-13" x2="39" y2="-39"/>
    </g>
    <g fill="white" opacity="0.9">
      <circle cx="0" cy="-55" r="6"/>
      <circle cx="0" cy="55" r="6"/>
      <circle cx="-55" cy="0" r="6"/>
      <circle cx="55" cy="0" r="6"/>
      <circle cx="-39" cy="-39" r="6"/>
      <circle cx="39" cy="39" r="6"/>
      <circle cx="-39" cy="39" r="6"/>
      <circle cx="39" cy="-39" r="6"/>
    </g>
  </g>

  <!-- Text -->
  <text x="480" y="280" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="700" fill="white">Tenor</text>
  <text x="480" y="350" font-family="system-ui, -apple-system, sans-serif" font-size="32" fill="rgba(255,255,255,0.8)">AI Influence Coach</text>

  <!-- Tagline -->
  <text x="480" y="440" font-family="system-ui, -apple-system, sans-serif" font-size="28" fill="rgba(255,255,255,0.7)">Optimize your reach</text>
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
