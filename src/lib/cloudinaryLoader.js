// ============================================================================
// Cloudinary Image Loader & URL Optimizer
// Automatically injects responsive widths, auto-format (WebP/AVIF), and quality parameters.
// ============================================================================

/** Checks if a given image source points to a Cloudinary CDN upload */
export function isCloudinaryUrl(src) {
  return typeof src === "string" && src.includes("res.cloudinary.com") && src.includes("/upload/");
}

/** Injects transformation parameters (f_auto, q_auto:best, w_<width>, c_limit) into Cloudinary URLs */
export function optimizeCloudinaryUrl(src, width = 1400) {
  if (!isCloudinaryUrl(src)) return src;
  if (src.includes("/upload/f_auto")) return src;
  return src.replace("/upload/", `/upload/f_auto,q_auto:best,w_${width},c_limit/`);
}

/** Custom Next.js Image loader providing on-the-fly Cloudinary transformations */
export default function cloudinaryLoader({ src, width, quality }) {
  if (isCloudinaryUrl(src)) {
    const q = quality ? `q_${quality}` : "q_auto:best";
    if (src.includes("/upload/f_auto")) return src;
    return src.replace("/upload/", `/upload/f_auto,${q},w_${width},c_limit/`);
  }
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 90}`;
}
