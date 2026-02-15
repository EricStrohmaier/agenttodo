/**
 * Supabase Storage utilities
 *
 * Handles file uploads to Supabase Storage buckets.
 * Buckets:
 * - photos: Public, user-uploaded reference photos (path: {userId}/{filename})
 * - generated: Public, AI-generated images (path: {userId}/{filename})
 * - exports: Private, PDF exports (path: {userId}/{filename})
 *
 * All uploaded images are automatically:
 * - Converted to JPEG format for broad compatibility
 * - Resized if larger than 2048px
 * - Compressed with quality settings that balance size and clarity
 */

import { createClient } from "@/utils/supabase/server";
import { nanoid } from "nanoid";
import { processImage, isImageBuffer } from "./image-processing";

// =============================================================================
// Types
// =============================================================================

export type StorageBucket = "photos" | "generated" | "exports";

export interface UploadResult {
  path: string;
  publicUrl?: string;
}

export interface UploadOptions {
  /** Custom filename (without extension). If not provided, generates UUID */
  filename?: string;
  /** Content type override */
  contentType?: string;
  /** Whether to upsert (overwrite if exists) */
  upsert?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get file extension from MIME type
 */
function getExtensionFromMime(mimeType: string): string {
  const extensions: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return extensions[mimeType.toLowerCase()] || "jpg";
}

/**
 * Generate a unique filename
 */
function generateFilename(prefix: string, extension: string): string {
  const timestamp = Date.now();
  const id = nanoid(8);
  return `${prefix}_${timestamp}_${id}.${extension}`;
}

// =============================================================================
// Upload Functions
// =============================================================================

/**
 * Upload a photo to the photos bucket (private)
 *
 * Automatically processes the image:
 * - Converts any format (JPEG, PNG, HEIC, etc.) to WebP
 * - Resizes if larger than 2048px
 * - Compresses for optimal storage
 *
 * @param userId - The authenticated user's ID
 * @param file - The file to upload (File or Buffer with contentType)
 * @param options - Upload options
 * @returns Upload result with storage path and public URL
 */
export async function uploadPhoto(
  userId: string,
  file: File | { buffer: Buffer; contentType: string; name?: string },
  options: UploadOptions = {}
): Promise<UploadResult> {
  console.log("[uploadPhoto] Starting upload for user:", userId);
  console.log("[uploadPhoto] File param type:", file ? (file instanceof File ? "File" : "BufferObject") : "undefined");

  // Validate file param exists
  if (!file) {
    throw new Error("No file provided to uploadPhoto");
  }

  const supabase = await createClient();

  // Extract file buffer
  let inputBuffer: Buffer;
  let originalName: string;

  try {
    if (file instanceof File) {
      console.log("[uploadPhoto] Processing File object:", {
        name: file.name,
        type: file.type,
        size: file.size,
      });

      if (file.size === 0) {
        throw new Error("File is empty (0 bytes)");
      }

      const arrayBuffer = await file.arrayBuffer();
      console.log("[uploadPhoto] ArrayBuffer length:", arrayBuffer?.byteLength);

      if (!arrayBuffer || arrayBuffer.byteLength === 0) {
        throw new Error("Failed to read file contents");
      }

      inputBuffer = Buffer.from(arrayBuffer);
      originalName = file.name || "photo";
    } else {
      console.log("[uploadPhoto] Processing buffer object:", {
        hasBuffer: !!file?.buffer,
        bufferLength: file?.buffer?.length,
        contentType: file?.contentType,
        name: file?.name,
      });

      if (!file.buffer) {
        throw new Error("Buffer object missing buffer property");
      }

      inputBuffer = file.buffer;
      originalName = file.name || "photo";
    }
  } catch (extractError) {
    console.error("[uploadPhoto] Error extracting file data:", extractError);
    throw new Error(`Failed to read file data: ${extractError instanceof Error ? extractError.message : "Unknown error"}`);
  }

  console.log("[uploadPhoto] Buffer ready:", {
    length: inputBuffer?.length,
    originalName,
  });

  // Validate file size before processing
  if (!inputBuffer) {
    throw new Error(`Failed to create buffer for: ${originalName}`);
  }

  if (inputBuffer.length === 0) {
    throw new Error(`Empty file: ${originalName}`);
  }

  if (inputBuffer.length > MAX_PHOTO_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_PHOTO_SIZE / 1024 / 1024}MB`);
  }

  // Validate it's actually an image using magic bytes
  if (!isImageBuffer(inputBuffer)) {
    throw new Error(`Invalid image file: ${originalName}. Please upload a valid image.`);
  }

  console.log("[uploadPhoto] Validation passed, processing image...");

  // Process the image: convert to JPEG, resize, compress
  const processed = await processImage(inputBuffer, {
    maxWidth: 2048,
    maxHeight: 2048,
    quality: 80, // Good balance of quality vs file size
    format: "jpeg",
  });

  console.log(
    `[uploadPhoto] Processed ${originalName}: ${Math.round(processed.originalSize / 1024)}KB -> ${Math.round(processed.processedSize / 1024)}KB (${processed.width}x${processed.height})`
  );

  // Generate filename with correct extension
  const filename = options.filename
    ? `${options.filename}.${processed.extension}`
    : generateFilename("photo", processed.extension);

  // Path format: {userId}/{filename}
  const storagePath = `${userId}/${filename}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from("photos")
    .upload(storagePath, processed.buffer, {
      contentType: processed.contentType,
      upsert: options.upsert ?? false,
    });

  if (error) {
    throw new Error(`Failed to upload photo: ${error.message}`);
  }

  // Get public URL since photos bucket is public
  const {
    data: { publicUrl },
  } = supabase.storage.from("photos").getPublicUrl(storagePath);

  return {
    path: storagePath,
    publicUrl,
  };
}

/**
 * Upload a generated image to the generated bucket (public)
 *
 * @param userId - The authenticated user's ID
 * @param file - The file to upload
 * @param options - Upload options
 * @returns Upload result with storage path and public URL
 */
export async function uploadGeneratedImage(
  userId: string,
  file: File | { buffer: Buffer; contentType: string },
  options: UploadOptions = {}
): Promise<UploadResult> {
  const supabase = await createClient();

  // Extract file details
  let buffer: Buffer;
  let contentType: string;

  if (file instanceof File) {
    buffer = Buffer.from(await file.arrayBuffer());
    contentType = file.type;
  } else {
    buffer = file.buffer;
    contentType = file.contentType;
  }

  // Generate filename
  const extension = getExtensionFromMime(contentType);
  const filename =
    options.filename
      ? `${options.filename}.${extension}`
      : generateFilename("generated", extension);

  // Path format: {userId}/{filename}
  const storagePath = `${userId}/${filename}`;

  // Upload to Supabase Storage
  const { error } = await supabase.storage
    .from("generated")
    .upload(storagePath, buffer, {
      contentType,
      upsert: options.upsert ?? false,
    });

  if (error) {
    throw new Error(`Failed to upload generated image: ${error.message}`);
  }

  // Get public URL since generated bucket is public
  const {
    data: { publicUrl },
  } = supabase.storage.from("generated").getPublicUrl(storagePath);

  return {
    path: `generated/${storagePath}`, // Include bucket name for clarity
    publicUrl,
  };
}

/**
 * Get a public URL for a file in the photos bucket
 *
 * @param path - The file path within the photos bucket
 * @returns Public URL
 */
export function getPhotoPublicUrl(path: string): string {
  // Use the Supabase project URL to construct the public URL directly
  // This avoids needing an async supabase client just for URL construction
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return `${supabaseUrl}/storage/v1/object/public/photos/${path}`;
}

/**
 * Delete a file from storage
 *
 * @param bucket - The storage bucket
 * @param path - The file path
 */
export async function deleteFile(
  bucket: StorageBucket,
  path: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * List files in a user's folder
 *
 * @param bucket - The storage bucket
 * @param userId - The user's ID
 * @returns Array of file objects
 */
export async function listUserFiles(
  bucket: StorageBucket,
  userId: string
): Promise<{ name: string; id: string; created_at: string }[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.storage.from(bucket).list(userId);

  if (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }

  return data || [];
}
