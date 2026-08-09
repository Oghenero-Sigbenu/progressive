import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  // Keep large downloadables (the ~13MB AYD programme) out of the precache
  // manifest — otherwise every first visit pulls it during SW install.
  publicExcludes: ["!downloads/**/*"],
  fallbacks: {
    document: "/offline",
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack(config) {
    // Next handles .mp4 with a default rule that returns a StaticImageData-ish
    // object, but our <video src={bg}> expects a URL string. Route mp4s
    // through asset/resource for raw-URL output.
    config.module.rules.push({
      test: /\.mp4$/i,
      type: "asset/resource",
    });
    return config;
  },
};

export default withPWA(nextConfig);
