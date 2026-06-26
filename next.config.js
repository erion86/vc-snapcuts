/** @type {import('next').NextConfig} */
const nextConfig = {
  // ── Cloudinary image loader ────────────────────────────────────────
  // All product images stored as Cloudinary public_ids in Firestore.
  // next/image calls this loader → auto WebP/AVIF + responsive sizes.
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.ts",
    // Fallback domains for any direct URLs (admin uploads, etc.)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },

  // ── Experimental features ─────────────────────────────────────────
  experimental: {
    // Server Actions (for checkout, form handling)
    serverActions: {
      allowedOrigins: ["localhost:3000"],
    },
    // Keep firebase-admin out of the webpack bundle (server-only native deps)
    serverComponentsExternalPackages: ["firebase-admin"],
  },

  // ── Security headers ──────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect /admin to /admin/dashboard
      {
        source:      "/admin",
        destination: "/admin/dashboard",
        permanent:   false,
      },
    ];
  },
};

module.exports = nextConfig;
