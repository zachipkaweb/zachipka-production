/** Checks if a given image source points to a Cloudinary CDN upload */
export function isCloudinaryUrl(src) {
  return typeof src === "string" && src.includes("res.cloudinary.com") && src.includes("/upload/");
}
