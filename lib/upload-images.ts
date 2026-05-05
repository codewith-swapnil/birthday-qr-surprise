const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES     = 2;

export async function uploadImages(files: File[]): Promise<string[]> {
  // ── 1. Validate on client before any network call ──────────────────────────
  if (files.length === 0)        throw new Error('No images provided');
  if (files.length > MAX_FILES)  throw new Error(`Maximum ${MAX_FILES} images allowed`);

  for (const file of files) {
    if (!ALLOWED_TYPES.includes(file.type))
      throw new Error(`"${file.name}" must be jpg / png / webp`);
    if (file.size > MAX_FILE_SIZE)
      throw new Error(`"${file.name}" exceeds 10 MB`);
  }

  // ── 2. Fetch one signature (valid for all uploads in this batch) ────────────
  const sigRes = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ count: files.length }),
  });

  if (!sigRes.ok) {
    const { error } = await sigRes.json();
    throw new Error(error ?? 'Failed to get upload signature');
  }

  const { signature, timestamp, folder, cloud_name, api_key } = await sigRes.json();

  // ── 3. Upload every file in parallel directly to Cloudinary ────────────────
  const uploadOne = async (file: File): Promise<string> => {
    const fd = new FormData();
    fd.append('file',       file);
    fd.append('api_key',    api_key);
    fd.append('timestamp',  String(timestamp));
    fd.append('signature',  signature);
    fd.append('folder',     folder);
    // Same transformation params that were previously server-side
    fd.append('transformation', 'w_900,h_900,c_fill,g_auto:faces,q_auto:good,f_auto');

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`,
      { method: 'POST', body: fd },
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err?.error?.message ?? `Upload failed for ${file.name}`);
    }

    const data = await res.json();
    return data.secure_url as string;
  };

  return Promise.all(files.map(uploadOne));
}