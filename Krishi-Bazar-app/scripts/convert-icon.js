const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function convertIcon() {
  const sourceIcon = path.join(__dirname, '../assets/icon.png');
  const assetsDir = path.join(__dirname, '../assets');
  
  // Ensure source icon exists
  if (!fs.existsSync(sourceIcon)) {
    console.error('Source icon not found:', sourceIcon);
    process.exit(1);
  }

  const iconConfigs = [
    {
      output: 'adaptive-icon.png',
      width: 1024,
      height: 1024,
      background: true
    },
    {
      output: 'splash.png',
      width: 1242,
      height: 2436,
      fit: 'contain',
      background: true
    },
    {
      output: 'favicon.png',
      width: 32,
      height: 32
    },
    {
      output: 'notification-icon.png',
      width: 96,
      height: 96,
      background: true
    }
  ];

  try {
    for (const config of iconConfigs) {
      const outputPath = path.join(assetsDir, config.output);
      console.log(`Generating ${config.output}...`);
      
      let image = sharp(sourceIcon)
        .resize(config.width, config.height, {
          fit: config.fit || 'cover',
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        });

      if (config.background) {
        image = image.flatten({ background: '#ffffff' });
      }

      if (config.output === 'splash.png') {
        // For splash screen, resize maintaining aspect ratio and center
        image = sharp(sourceIcon)
          .resize(Math.floor(config.width * 0.5), Math.floor(config.height * 0.5), {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          })
          .extend({
            top: Math.floor(config.height * 0.25),
            bottom: Math.floor(config.height * 0.25),
            left: Math.floor(config.width * 0.25),
            right: Math.floor(config.width * 0.25),
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          });
      }

      await image
        .png()
        .toFile(outputPath);
    }

    console.log('Successfully generated all icon files');
  } catch (err) {
    console.error('Error generating icons:', err);
    process.exit(1);
  }
}

convertIcon().catch(console.error); 