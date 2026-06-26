/**
 * Cloudinary loader for next/image
 *
 * Accepts either:
 *  - A Cloudinary public_id  → builds a full CDN URL with transformations
 *  - A full https:// URL     → passes through as-is (fallback)
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dtrbgu9k4";

interface CloudinaryLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function cloudinaryLoader({
  src,
  width,
  quality = 80,
}: CloudinaryLoaderProps): string {
  // Full URLs: apply width for Unsplash; pass through others
  if (src.startsWith("http://") || src.startsWith("https://")) {
    if (src.includes("images.unsplash.com")) {
      const url = new URL(src);
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", String(quality));
      return url.toString();
    }
    return src;
  }

  // Build Cloudinary transformation string
  // f_auto  → serve WebP/AVIF based on browser
  // q_auto  → smart quality (use our quality hint)
  // w_{n}   → resize to requested width
  // c_limit → only shrink, never upscale
  const params = [
    "f_auto",
    `q_${quality}`,
    `w_${width}`,
    "c_limit",
    "dpr_auto",
  ].join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${params}/${src}`;
}

/**
 * Helper: build a Cloudinary URL without next/image
 * Useful for OG images, email templates, etc.
 */
export function buildCloudinaryUrl(
  publicId: string,
  options: { width?: number; height?: number; quality?: number; crop?: string } = {}
): string {
  const { width, height, quality = 80, crop = "fill" } = options;

  const params = [
    "f_auto",
    `q_${quality}`,
    width  && `w_${width}`,
    height && `h_${height}`,
    (width || height) && `c_${crop}`,
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${params}/${publicId}`;
}
