import sharp from 'sharp';

export interface ProcessedImage {
  buffer: Buffer;
  contentType: 'image/webp';
  width: number;
  height: number;
  sizeBytes: number;
  filename: string;
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_ORIGINAL_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB limit

/**
 * Process, sanitize, and compress an archival photograph:
 * - Validates MIME type and file size.
 * - Strips all EXIF, GPS, camera, and device metadata.
 * - Resizes to max width 1600px (no upscaling).
 * - Converts to optimized WebP (targeting ~200-300 KB).
 */
export async function processArchivalPhoto(
  inputBuffer: Buffer,
  originalFilename: string,
  mimeType: string
): Promise<ProcessedImage> {
  if (!ALLOWED_MIME_TYPES.has(mimeType.toLowerCase())) {
    throw new Error(
      `Invalid image format "${mimeType}". Only JPEG, PNG, and WebP archival photographs are supported. (SVG is not permitted for security reasons).`
    );
  }

  if (inputBuffer.length > MAX_ORIGINAL_SIZE_BYTES) {
    throw new Error('Image exceeds the maximum allowed file size of 15 MB.');
  }

  // Use Sharp to process and completely strip metadata
  const image = sharp(inputBuffer, { failOn: 'none' });
  const metadata = await image.metadata();

  if (!metadata.format || !['jpeg', 'png', 'webp'].includes(metadata.format)) {
    throw new Error('Image format verification failed.');
  }

  // Resize and compress
  const processedBuffer = await image
    .rotate() // auto-orient based on EXIF before stripping
    .resize({
      width: 1600,
      withoutEnlargement: true,
      fit: 'inside',
    })
    .webp({
      quality: 82,
      effort: 5,
    })
    .toBuffer();

  const finalMetadata = await sharp(processedBuffer).metadata();

  // Create clean safe filename
  const cleanBaseName = originalFilename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^\w-]/g, '-')
    .toLowerCase()
    .substring(0, 40);

  const timestamp = Date.now();
  const safeFilename = `${cleanBaseName}-${timestamp}.webp`;

  return {
    buffer: processedBuffer,
    contentType: 'image/webp',
    width: finalMetadata.width || 1600,
    height: finalMetadata.height || 1200,
    sizeBytes: processedBuffer.length,
    filename: safeFilename,
  };
}
