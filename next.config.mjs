/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  allowedDevOrigins: ["192.168.3.33"],
  images: {
    formats: ["image/webp"],
    qualities: [75, 85, 90, 95, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  // Security headers: Clickjacking protection & indexing prevention for staging / admin
  async headers() {
    return [
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: ".*\\.(railway\\.app|vercel\\.app|onrender\\.com|netlify\\.app|fly\\.dev|pages\\.dev)$",
          },
        ],
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
        ],
      },
    ];
  },
};

export default nextConfig;
