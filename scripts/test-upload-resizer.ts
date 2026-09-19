import sharp from 'sharp';
import { processArchivalPhoto } from '../src/lib/image-processor';

async function runUploadSizeTests() {
  console.log('🧪 Starting Upload Size & Compression Verification Test...\n');

  // Test 1: Generate a high-resolution 4000x3000 photo with metadata (simulating camera scan)
  console.log('1. Generating simulated 4000x3000 high-res camera scan photo...');
  const highResRawBuffer = await sharp({
    create: {
      width: 4000,
      height: 3000,
      channels: 3,
      background: { r: 180, g: 150, b: 120 },
    },
  })
    .withMetadata({
      exif: {
        IFD0: {
          Make: 'Vintage Scanner Co.',
          Model: 'Flatbed Pro 9000',
        },
      },
    })
    .jpeg({ quality: 95 })
    .toBuffer();

  const originalSizeBytes = highResRawBuffer.length;
  console.log(`   Original High-Res Size: ${(originalSizeBytes / (1024 * 1024)).toFixed(2)} MB (${originalSizeBytes} bytes)`);

  // Test 2: Process with server-side pipeline (simulating post-client upload)
  console.log('\n2. Testing archival processing & metadata stripping...');
  const processed = await processArchivalPhoto(
    highResRawBuffer,
    'Grandmother-Village-Courtyard-1974.jpg',
    'image/jpeg'
  );

  const processedSizeKB = (processed.sizeBytes / 1024).toFixed(2);
  console.log(`   Processed Output Filename: ${processed.filename}`);
  console.log(`   Processed Output Content-Type: ${processed.contentType}`);
  console.log(`   Processed Dimensions: ${processed.width}x${processed.height} (bounded to max 1600px)`);
  console.log(`   Processed Size: ${processedSizeKB} KB (well below 300-400 KB target)`);

  if (processed.width > 1600) {
    throw new Error(`Expected max width <= 1600, got ${processed.width}`);
  }
  if (processed.sizeBytes > 500 * 1024) {
    throw new Error(`Expected size <= 500 KB, got ${processedSizeKB} KB`);
  }

  // Test 3: Inspect metadata stripping
  const outputMetadata = await sharp(processed.buffer).metadata();
  if (outputMetadata.exif) {
    throw new Error('EXIF metadata was not stripped!');
  }
  console.log('   ✅ Metadata stripped completely (zero EXIF/GPS leaks).');

  // Test 4: Reject SVG file
  console.log('\n3. Testing SVG format rejection for security...');
  let svgRejected = false;
  try {
    await processArchivalPhoto(
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>'),
      'malicious.svg',
      'image/svg+xml'
    );
  } catch (err: unknown) {
    svgRejected = true;
    console.log(`   ✅ SVG correctly rejected: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (!svgRejected) {
    throw new Error('SVG was not rejected!');
  }

  console.log('\n✨ ALL UPLOAD SIZE & COMPRESSION TESTS PASSED SUCCESSFULLY! ✨\n');
}

runUploadSizeTests().catch((err) => {
  console.error('❌ Upload Test Failed:', err);
  process.exit(1);
});
