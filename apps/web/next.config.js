/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ai-fortune-teller/ui"],
  images: {
    domains: ["ipfs.io", "gateway.pinata.cloud"],
  },
  async redirects() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: `https://api.farcaster.xyz/miniapps/hosted-manifest/${process.env.HOSTED_MANIFEST_ID || "placeholder"}`,
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

