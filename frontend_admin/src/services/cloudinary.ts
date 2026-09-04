export async function uploadToCloudinary(file: File): Promise<{ secure_url: string; public_id: string }> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/upload`;
  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', uploadPreset);
  form.append('folder', 'hero');
  const res = await fetch(url, { method: 'POST', body: form });
  if (!res.ok) throw new Error('Upload thất bại');
  return res.json();
}
