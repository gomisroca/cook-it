import "./src/env.js";
import { env } from "./env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: env.UPLOADTHING_CDN || "",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default config;
