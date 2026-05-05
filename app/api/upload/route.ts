import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const MAX_FILES = 2;

/** Returns a signed upload signature the client uses to POST directly to Cloudinary */
export async function POST(req: Request) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 503 });
  }

  const { count = 1 } = await req.json().catch(() => ({}));

  if (count > MAX_FILES) {
    return NextResponse.json({ error: `Max ${MAX_FILES} images allowed` }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder    = 'birthday-wishes';

  // Sign the params that must match what the client sends
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return NextResponse.json({
    signature,
    timestamp,
    folder,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
  });
}