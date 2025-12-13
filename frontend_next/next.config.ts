import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Define an explicit root so Turbopack no intente salir del proyecto.
  turbopack: {
    root: path.join(__dirname),
  },
  // Genera la carpeta standalone para imágenes más ligeras en producción.
  output: "standalone",
  // Permite acceder desde tu IP de LAN en dev sin warnings.
  allowedDevOrigins: ["http://localhost:3000", "http://127.0.0.1:3000", "http://192.168.1.70:3000"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
