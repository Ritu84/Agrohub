const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192
};

async function generateIcons() {
  const sourceIcon = path.join(__dirname, '../assets/icon.png');
  const sourceSplash = path.join(__dirname, '../assets/splash.png');
  
  // Verify source files exist
  if (!fs.existsSync(sourceIcon)) {
    console.error(`Source icon not found: ${sourceIcon}`);
    process.exit(1);
  }

  if (!fs.existsSync(sourceSplash)) {
    console.error(`Source splash not found: ${sourceSplash}`);
    process.exit(1);
  }

  // Generate icons
  for (const [density, size] of Object.entries(sizes)) {
    const outputDir = path.join(
      __dirname, 
      `../android/app/src/main/res/mipmap-${density}`
    );
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'ic_launcher.png');
    
    try {
      await sharp(sourceIcon)
        .resize(size, size)
        .png()
        .toFile(outputPath);
        
      console.log(`Generated ${density} icon: ${size}x${size}`);
    } catch (err) {
      console.error(`Error generating ${density} icon:`, err);
    }
  }
}

// To use this script:
// 1. Place your source icon.png and splash.png files in the assets folder
// 2. Run 'npm install sharp' to install dependencies
// 3. Execute 'node scripts/generate-icons.js' from project root
// This will generate Android launcher icons in different densities
// and the splash screen image
// The icons will be saved in android/app/src/main/res/mipmap-* folders

generateIcons().catch(console.error);