/**
 * Image processing and optimization utility.
 * Compresses and resizes uploaded product images to clean Base64 Data URLs.
 */

export async function optimizeImage(
  file: File,
  maxDimension = 1600,
  quality = 0.88
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image data.'));
      img.onload = () => {
        let { width, height } = img;

        // Calculate target dimensions preserving aspect ratio
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context for image optimization.'));
          return;
        }

        // Clean rendering settings
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to data URL (JPEG for photos, PNG if transparency needed)
        const isPng = file.type === 'image/png';
        const format = isPng ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, isPng ? undefined : quality);

        resolve(dataUrl);
      };

      if (typeof event.target?.result === 'string') {
        img.src = event.target.result;
      } else {
        reject(new Error('Invalid reader output'));
      }
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Validates whether a string is a valid data URL or base64 image
 */
export function isValidImageData(dataUrl: string): boolean {
  if (!dataUrl) return false;
  return dataUrl.startsWith('data:image/');
}

/**
 * Converts a Data URL string to a Uint8Array for binary processing (DOCX / jsPDF)
 */
export function dataUrlToUint8Array(dataUrl: string): { array: Uint8Array; mimeType: string } {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return { array: u8arr, mimeType };
}
