export async function uploadToCloudinary(file: File) {
  const url = `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/upload`;
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string);
  const res = await fetch(url, { method: "POST", body: form });
  return res.json();
}
