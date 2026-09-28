/**
 * Client-Side Image Compression & Optimization Utility
 *
 * Compresses and resizes high-resolution image files (phone camera photos, heavy JPEGs/PNGs)
 * into lightweight WebP/JPEG format before uploading to the server.
 * Reduces 5MB-10MB images down to ~50KB-120KB in milliseconds.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export const compressImageFile = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    outputFormat = 'image/webp',
  } = options;

  // If SVG or GIF, do not compress via canvas to avoid losing vector quality/animation
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file;
  }

  // If already very small (< 60KB), return directly
  if (file.size < 60 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let { width, height } = img;

        // Calculate scaled dimensions while preserving aspect ratio
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Use high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }

            // Create new optimized File object
            const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const ext = outputFormat === 'image/webp' ? '.webp' : outputFormat === 'image/png' ? '.png' : '.jpg';
            const optimizedFile = new File([blob], `${fileNameWithoutExt}${ext}`, {
              type: outputFormat,
              lastModified: Date.now(),
            });

            resolve(optimizedFile);
          },
          outputFormat,
          quality
        );
      };

      img.onerror = () => {
        resolve(file);
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      resolve(file);
    };

    reader.readAsDataURL(file);
  });
};
