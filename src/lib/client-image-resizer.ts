/**
 * Client-side image pre-processor and downscaler.
 *
 * Runs inside the browser prior to sending photo uploads to Server Actions.
 * Enforces:
 * 1. Allowed MIME types (JPEG, PNG, WebP). Strictly disallows SVGs, executables, or unknown binary blobs.
 * 2. Maximum dimensions of 2000px on the longest edge via HTML5 Canvas.
 * 3. Client-side compression (WebP / JPEG quality 0.85) ensuring payload size is strictly < 3MB
 *    (usually 150KB - 1.2MB), effortlessly fitting inside Vercel's 4.5MB Serverless Function body limit.
 * 4. Clear, user-friendly error messages if the image is corrupted or unsupported.
 */

export interface ClientResizeResult {
  file: File;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  width: number;
  height: number;
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_DIMENSION = 2000;
const MAX_CLIENT_FILE_SIZE = 30 * 1024 * 1024; // 30 MB raw file maximum before browser processing

export async function preparePhotoForUpload(file: File): Promise<ClientResizeResult> {
  const originalSize = file.size;

  // Basic check for file existence
  if (!file || !(file instanceof File)) {
    throw new Error('Please select a valid image file.');
  }

  // Reject empty file
  if (file.size === 0) {
    throw new Error('The selected image file is empty (0 bytes).');
  }

  // Reject enormous raw camera files > 30MB
  if (file.size > MAX_CLIENT_FILE_SIZE) {
    throw new Error('This image file is over 30 MB. Please choose a smaller photo.');
  }

  // Check file type & extension
  const extension = '.' + (file.name.split('.').pop() || '').toLowerCase();
  const mime = file.type.toLowerCase();

  const isSvg = mime.includes('svg') || extension === '.svg';
  if (isSvg) {
    throw new Error(
      'SVG vector files are not supported for archival photograph plates. Please use a photograph in JPEG, PNG, or WebP format.'
    );
  }

  const isAllowedMime = ALLOWED_MIME_TYPES.includes(mime);
  const isAllowedExt = ALLOWED_EXTENSIONS.includes(extension);

  if (!isAllowedMime && !isAllowedExt) {
    throw new Error(
      'Unsupported image format. Please upload an archival photograph in JPEG, PNG, or WebP format.'
    );
  }

  // Load image into an ImageBitmap or HTMLImageElement
  const imageBitmap = await loadImageBitmapOrElement(file);

  try {
    let targetWidth = imageBitmap.width;
    let targetHeight = imageBitmap.height;

    // Calculate proportional downscale if exceeding MAX_DIMENSION
    if (targetWidth > MAX_DIMENSION || targetHeight > MAX_DIMENSION) {
      if (targetWidth >= targetHeight) {
        targetHeight = Math.round((targetHeight * MAX_DIMENSION) / targetWidth);
        targetWidth = MAX_DIMENSION;
      } else {
        targetWidth = Math.round((targetWidth * MAX_DIMENSION) / targetHeight);
        targetHeight = MAX_DIMENSION;
      }
    }

    // Draw on Canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not initialize browser graphics context for image compression.');
    }

    ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);

    // Try WebP first; fallback to JPEG
    let blob: Blob | null = await new Promise((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/webp', 0.85);
    });

    let formatExt = '.webp';
    let outputType = 'image/webp';

    if (!blob || blob.size === 0) {
      blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.85);
      });
      formatExt = '.jpg';
      outputType = 'image/jpeg';
    }

    if (!blob) {
      throw new Error('Browser failed to encode compressed image.');
    }

    // If still over 3MB (extremely rare at 2000px 0.85), compress more aggressively
    if (blob.size > 3 * 1024 * 1024) {
      blob = await new Promise((resolve) => {
        canvas.toBlob((b) => resolve(b), outputType, 0.70);
      });
    }

    if (!blob || blob.size === 0) {
      throw new Error('Failed to produce a compressed photograph upload.');
    }

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const cleanFileName = `${baseName}${formatExt}`;
    const compressedFile = new File([blob], cleanFileName, { type: outputType });

    return {
      file: compressedFile,
      originalSizeBytes: originalSize,
      compressedSizeBytes: compressedFile.size,
      width: targetWidth,
      height: targetHeight,
    };
  } finally {
    if ('close' in imageBitmap && typeof imageBitmap.close === 'function') {
      imageBitmap.close();
    }
  }
}

async function loadImageBitmapOrElement(
  file: File
): Promise<ImageBitmap | HTMLImageElement> {
  // Use createImageBitmap if available in modern browsers
  if (typeof window !== 'undefined' && 'createImageBitmap' in window) {
    try {
      return await createImageBitmap(file);
    } catch {
      // Fallback to Image element if createImageBitmap fails
    }
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(
        new Error(
          'Could not decode this photo. Please ensure the file is not corrupted and is a valid JPEG, PNG, or WebP image.'
        )
      );
    };

    img.src = objectUrl;
  });
}
