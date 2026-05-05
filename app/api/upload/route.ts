import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export const maxDuration = 30; // Vercel Pro / hobby: up to 60s

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB  ✅ updated
const MAX_FILES     = 5;

export async function POST(req: NextRequest) {
  try {
    // Guard: env vars must be set
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return NextResponse.json(
        { error: 'Cloudinary not configured. Add env vars.' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const files    = formData.getAll('images').filter((f): f is File => f instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} images allowed` }, { status: 400 });
    }

    // Validate each file before uploading anything
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `"${file.name}" is not a valid image (jpg/png/webp only)` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `"${file.name}" exceeds 10 MB limit` }, // ✅ updated
          { status: 400 }
        );
      }
    }

    // Upload all files in parallel
    const uploadPromises = files.map(async (file) => {
      const bytes  = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise<string>((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: 'birthday-wishes',
              resource_type: 'image',
              // Auto-optimize and resize to max 900px, face-aware crop
              transformation: [
                {
                  width: 900,
                  height: 900,
                  crop: 'fill',
                  gravity: 'auto:faces',
                  quality: 'auto:good',
                  fetch_format: 'auto',
                },
              ],
            },
            (error, result) => {
              if (error || !result) reject(error ?? new Error('Upload failed'));
              else resolve(result.secure_url);
            }
          )
          .end(buffer);
      });
    });

    const urls = await Promise.all(uploadPromises);
    return NextResponse.json({ urls }, { status: 200 });

  } catch (err) {
    console.error('[/api/upload] error:', err);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}