import "./env.js";
import { env } from "./env.js";

const config: import("next").NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: env.NEXT_PUBLIC_UPLOADTHING_CDN || "",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default config;
