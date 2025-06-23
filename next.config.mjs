/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your other Next.js config options can go here
  webpack: (config, { isServer }) => {
    // This is the important part
    if (isServer) {
      config.module.rules.push({
        test: /\.node$/,
        use: "node-loader",
      });
    }

    // Important: return the modified config
    return config;
  },
};

export default nextConfig;
