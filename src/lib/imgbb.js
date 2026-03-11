const API_KEY = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

/**
 * Uploads an image file to ImgBB and returns the hosted URLs.
 * @param {File} file - The image file to upload
 * @returns {Promise<{url: string, displayUrl: string, thumb: string, deleteUrl: string}>}
 */
export async function uploadToImgBB(file) {
  if (!file) throw new Error("No file provided");
  if (!API_KEY) throw new Error("ImgBB API key is not configured");

  if (!file.type.startsWith("image/")) {
    throw new Error("Only image files are allowed (PNG, JPG, WEBP, GIF)");
  }
  if (file.size > 32 * 1024 * 1024) {
    throw new Error("Image size must be less than 32MB");
  }

  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${API_KEY}`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    throw new Error(`ImgBB request failed (HTTP ${res.status})`);
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error?.message || "ImgBB upload failed");
  }

  return {
    url: json.data.url,
    displayUrl: json.data.display_url,
    thumb: json.data.thumb?.url || json.data.url,
    deleteUrl: json.data.delete_url,
  };
}
