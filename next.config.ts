import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Không dùng Cache Components (mô hình cache mới của Next 16): web này dùng
  // mô hình cache cổ điển — `export const revalidate` ở trang + `next:
  // { revalidate }` ở fetch — đơn giản và đủ cho trang nội dung.
  // Build ra bản standalone để chạy bằng Docker trên VPS mà không cần node_modules.
  output: "standalone",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
