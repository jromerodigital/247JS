const { Jimp } = require('jimp');
const fs = require('fs');

async function extractIcon() {
  const imgPath = 'C:/Users/user/.gemini/antigravity/brain/c567dd35-ceef-427f-85a5-c367bf44c1dc/.user_uploaded/media_1788323167131.jpg';
  const outPath = './public/logo-icon.png';
  
  try {
    const img = await Jimp.read(imgPath);
    
    img.scan(0, 0, img.bitmap.width, img.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      if (r > 150 && g > 150 && b > 150) {
        this.bitmap.data[idx + 3] = 0; // Transparent
      }
    });
    
    img.autocrop();
    await img.write(outPath);
    console.log('Saved logo-icon.png');
    
  } catch (err) {
    console.error(err);
  }
}

extractIcon();
