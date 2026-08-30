/**
 * Crop and compress an image file to a 1x1 square ratio (800x800 Max)
 */
export function cropAndCompressImage(
  file: File,
  targetSize = 800,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('No se pudo inicializar el contexto de Canvas'));
          return;
        }

        // Calculate 1x1 crop box from center
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        canvas.width = targetSize;
        canvas.height = targetSize;

        // Draw cropped 1x1 image centered
        ctx.drawImage(
          img,
          startX,
          startY,
          minDim,
          minDim,
          0,
          0,
          targetSize,
          targetSize
        );

        // Convert to WebP base64 data URL
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = event.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}
