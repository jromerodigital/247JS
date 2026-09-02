const Jimp = require('jimp');

async function processLogos() {
  const imgPath = 'C:/Users/user/.gemini/antigravity/brain/c567dd35-ceef-427f-85a5-c367bf44c1dc/.user_uploaded/media_1788322267314.jpg';
  const outDir = './public';
  
  try {
    const img = await Jimp.read(imgPath);
    const W = img.bitmap.width;
    const H = img.bitmap.height;
    
    console.log(`Dimensions: ${W}x${H}`);
    
    // 1. Extract Favicon (Pink circle icon)
    // It's in the bottom left, approx x: 0 to W*0.33, y: H*0.68 to H*0.87
    const favicon = img.clone().crop(W*0.05, H*0.68, W*0.25, H*0.19);
    // Remove #FAF6F0 background (Cream)
    favicon.scan(0, 0, favicon.bitmap.width, favicon.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      // Cream is ~ 250, 246, 240
      if (r > 240 && g > 235 && b > 230) {
        this.bitmap.data[idx + 3] = 0; // Alpha 0
      }
    });
    // Auto crop transparent borders
    favicon.autocrop();
    await favicon.writeAsync(`${outDir}/favicon.png`);
    console.log('Saved favicon.png');

    // 2. Extract Main Logo (Icon + Wordmark Horizontal Dark)
    // Actually, in the image, the top half is stacked.
    // Let's extract the "SOLO WORDMARK" from bottom center.
    // x: W*0.33 to W*0.66, y: H*0.68 to H*0.87
    const wordmark = img.clone().crop(W*0.35, H*0.7, W*0.3, H*0.15);
    wordmark.scan(0, 0, wordmark.bitmap.width, wordmark.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      if (r > 240 && g > 235 && b > 230) {
        this.bitmap.data[idx + 3] = 0;
      }
    });
    wordmark.autocrop();
    await wordmark.writeAsync(`${outDir}/logo-wordmark.png`);
    console.log('Saved logo-wordmark.png');
    
    // 3. Extract Horizontal White Logo from Pink background
    // x: 0 to W*0.5, y: H*0.48 to H*0.68
    const logoWhite = img.clone().crop(W*0.05, H*0.48, W*0.4, H*0.2);
    logoWhite.scan(0, 0, logoWhite.bitmap.width, logoWhite.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      // Pink is ~ 194, 122, 126
      if (r > 150 && r < 210 && g > 90 && g < 150 && b > 100 && b < 160) {
        this.bitmap.data[idx + 3] = 0;
      }
    });
    logoWhite.autocrop();
    await logoWhite.writeAsync(`${outDir}/logo-white.png`);
    console.log('Saved logo-white.png');

  } catch (err) {
    console.error(err);
  }
}

processLogos();
