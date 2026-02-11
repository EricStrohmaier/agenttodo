import { NextRequest, NextResponse } from "next/server";
import { unlink } from "fs/promises";
import path from "path";

interface DeleteImageRequest {
  imageUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DeleteImageRequest = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    // Security: Only allow deleting images from specific directories
    const allowedPaths = [
      "/images/books/",
      "/images/styles/",
      "/images/covers/",
    ];

    const isAllowedPath = allowedPaths.some((allowedPath) =>
      imageUrl.startsWith(allowedPath)
    );

    if (!isAllowedPath) {
      console.warn(`Attempted to delete image from disallowed path: ${imageUrl}`);
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 }
      );
    }

    // Prevent path traversal attacks
    const normalizedPath = path.normalize(imageUrl);
    if (normalizedPath.includes("..")) {
      console.warn(`Attempted path traversal in delete request: ${imageUrl}`);
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 }
      );
    }

    // Construct the full file path
    const filePath = path.join(process.cwd(), "public", normalizedPath);

    // Verify the file is within the public directory
    const publicDir = path.join(process.cwd(), "public");
    if (!filePath.startsWith(publicDir)) {
      console.warn(`Attempted to delete file outside public directory: ${filePath}`);
      return NextResponse.json(
        { error: "Invalid image path" },
        { status: 400 }
      );
    }

    // Try to delete the file
    try {
      await unlink(filePath);
      console.log(`Deleted image: ${filePath}`);
      return NextResponse.json({ success: true });
    } catch (unlinkError) {
      // File might not exist, which is fine
      if ((unlinkError as NodeJS.ErrnoException).code === "ENOENT") {
        console.log(`Image already deleted or doesn't exist: ${filePath}`);
        return NextResponse.json({ success: true });
      }
      throw unlinkError;
    }
  } catch (error) {
    console.error("Delete image error:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}
