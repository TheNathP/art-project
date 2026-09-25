/** @type {import("next").NextConfig} */
const nextConfig = {
  reactCompiler: true,

  images: {
    loader: "custom",
    loaderFile: "./src/app/lib/wikimedia.js",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
