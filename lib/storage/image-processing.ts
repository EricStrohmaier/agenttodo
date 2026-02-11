/**
 * Image processing utilities
 *
 * Transforms and optimizes images for storage:
 * - Converts any format to WebP (best compression) or JPEG
 * - Resizes large images to reasonable dimensions
 * - Compresses with quality settings that balance size and quality
 */

import sharp from "sharp";

// =============================================================================
// Types
// =============================================================================

export interface ProcessedImage {
  buffer: Buffer;
  contentType: string;
  extension: string;
  width: number;
  height: number;
  originalSize: number;
  processedSize: number;
}

export interface ProcessingOptions {
  /** Maximum width (height scales proportionally). Default: 2048 */
  maxWidth?: number;
  /** Maximum height (width scales proportionally). Default: 2048 */
  maxHeight?: number;
  /** Quality 1-100. Default: 85 */
  quality?: number;
  /** Output format. Default: "webp" */
  format?: "webp" | "jpeg";
}

// =============================================================================
// Constants
// =============================================================================

const DEFAULT_OPTIONS: Required<ProcessingOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 85,
  format: "webp",
};

// =============================================================================
// Processing Functions
// =============================================================================

/**
 * Process an image buffer - resize, convert format, and compress
 *
 * Accepts any image format that sharp supports:
 * JPEG, PNG, WebP, GIF, AVIF, TIFF, SVG, HEIF/HEIC
 *
 * @param input - Image buffer or file
 * @param options - Processing options
 * @returns Processed image with metadata
 */
export async function processImage(
  input: Buffer | File,
  options: ProcessingOptions = {}
): Promise<ProcessedImage> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  console.log("[processImage] Starting with options:", opts);
  console.log("[processImage] Input type:", input ? (input instanceof File ? "File" : "Buffer") : "undefined");

  // Validate input exists
  if (!input) {
    throw new Error("No input provided to processImage");
  }

  // Convert File to Buffer if needed
  let inputBuffer: Buffer;
  if (input instanceof File) {
    console.log("[processImage] Converting File to Buffer, file size:", input.size);
    const arrayBuffer = await input.arrayBuffer();
    console.log("[processImage] ArrayBuffer byteLength:", arrayBuffer?.byteLength);
    if (!arrayBuffer || arrayBuffer.byteLength === 0) {
      throw new Error("File arrayBuffer is empty");
    }
    inputBuffer = Buffer.from(arrayBuffer);
  } else if (Buffer.isBuffer(input)) {
    inputBuffer = input;
  } else {
    throw new Error(`Invalid input type: expected File or Buffer, got ${typeof input}`);
  }

  // Check buffer is valid before accessing length
  if (!inputBuffer) {
    throw new Error("Failed to create input buffer");
  }

  const originalSize = inputBuffer.length;
  console.log("[processImage] Input buffer size:", originalSize);

  if (originalSize === 0) {
    throw new Error("Empty input buffer");
  }

  // Create sharp instance
  let image = sharp(inputBuffer);
  console.log("[processImage] Sharp instance created");

  // Get original metadata
  const metadata = await image.metadata();

  // Rotate based on EXIF orientation (common for phone photos)
  image = image.rotate();

  // Resize if exceeds max dimensions (maintains aspect ratio)
  const needsResize =
    (metadata.width && metadata.width > opts.maxWidth) ||
    (metadata.height && metadata.height > opts.maxHeight);

  if (needsResize) {
    image = image.resize(opts.maxWidth, opts.maxHeight, {
      fit: "inside",
      withoutEnlargement: true,
    });
  }

  // Convert to target format with compression
  let outputBuffer: Buffer;
  let contentType: string;
  let extension: string;

  if (opts.format === "webp") {
    outputBuffer = await image
      .webp({
        quality: opts.quality,
        effort: 4, // Balance between speed and compression
      })
      .toBuffer();
    contentType = "image/webp";
    extension = "webp";
  } else {
    outputBuffer = await image
      .jpeg({
        quality: opts.quality,
        mozjpeg: true, // Better compression
      })
      .toBuffer();
    contentType = "image/jpeg";
    extension = "jpg";
  }

  // Get output dimensions
  const outputMetadata = await sharp(outputBuffer).metadata();

  return {
    buffer: outputBuffer,
    contentType,
    extension,
    width: outputMetadata.width || 0,
    height: outputMetadata.height || 0,
    originalSize,
    processedSize: outputBuffer.length,
  };
}

/**
 * Process multiple images in parallel
 */
export async function processImages(
  inputs: (Buffer | File)[],
  options: ProcessingOptions = {}
): Promise<ProcessedImage[]> {
  return Promise.all(inputs.map((input) => processImage(input, options)));
}

/**
 * Quick check if a file appears to be an image based on magic bytes
 */
export function isImageBuffer(buffer: Buffer): boolean {
  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 12) return false;

  // Check magic bytes for common image formats
  const header = buffer.slice(0, 12);

  // JPEG: FF D8 FF
  if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  ) {
    return true;
  }

  // WebP: RIFF....WEBP
  if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return true;
  }

  // GIF: GIF87a or GIF89a
  if (
    header[0] === 0x47 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x38
  ) {
    return true;
  }

  // HEIF/HEIC: ftyp at offset 4
  if (
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  ) {
    return true;
  }

  // BMP: BM
  if (header[0] === 0x42 && header[1] === 0x4d) {
    return true;
  }

  // TIFF: II or MM
  if (
    (header[0] === 0x49 && header[1] === 0x49) ||
    (header[0] === 0x4d && header[1] === 0x4d)
  ) {
    return true;
  }

  return false;
}
